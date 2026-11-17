import { rtdb } from '../firebase';
import { ref, onValue, runTransaction, set } from 'firebase/database';

export interface UserAccessRecord {
  userKey: string;
  name: string;
  email: string;
  role: string;
  accessCount: number;
  totalOnlineMs: number;
  lastAccessAt: number;
  lastSeenAt: number;
  currentSessionStart?: number | null;
  isOnline?: boolean;
}

const LOCAL_ACCESS_STATS_KEY = 'pgr_access_stats_v1';
const ACCESS_EVENT_NAME = 'pgr_access_stats_updated';
const ONLINE_HEARTBEAT_STALE_MS = 45_000;

export function normalizeUserAccessKey(email?: string, name?: string): string {
  const cleanEmail = (email || '').trim().toLowerCase();
  const base = cleanEmail || `name_${(name || 'usuario').trim().toLowerCase()}`;
  return base.replace(/[.#$\[\]\/]/g, '_');
}

function loadLocalAccessStats(): Record<string, UserAccessRecord> {
  try {
    const raw = localStorage.getItem(LOCAL_ACCESS_STATS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveLocalAccessStats(map: Record<string, UserAccessRecord>): void {
  try {
    localStorage.setItem(LOCAL_ACCESS_STATS_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT_NAME));
  } catch {
    // ignore
  }
}

export function isUserCurrentlyOnline(record: Partial<UserAccessRecord>, now = Date.now()): boolean {
  if (!record.isOnline) return false;
  const lastSeen = Number(record.lastSeenAt || 0);
  return lastSeen > 0 && now - lastSeen <= ONLINE_HEARTBEAT_STALE_MS;
}

export function formatOnlineDuration(ms: number): string {
  const safeMs = Math.max(0, Math.floor(ms));
  const totalSeconds = Math.floor(safeMs / 1000);
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}min ${String(seconds).padStart(2, '0')}s`;
  }
  return `${minutes}min ${String(seconds).padStart(2, '0')}s`;
}

export async function recordUserSessionStart(user: {
  email?: string;
  name?: string;
  role?: string;
  roleLabel?: string;
}): Promise<void> {
  const email = String(user.email || '').trim().toLowerCase();
  const name = String(user.name || email.split('@')[0] || 'Usuário').trim();
  const roleLabel = String(
    user.roleLabel || (user.role === 'admin' || user.role === 'Administrador' ? 'Administrador' : 'Agente de Risco')
  ).trim();
  const userKey = normalizeUserAccessKey(email, name);
  const now = Date.now();

  // Mirror locally immediately
  const localMap = loadLocalAccessStats();
  const existingLocal = localMap[userKey];
  localMap[userKey] = {
    userKey,
    name: name || existingLocal?.name || 'Usuário',
    email: email || existingLocal?.email || '',
    role: roleLabel,
    accessCount: (Number(existingLocal?.accessCount) || 0) + 1,
    totalOnlineMs: Number(existingLocal?.totalOnlineMs) || 0,
    lastAccessAt: now,
    lastSeenAt: now,
    currentSessionStart: now,
    isOnline: true,
  };
  saveLocalAccessStats(localMap);

  try {
    const statRef = ref(rtdb, `user_access_stats/${userKey}`);
    await runTransaction(statRef, (current) => {
      const curr = current && typeof current === 'object' ? current : {};
      return {
        userKey,
        name: name || curr.name || 'Usuário',
        email: email || curr.email || '',
        role: roleLabel,
        accessCount: (Number(curr.accessCount) || 0) + 1,
        totalOnlineMs: Number(curr.totalOnlineMs) || 0,
        lastAccessAt: now,
        lastSeenAt: now,
        currentSessionStart: now,
        isOnline: true,
      };
    });
  } catch {
    // ignore offline errors
  }
}

export async function heartbeatUserOnlineTime(
  user: {
    email?: string;
    name?: string;
    role?: string;
    roleLabel?: string;
  },
  deltaMs: number,
  keepOnline = true
): Promise<void> {
  const safeDelta = Math.max(0, Math.min(Math.floor(deltaMs), 65_000));
  const email = String(user.email || '').trim().toLowerCase();
  const name = String(user.name || email.split('@')[0] || 'Usuário').trim();
  const roleLabel = String(
    user.roleLabel || (user.role === 'admin' || user.role === 'Administrador' ? 'Administrador' : 'Agente de Risco')
  ).trim();
  const userKey = normalizeUserAccessKey(email, name);
  const now = Date.now();

  const localMap = loadLocalAccessStats();
  const existingLocal = localMap[userKey];
  if (existingLocal) {
    localMap[userKey] = {
      ...existingLocal,
      name: name || existingLocal.name,
      email: email || existingLocal.email,
      role: roleLabel,
      totalOnlineMs: (Number(existingLocal.totalOnlineMs) || 0) + safeDelta,
      lastSeenAt: now,
      isOnline: keepOnline,
      currentSessionStart: keepOnline ? (existingLocal.currentSessionStart || now) : null,
    };
    saveLocalAccessStats(localMap);
  }

  try {
    const statRef = ref(rtdb, `user_access_stats/${userKey}`);
    await runTransaction(statRef, (current) => {
      const curr = current && typeof current === 'object' ? current : {};
      return {
        userKey,
        name: name || curr.name || 'Usuário',
        email: email || curr.email || '',
        role: roleLabel,
        accessCount: Math.max(1, Number(curr.accessCount) || 1),
        totalOnlineMs: (Number(curr.totalOnlineMs) || 0) + safeDelta,
        lastAccessAt: Number(curr.lastAccessAt) || now,
        lastSeenAt: now,
        isOnline: keepOnline,
        currentSessionStart: keepOnline ? (curr.currentSessionStart || now) : null,
      };
    });
  } catch {
    // ignore offline errors
  }
}

export function subscribeUserAccessStats(
  callback: (records: UserAccessRecord[]) => void
): () => void {
  const toArray = (map: Record<string, any>): UserAccessRecord[] =>
    Object.entries(map || {})
      .filter(([, val]) => val && typeof val === 'object')
      .map(([key, val]: [string, any]) => ({
        userKey: String(val.userKey || key),
        name: String(val.name || 'Usuário'),
        email: String(val.email || ''),
        role: String(val.role || 'Agente de Risco'),
        accessCount: Number(val.accessCount) || 0,
        totalOnlineMs: Number(val.totalOnlineMs) || 0,
        lastAccessAt: Number(val.lastAccessAt) || 0,
        lastSeenAt: Number(val.lastSeenAt) || 0,
        currentSessionStart: val.currentSessionStart ?? null,
        isOnline: Boolean(val.isOnline),
      }));

  callback(toArray(loadLocalAccessStats()));

  const handleLocal = () => {
    callback(toArray(loadLocalAccessStats()));
  };
  window.addEventListener(ACCESS_EVENT_NAME, handleLocal);

  let unsubFirebase = () => {};
  try {
    const statsRef = ref(rtdb, 'user_access_stats');
    unsubFirebase = onValue(statsRef, (snapshot) => {
      const val = snapshot.val();
      if (val && typeof val === 'object') {
        const list = toArray(val);
        const map: Record<string, UserAccessRecord> = {};
        list.forEach((item) => {
          map[item.userKey] = item;
        });
        saveLocalAccessStats(map);
        callback(list);
      } else {
        saveLocalAccessStats({});
        callback([]);
      }
    });
  } catch {
    // ignore
  }

  return () => {
    window.removeEventListener(ACCESS_EVENT_NAME, handleLocal);
    unsubFirebase();
  };
}

export async function resetAllUserAccessStats(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_ACCESS_STATS_KEY);
    window.dispatchEvent(new CustomEvent(ACCESS_EVENT_NAME));
  } catch {
    // ignore
  }
  try {
    await set(ref(rtdb, 'user_access_stats'), null);
  } catch {
    // ignore
  }
}
