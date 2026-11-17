import { auth, rtdb } from '../firebase';
import { ref, push, onValue, set } from 'firebase/database';

export type AuditActionType = 'ADD' | 'EDIT' | 'DELETE';

export interface AuditHistoryEntry {
  id: string;
  userName: string;
  userEmail: string;
  userRole: string;
  action: AuditActionType;
  module: string;
  target: string;
  details?: string;
  timestamp: number;
}

export interface LogAuditParams {
  action: AuditActionType;
  module: string;
  target: string;
  details?: string;
}

const LOCAL_HISTORY_KEY = 'pgr_audit_history_v1';
const HISTORY_EVENT_NAME = 'pgr_audit_history_updated';
const MAX_LOCAL_ENTRIES = 1000;

export function getCurrentActor(): { userName: string; userEmail: string; userRole: string } {
  try {
    const raw = localStorage.getItem('logged_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      const email = String(parsed?.email || auth.currentUser?.email || 'sem-email@sistema').trim();
      const name = String(parsed?.name || email.split('@')[0] || 'Usuário').trim();
      const role = String(
        parsed?.roleLabel || (parsed?.role === 'admin' ? 'Administrador' : 'Agente de Risco')
      ).trim();
      return { userName: name, userEmail: email, userRole: role };
    }
  } catch {
    // ignore storage read error
  }

  const fallbackEmail = auth.currentUser?.email || localStorage.getItem('user_email') || 'sistema@centralgr';
  return {
    userName: fallbackEmail.split('@')[0] || 'Usuário',
    userEmail: fallbackEmail,
    userRole: 'Operacional'
  };
}

export function getStoredAuditHistory(): AuditHistoryEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
  } catch {
    // ignore
  }
  return [];
}

function saveLocalAuditHistory(entries: AuditHistoryEntry[]) {
  try {
    const trimmed = [...entries]
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, MAX_LOCAL_ENTRIES);
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function logAuditAction(params: LogAuditParams): void {
  const actor = getCurrentActor();
  const timestamp = Date.now();
  const id = `hist_${timestamp}_${Math.random().toString(36).slice(2, 8)}`;

  const entry: AuditHistoryEntry = {
    id,
    userName: actor.userName,
    userEmail: actor.userEmail,
    userRole: actor.userRole,
    action: params.action,
    module: params.module,
    target: params.target.trim() || '-',
    details: params.details ? params.details.trim() : '',
    timestamp
  };

  try {
    const existing = getStoredAuditHistory();
    saveLocalAuditHistory([entry, ...existing]);
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT_NAME, { detail: entry }));
  } catch {
    // ignore
  }

  try {
    const historyRef = ref(rtdb, 'audit_history');
    push(historyRef, entry).catch(() => {});
  } catch {
    // ignore firebase write failure silently so UI never blocks
  }
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function logDebouncedEdit(
  debounceKey: string,
  params: LogAuditParams,
  delayMs = 1400
): void {
  const prev = debounceTimers.get(debounceKey);
  if (prev) {
    clearTimeout(prev);
  }
  const timer = setTimeout(() => {
    debounceTimers.delete(debounceKey);
    logAuditAction(params);
  }, delayMs);
  debounceTimers.set(debounceKey, timer);
}

export function subscribeAuditHistory(
  callback: (entries: AuditHistoryEntry[]) => void
): () => void {
  callback(getStoredAuditHistory());

  const handleLocalEvent = () => {
    callback(getStoredAuditHistory());
  };
  window.addEventListener(HISTORY_EVENT_NAME, handleLocalEvent);

  let unsubscribeFirebase = () => {};
  try {
    const historyRef = ref(rtdb, 'audit_history');
    unsubscribeFirebase = onValue(historyRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        callback(getStoredAuditHistory());
        return;
      }

      const remoteEntries: AuditHistoryEntry[] = [];
      if (Array.isArray(val)) {
        val.forEach((item) => {
          if (item && item.timestamp) remoteEntries.push(item);
        });
      } else if (typeof val === 'object') {
        Object.entries(val).forEach(([fbKey, item]: [string, any]) => {
          if (item && typeof item === 'object' && item.timestamp) {
            remoteEntries.push({
              ...item,
              id: item.id || fbKey
            });
          }
        });
      }

      const sorted = remoteEntries.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
      saveLocalAuditHistory(sorted);
      callback(sorted);
    });
  } catch {
    // ignore
  }

  return () => {
    window.removeEventListener(HISTORY_EVENT_NAME, handleLocalEvent);
    unsubscribeFirebase();
  };
}

export async function clearAllAuditHistory(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_HISTORY_KEY);
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT_NAME));
  } catch {
    // ignore
  }
  try {
    await set(ref(rtdb, 'audit_history'), null);
  } catch {
    // ignore
  }
}
