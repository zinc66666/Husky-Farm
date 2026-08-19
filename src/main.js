// Бутстрап: платформа → сейв → тема → экраны → цикл.

import { tg } from './platform/telegram.js';
import { initViewport, viewportInfo, relayout } from './platform/viewport.js';
import { on, emit } from './core/events.js';
import { start as startLoop, setFpsCap } from './core/loop.js';
import { now, dayKey } from './core/clock.js';
import { el } from './core/dom.js';
import { short, duration } from './core/format.js';

import { initStore, getState, mutate, flush, resetAll } from './state/store.js';
import { toRoomModel, bankInfo } from './state/selectors.js';

import { setTheme } from './render/theme.js';
import { render, resize, screenToRoom, spawnCoins, invalidateRoom } from './render/renderer.js';
import { initDebug } from './render/debug.js';

import { updateWorld, getWorld } from './game/world.js';
import { initActivity, tickActivity, stepMotion, getActivity, forceActivity, ACTIVITIES } from './game/activity.js';
import { offlineReport } from './game/economy.js';
import { tickAccrual, tap, rolloverDay } from './game/actions.js';
import { ensureDaily, claimableCount } from './game/quests.js';
import { rollGuests } from './game/guests.js';

import { initUi, registerScreen, showModal, hideModal, updateActiveScreen } from './ui/ui.js';
import { initHud, update as updateHud } from './ui/hud.js';
import { initCollectBar, update as updateCollectBar } from './ui/collectbar.js';
import { initNavbar, setBadge } from './ui/navbar.js';
import { initToasts } from './ui/toast.js';
import { mountOnboarding } from './ui/screens/onboarding.js';
import { shopScreen } from './ui/screens/shop.js';
import { questsScreen } from './ui/screens/quests.js';
import { walletScreen } from './ui/screens/wallet.js';
import { friendsScreen } from './ui/screens/friends.js';
import { visitScreen } from './ui/screens/visit.js';

const params = new URLSearchParams(location.search);

boot().catch((err) => {
  console.error('[boot]', err);
  document.body.innerHTML =
    '<div style="padding:40px;color:#8e95ad;font:14px system-ui;text-align:center">' +
    'Не удалось запустить игру. Обнови страницу.</div>';
});

async function boot() {
  tg.init();

  if (params.get('reset') === '1') {
    try { localStorage.removeItem('hf.save'); } catch {}
  }

  const { corrupted } = initStore();
  applyDebugState();

  tg.setHapticsEnabled(getState().settings.haptics);

  initToasts();
  initUi();
  if (corrupted) {
    emit('toast', { text: 'Сохранение было повреждено — начинаем заново', kind: 'warn' });
  }

  const canvas = document.getElementById('scene');
  const { ctx } = initViewport(canvas);
  await setTheme(getState().settings.themeId || 'vector');

  initHud();
  initCollectBar();
  initNavbar();
  initDebug();

  registerScreen('shop', shopScreen);
  registerScreen('quests', questsScreen);
  registerScreen('wallet', walletScreen);
  registerScreen('friends', friendsScreen);
  registerScreen('visit', visitScreen);

  const info = viewportInfo();
  resize(info.cssW, info.cssH);
  on('resize', ({ cssW, cssH }) => resize(cssW, cssH));

  updateWorld(getState().seed || 'anon');
  initActivity();
  const act = params.get('act');
  if (ACTIVITIES.includes(act)) forceActivity(act);

  if (!getState().player.onboarded) {
    await runOnboarding();
  }

  rolloverDay();
  ensureDaily();
  showOfflineReport();
  rollGuests();

  wireInput(canvas);
  wireEvents();

  startLoop();
  setFpsCap(0);
  requestAnimationFrame(() => relayout());
}

function runOnboarding() {
  return new Promise((resolve) => {
    const overlay = document.getElementById('overlay');
    overlay.classList.add('open');
    const stop = mountOnboarding(overlay, () => {
      stop?.();
      overlay.classList.remove('open');
      overlay.innerHTML = '';
      updateWorld(getState().seed || 'anon');
      invalidateRoom();
      resolve();
    });
  });
}

// --- отладочные флаги ---

function applyDebugState() {
  const coins = params.get('coins');
  if (coins) {
    mutate((s) => {
      s.wallet.coins += Number(coins) || 0;
    });
  }
  const offline = params.get('offline');
  if (offline) {
    const m = /^(\d+(?:\.\d+)?)(h|m)?$/.exec(offline);
    if (m) {
      const ms = Number(m[1]) * (m[2] === 'm' ? 60_000 : 3_600_000);
      mutate((s) => {
        s.lastTickAt = now() - ms;
        s.bank.lastAccrualAt = now() - ms;
      });
    }
  }
  const seed = params.get('seed');
  if (seed) mutate((s) => { s.seed = seed; });
  const gender = params.get('gender');
  if (gender === 'm' || gender === 'f') {
    mutate((s) => {
      s.player.gender = gender;
      s.player.onboarded = true;
      if (!s.seed) s.seed = 'debug';
    });
  }
}

// --- оффлайн-доход ---

function showOfflineReport() {
  const s = getState();
  const report = offlineReport(s, now());
  if (report.elapsedMs < 120_000 || report.amount < 1) {
    tickAccrual();
    return;
  }
  tickAccrual();
  mutate((st) => {
    st.stats.offlineClaimedTotal += report.amount;
  }, { silent: true });

  const card = el('div', { class: 'modal-card' },
    el('h3', { text: 'Пока тебя не было' }),
    el('div', { class: 'big', text: `🪙 ${short(report.amount)}` }),
    el('p', {
      text: report.capped
        ? `Прошло ${duration(report.elapsedMs)}. Банк заполнился до предела — купи уютный декор, чтобы он вмещал больше.`
        : `Прошло ${duration(report.elapsedMs)}. Всё уже в банке — забирай.`,
    }),
    el('div', { class: 'modal-actions' },
      el('button', { class: 'btn wide', type: 'button', text: 'Отлично', onclick: hideModal })),
  );
  showModal(card);
}

// --- ввод ---

function wireInput(canvas) {
  canvas.addEventListener('pointerdown', (ev) => {
    const rect = canvas.getBoundingClientRect();
    const px = ev.clientX - rect.left;
    const py = ev.clientY - rect.top;
    const value = tap(px, py);
    if (value > 0) {
      const room = screenToRoom(px, py);
      spawnCoins(room.x, room.y, 8);
    }
  });
}

function wireEvents() {
  on('floater', ({ x, y, text }) => {
    const layer = document.getElementById('fx');
    const node = el('div', { class: 'floater', text, style: { left: `${x}px`, top: `${y}px` } });
    layer.append(node);
    setTimeout(() => node.remove(), 950);
  });

  on('collected', () => {
    spawnCoins(360, 640, 22);
    refreshUi();
  });

  on('room:changed', () => {
    invalidateRoom();
    refreshUi();
  });

  on('rank:up', ({ name }) => {
    emit('toast', { text: `Новый статус: ${name}!`, kind: 'good' });
  });

  on('sim', () => {
    tickAccrual();
    updateCollectBar();
  });

  on('slow', () => {
    const s = getState();
    updateWorld(s.seed || 'anon');
    const b = bankInfo(s);
    if (ACTIVITIES.includes(params.get('act'))) return finishSlow(s);
    tickActivity({
      pcTier: s.rig.pcTier,
      weather: getWorld().weather,
      phase: getWorld().phase,
      bankFull: b.ratio > 0.9,
    });
    finishSlow(s);
  });

  on('resume', () => {
    updateWorld(getState().seed || 'anon');
    tickAccrual();
    rollGuests();
    refreshUi();
  });

  on('frame', (dt) => {
    stepMotion(dt);
    const s = getState();
    const model = toRoomModel(s, getWorld(), getActivity());
    const { ctx, dpr } = viewportInfo();
    if (ctx) render(ctx, model, dt, dpr);
  });

  on('state:replaced', refreshUi);
  on('social:changed', refreshUi);
  on('quests:changed', refreshUi);
  on('counter', () => setBadge('quests', claimableCount() > 0));
}

function finishSlow() {
  if (rolloverDay()) ensureDaily();
  ensureDaily();
  rollGuests();
  refreshUi();
  flush();
}

function refreshUi() {
  updateHud();
  updateCollectBar();
  updateActiveScreen();
  setBadge('quests', claimableCount() > 0);
}

// Тестовый доступ из консоли — удобно при отладке баланса.
window.hf = { getState, resetAll, refreshUi };
