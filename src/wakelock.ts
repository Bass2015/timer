let lock: WakeLockSentinel | null = null;
let wanted = false;

async function request(): Promise<void> {
  if (!wanted || lock || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return;
  try {
    lock = await navigator.wakeLock.request('screen');
    lock.addEventListener('release', () => (lock = null));
  } catch {
    /* denied (e.g. battery saver): the timer still works, the screen may just dim */
  }
}

// The browser drops the lock whenever the app goes to the background.
document.addEventListener('visibilitychange', () => void request());

export function keepScreenOn(): void {
  wanted = true;
  void request();
}

export function releaseScreen(): void {
  wanted = false;
  void lock?.release();
  lock = null;
}
