import {
  ref,
  onValue as fbOnValue,
  set as fbSet,
  update as fbUpdate,
  remove as fbRemove,
  push as fbPush,
  get,
  child,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  equalTo,
  startAt,
  endAt,
  runTransaction,
  serverTimestamp,
  off,
  type DatabaseReference,
  type DataSnapshot,
  type Query,
  type ThenableReference,
  type ListenOptions,
} from 'firebase/database';
import {
  isUndoRecordingPaused,
  recordUndoOperation,
  runWithSyncIgnored,
} from './undoManager';

export {
  ref,
  get,
  child,
  query,
  orderByChild,
  orderByKey,
  limitToLast,
  limitToFirst,
  equalTo,
  startAt,
  endAt,
  runTransaction,
  serverTimestamp,
  off,
};

const IGNORED_RTDB_PREFIXES = ['audit_history', 'user_access_stats', 'system'];
const shadowCache = new Map<string, any>();

function deepClone<T>(val: T): T {
  if (val === undefined || val === null) return val;
  try {
    return JSON.parse(JSON.stringify(val));
  } catch {
    return val;
  }
}

function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === undefined && b === null) return true;
  if (a === null && b === undefined) return true;
  try {
    return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
  } catch {
    return false;
  }
}

function getRefPath(reference: Query | DatabaseReference): string {
  try {
    const urlStr = reference.toString();
    const url = new URL(urlStr);
    return decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '');
  } catch {
    return String(reference).replace(/^\/+|\/+$/g, '');
  }
}

function isIgnoredRtdbPath(path: string): boolean {
  if (!path) return false;
  return IGNORED_RTDB_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}

function getNestedValue(obj: any, parts: string[]): { found: boolean; value: any } {
  let curr = obj;
  for (const part of parts) {
    if (curr === null || curr === undefined || typeof curr !== 'object') {
      return { found: true, value: null };
    }
    curr = curr[part];
  }
  return { found: true, value: curr === undefined ? null : deepClone(curr) };
}

function setNestedValue(obj: any, parts: string[], value: any): any {
  if (parts.length === 0) return deepClone(value);
  const root = obj && typeof obj === 'object' ? deepClone(obj) : {};
  let curr = root;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!curr[key] || typeof curr[key] !== 'object') {
      curr[key] = {};
    }
    curr = curr[key];
  }
  const lastKey = parts[parts.length - 1];
  if (value === null || value === undefined) {
    if (Array.isArray(curr)) {
      const idx = Number(lastKey);
      if (!Number.isNaN(idx)) curr[idx] = null;
    } else {
      delete curr[lastKey];
    }
  } else {
    curr[lastKey] = deepClone(value);
  }
  return root;
}

function getCachedAtPath(path: string): { found: boolean; value: any } {
  if (shadowCache.has(path)) {
    return { found: true, value: deepClone(shadowCache.get(path)) };
  }

  // Search cached ancestors (longest match first)
  const parts = path ? path.split('/') : [];
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const ancestorPath = parts.slice(0, i).join('/');
    if (shadowCache.has(ancestorPath)) {
      const ancestorVal = shadowCache.get(ancestorPath);
      const subParts = parts.slice(i);
      return getNestedValue(ancestorVal, subParts);
    }
  }

  return { found: false, value: undefined };
}

function updateShadowCacheAtPath(path: string, value: any): void {
  const cloned = value === undefined ? null : deepClone(value);
  shadowCache.set(path, cloned);

  // Also update any cached ancestor so child reads stay accurate
  const parts = path ? path.split('/') : [];
  for (let i = parts.length - 1; i >= 0; i -= 1) {
    const ancestorPath = parts.slice(0, i).join('/');
    if (shadowCache.has(ancestorPath)) {
      const subParts = parts.slice(i);
      shadowCache.set(
        ancestorPath,
        setNestedValue(shadowCache.get(ancestorPath), subParts, cloned)
      );
    }
  }

  // Remove stale cached descendants
  const prefix = path ? `${path}/` : '';
  for (const existingKey of Array.from(shadowCache.keys())) {
    if (prefix && existingKey.startsWith(prefix)) {
      shadowCache.delete(existingKey);
    }
  }
}

export function onValue(
  queryRef: Query,
  callback: (snapshot: DataSnapshot) => unknown,
  cancelCallbackOrOptions?: ((error: Error) => unknown) | ListenOptions,
  options?: ListenOptions
) {
  const path = getRefPath(queryRef);
  const wrappedCallback = (snapshot: DataSnapshot) => {
    try {
      if (!isIgnoredRtdbPath(path)) {
        updateShadowCacheAtPath(path, snapshot.val());
      }
    } catch {
      // ignore cache errors
    }
    return runWithSyncIgnored(() => callback(snapshot));
  };

  if (typeof cancelCallbackOrOptions === 'function') {
    return fbOnValue(queryRef, wrappedCallback, cancelCallbackOrOptions, options);
  }
  return fbOnValue(queryRef, wrappedCallback, cancelCallbackOrOptions);
}

export function set(reference: DatabaseReference, value: unknown): Promise<void> {
  const path = getRefPath(reference);
  if (!isIgnoredRtdbPath(path) && !isUndoRecordingPaused()) {
    const cached = getCachedAtPath(path);
    if (cached.found && !isDeepEqual(cached.value, value)) {
      const prevVal = cached.value;
      recordUndoOperation(`Alteração em ${path || 'dados'}`, {
        type: 'rtdb',
        key: path,
        restore: async () => {
          updateShadowCacheAtPath(path, prevVal);
          await fbSet(reference, prevVal ?? null);
        },
      });
    }
    updateShadowCacheAtPath(path, value);
  } else if (!isIgnoredRtdbPath(path)) {
    updateShadowCacheAtPath(path, value);
  }

  return fbSet(reference, value);
}

export function update(
  reference: DatabaseReference,
  values: Record<string, unknown>
): Promise<void> {
  const basePath = getRefPath(reference);
  if (!isIgnoredRtdbPath(basePath) && !isUndoRecordingPaused() && values && typeof values === 'object') {
    const restoreMap: Record<string, any> = {};
    let hasAnyKnownChange = false;

    Object.entries(values).forEach(([relKey, newVal]) => {
      const cleanRel = relKey.replace(/^\/+|\/+$/g, '');
      const fullPath = basePath ? `${basePath}/${cleanRel}` : cleanRel;
      const cached = getCachedAtPath(fullPath);
      if (cached.found) {
        if (!isDeepEqual(cached.value, newVal)) {
          restoreMap[relKey] = cached.value ?? null;
          hasAnyKnownChange = true;
        }
      } else {
        restoreMap[relKey] = null;
        hasAnyKnownChange = true;
      }
      updateShadowCacheAtPath(fullPath, newVal);
    });

    if (hasAnyKnownChange) {
      recordUndoOperation(`Atualização em ${basePath || 'dados'}`, {
        type: 'rtdb',
        key: basePath,
        restore: async () => {
          Object.entries(restoreMap).forEach(([relKey, prevVal]) => {
            const cleanRel = relKey.replace(/^\/+|\/+$/g, '');
            const fullPath = basePath ? `${basePath}/${cleanRel}` : cleanRel;
            updateShadowCacheAtPath(fullPath, prevVal);
          });
          await fbUpdate(reference, restoreMap);
        },
      });
    }
  } else if (!isIgnoredRtdbPath(basePath) && values && typeof values === 'object') {
    Object.entries(values).forEach(([relKey, newVal]) => {
      const cleanRel = relKey.replace(/^\/+|\/+$/g, '');
      const fullPath = basePath ? `${basePath}/${cleanRel}` : cleanRel;
      updateShadowCacheAtPath(fullPath, newVal);
    });
  }

  return fbUpdate(reference, values);
}

export function remove(reference: DatabaseReference): Promise<void> {
  const path = getRefPath(reference);
  if (!isIgnoredRtdbPath(path) && !isUndoRecordingPaused()) {
    const cached = getCachedAtPath(path);
    if (cached.found && cached.value !== null && cached.value !== undefined) {
      const prevVal = cached.value;
      recordUndoOperation(`Remoção em ${path || 'dados'}`, {
        type: 'rtdb',
        key: path,
        restore: async () => {
          updateShadowCacheAtPath(path, prevVal);
          await fbSet(reference, prevVal);
        },
      });
    }
    updateShadowCacheAtPath(path, null);
  } else if (!isIgnoredRtdbPath(path)) {
    updateShadowCacheAtPath(path, null);
  }

  return fbRemove(reference);
}

export function push(
  parent: DatabaseReference,
  value?: unknown
): ThenableReference {
  const basePath = getRefPath(parent);
  const pushedRef = fbPush(parent, value);

  if (
    value !== undefined &&
    pushedRef.key &&
    !isIgnoredRtdbPath(basePath) &&
    !isUndoRecordingPaused()
  ) {
    const childPath = basePath ? `${basePath}/${pushedRef.key}` : pushedRef.key;
    updateShadowCacheAtPath(childPath, value);
    recordUndoOperation(`Novo item em ${basePath || 'dados'}`, {
      type: 'rtdb',
      key: childPath,
      restore: async () => {
        updateShadowCacheAtPath(childPath, null);
        await fbRemove(pushedRef);
      },
    });
  }

  return pushedRef;
}
