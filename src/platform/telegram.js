// Единственный модуль, который знает про window.Telegram.
// Каждый вызов защищён проверкой: на старых клиентах половины методов нет,
// и незащищённый вызов даёт белый экран.

const W = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
const available = !!(W && W.initData !== undefined);

function safe(fn, fallback) {
  return (...args) => {
    if (!available) return fallback;
    try {
      return fn(...args);
    } catch (err) {
      console.warn('[telegram]', err);
      return fallback;
    }
  };
}

function has(name) {
  return available && typeof W[name] === 'function';
}

let hapticsEnabled = true;

export const tg = {
  available,
  raw: W,
  user: available ? W.initDataUnsafe?.user || null : null,
  startParam: available ? W.initDataUnsafe?.start_param || null : null,

  init() {
    if (!available) return;
    try {
      W.ready();
      if (has('expand')) W.expand();
      // Без этого протяжка по canvas на Android схлопывает приложение.
      if (has('disableVerticalSwipes')) W.disableVerticalSwipes();
      if (has('setHeaderColor')) W.setHeaderColor('#0f111a');
      if (has('setBackgroundColor')) W.setBackgroundColor('#0f111a');
      if (has('enableClosingConfirmation')) W.enableClosingConfirmation();
    } catch (err) {
      console.warn('[telegram] init', err);
    }
  },

  setHapticsEnabled(v) {
    hapticsEnabled = !!v;
  },

  haptic: {
    light: () => impact('light'),
    medium: () => impact('medium'),
    heavy: () => impact('heavy'),
    success: () => notify('success'),
    warning: () => notify('warning'),
    error: () => notify('error'),
    select: () => {
      if (!available || !hapticsEnabled) return;
      try {
        W.HapticFeedback?.selectionChanged?.();
      } catch {}
    },
  },

  back: {
    show: safe((fn) => {
      if (!W.BackButton) return;
      W.BackButton.onClick(fn);
      W.BackButton.show();
      return () => {
        try {
          W.BackButton.offClick(fn);
          W.BackButton.hide();
        } catch {}
      };
    }, () => {}),
    hide: safe(() => W.BackButton?.hide()),
  },

  cloud: {
    supported: available && !!W.CloudStorage,
    get(key) {
      if (!this.supported) return Promise.reject(new Error('no cloud'));
      return new Promise((res, rej) =>
        W.CloudStorage.getItem(key, (err, val) => (err ? rej(err) : res(val))));
    },
    set(key, value) {
      if (!this.supported) return Promise.reject(new Error('no cloud'));
      return new Promise((res, rej) =>
        W.CloudStorage.setItem(key, value, (err, ok) => (err ? rej(err) : res(ok))));
    },
    remove(key) {
      if (!this.supported) return Promise.resolve();
      return new Promise((res) => W.CloudStorage.removeItem(key, () => res()));
    },
  },

  safeArea() {
    if (!available) return { top: 0, bottom: 0 };
    const a = W.safeAreaInset || {};
    const c = W.contentSafeAreaInset || {};
    return {
      top: Math.max(a.top || 0, c.top || 0),
      bottom: Math.max(a.bottom || 0, c.bottom || 0),
    };
  },

  viewportHeight() {
    if (!available) return 0;
    return W.viewportStableHeight || W.viewportHeight || 0;
  },

  onViewportChanged(fn) {
    if (!available || !has('onEvent')) return () => {};
    W.onEvent('viewportChanged', fn);
    if (has('onEvent')) {
      try {
        W.onEvent('safeAreaChanged', fn);
        W.onEvent('contentSafeAreaChanged', fn);
      } catch {}
    }
    return () => {
      try {
        W.offEvent('viewportChanged', fn);
      } catch {}
    };
  },

  share: safe((text, url) => {
    const link = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    W.openTelegramLink ? W.openTelegramLink(link) : window.open(link, '_blank');
  }, false),

  openLink: safe((url) => W.openLink?.(url), false),
  close: safe(() => W.close?.(), false),
};

function impact(style) {
  if (!available || !hapticsEnabled) return;
  try {
    tg.raw.HapticFeedback?.impactOccurred?.(style);
  } catch {}
}

function notify(type) {
  if (!available || !hapticsEnabled) return;
  try {
    tg.raw.HapticFeedback?.notificationOccurred?.(type);
  } catch {}
}
