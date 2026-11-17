export type UndoOperationType = 'rtdb' | 'localStorage' | 'state';

export interface UndoOperation {
  type: UndoOperationType;
  key?: string;
  restore: () => Promise<void> | void;
}

interface UndoBatch {
  id: string;
  label: string;
  operations: UndoOperation[];
  hadRtdb: boolean;
  hadLocalStorage: boolean;
  hadState: boolean;
  localStorageKeys: string[];
  createdAt: number;
}

const MAX_UNDO_STACK = 45;
const BATCH_WINDOW_MS = 160;
const TAB_MOUNT_SILENCE_MS = 550;

const IGNORED_STORAGE_KEYS = new Set([
  'logged_user',
  'user_email',
  'pgr_audit_history_v1',
  'pgr_access_stats_v1',
  'checklist_seeded_v1',
  'app_undo_ignored',
]);

function isIgnoredStorageKey(key: string): boolean {
  if (!key) return true;
  if (IGNORED_STORAGE_KEYS.has(key)) return true;
  if (key.startsWith('firebase:') || key.startsWith('pgr_access_')) return true;
  return false;
}

let undoStack: UndoBatch[] = [];
let pendingBatch: UndoBatch | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;

let isRestoring = false;
let syncIgnoreDepth = 0;
let silenceUntil = 0;
let interceptorInstalled = false;

export function isUndoRecordingPaused(): boolean {
  return isRestoring || syncIgnoreDepth > 0 || Date.now() < silenceUntil;
}

export function markTabTransitionSilence(durationMs = TAB_MOUNT_SILENCE_MS): void {
  silenceUntil = Math.max(silenceUntil, Date.now() + durationMs);
}

export function runWithSyncIgnored<T>(fn: () => T): T {
  syncIgnoreDepth += 1;
  try {
    return fn();
  } finally {
    syncIgnoreDepth = Math.max(0, syncIgnoreDepth - 1);
  }
}

function flushPendingBatch(): void {
  if (pendingTimer) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
  if (pendingBatch && pendingBatch.operations.length > 0) {
    undoStack.push(pendingBatch);
    if (undoStack.length > MAX_UNDO_STACK) {
      undoStack.shift();
    }
  }
  pendingBatch = null;
}

export function recordUndoOperation(
  label: string,
  op: UndoOperation,
  options?: { force?: boolean }
): void {
  if (!options?.force && isUndoRecordingPaused()) {
    return;
  }

  const now = Date.now();
  if (!pendingBatch || now - pendingBatch.createdAt > BATCH_WINDOW_MS) {
    flushPendingBatch();
    pendingBatch = {
      id: `undo_${now}_${Math.random().toString(36).slice(2, 7)}`,
      label,
      operations: [],
      hadRtdb: false,
      hadLocalStorage: false,
      hadState: false,
      localStorageKeys: [],
      createdAt: now,
    };
  }

  pendingBatch.operations.push(op);
  if (op.type === 'rtdb') pendingBatch.hadRtdb = true;
  if (op.type === 'localStorage') {
    pendingBatch.hadLocalStorage = true;
    if (op.key && !pendingBatch.localStorageKeys.includes(op.key)) {
      pendingBatch.localStorageKeys.push(op.key);
    }
  }
  if (op.type === 'state') pendingBatch.hadState = true;

  if (pendingTimer) clearTimeout(pendingTimer);
  pendingTimer = setTimeout(() => {
    flushPendingBatch();
  }, BATCH_WINDOW_MS);
}

export function pushCustomUndoAction(label: string, restore: () => Promise<void> | void): void {
  recordUndoOperation(
    label,
    {
      type: 'state',
      restore,
    },
    { force: true }
  );
}

export function getUndoStackSize(): number {
  return undoStack.length + (pendingBatch && pendingBatch.operations.length > 0 ? 1 : 0);
}

export async function undoLastAction(): Promise<{
  undone: boolean;
  label?: string;
  hadLocalStorage?: boolean;
  hadRtdb?: boolean;
  localStorageKeys?: string[];
}> {
  flushPendingBatch();
  const batch = undoStack.pop();
  if (!batch) {
    return { undone: false };
  }

  isRestoring = true;
  // Silence follow-up useEffect persistence writes triggered by restored React state
  silenceUntil = Date.now() + 700;

  try {
    for (let i = batch.operations.length - 1; i >= 0; i -= 1) {
      await batch.operations[i].restore();
    }

    if (batch.hadLocalStorage || batch.hadRtdb || batch.hadState) {
      window.dispatchEvent(
        new CustomEvent('pgr_undo_restored', {
          detail: {
            label: batch.label,
            hadLocalStorage: batch.hadLocalStorage,
            hadRtdb: batch.hadRtdb,
            hadState: batch.hadState,
            localStorageKeys: batch.localStorageKeys,
          },
        })
      );
    }

    return {
      undone: true,
      label: batch.label,
      hadLocalStorage: batch.hadLocalStorage,
      hadRtdb: batch.hadRtdb,
      localStorageKeys: batch.localStorageKeys,
    };
  } finally {
    isRestoring = false;
  }
}

export function installLocalStorageUndoInterceptor(): void {
  if (interceptorInstalled || typeof window === 'undefined' || !window.Storage) {
    return;
  }
  interceptorInstalled = true;

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;
  const originalGetItem = Storage.prototype.getItem;

  Storage.prototype.setItem = function (key: string, value: string) {
    const strValue = String(value);
    if (this === window.localStorage && !isIgnoredStorageKey(key) && !isUndoRecordingPaused()) {
      let prevValue: string | null = null;
      try {
        prevValue = originalGetItem.call(this, key);
      } catch {
        prevValue = null;
      }

      if (prevValue !== strValue) {
        recordUndoOperation(`Alteração em ${key}`, {
          type: 'localStorage',
          key,
          restore: () => {
            if (prevValue === null) {
              originalRemoveItem.call(window.localStorage, key);
            } else {
              originalSetItem.call(window.localStorage, key, prevValue);
            }
          },
        });
      }
    }
    return originalSetItem.call(this, key, strValue);
  };

  Storage.prototype.removeItem = function (key: string) {
    if (this === window.localStorage && !isIgnoredStorageKey(key) && !isUndoRecordingPaused()) {
      let prevValue: string | null = null;
      try {
        prevValue = originalGetItem.call(this, key);
      } catch {
        prevValue = null;
      }

      if (prevValue !== null) {
        recordUndoOperation(`Remoção em ${key}`, {
          type: 'localStorage',
          key,
          restore: () => {
            originalSetItem.call(window.localStorage, key, prevValue!);
          },
        });
      }
    }
    return originalRemoveItem.call(this, key);
  };
}
