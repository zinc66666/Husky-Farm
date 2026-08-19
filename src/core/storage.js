// Фасад хранилища: localStorage — основной путь, Telegram CloudStorage — резервная копия.
// Загрузка никогда не блокирует первый кадр на облаке.

import { tg } from '../platform/telegram.js';
import { SAVE_KEY, BROKEN_KEY } from '../state/schema.js';

const CHUNK = 3000;         // лимит значения CloudStorage ~4096 байт
const CLOUD_META = 'hf_meta';
const CLOUD_PREFIX = 'hf_s';
const CLOUD_THROTTLE = 90_000;

let lastCloudWrite = 0;

export function loadLocal() {
  let raw = null;
  try {
    raw = localStorage.getItem(SAVE_KEY);
  } catch {
    return { save: null, corrupted: false };
  }
  if (!raw) return { save: null, corrupted: false };
  try {
    return { save: JSON.parse(raw), corrupted: false };
  } catch {
    // Битый сейв откладываем, а не теряем молча, и стартуем заново.
    try {
      localStorage.setItem(BROKEN_KEY, raw);
      localStorage.removeItem(SAVE_KEY);
    } catch {}
    return { save: null, corrupted: true };
  }
}

export function saveLocal(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('[storage] local save failed', err);
    return false;
  }
}

export function wipeLocal() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

export async function saveCloud(state, { force = false } = {}) {
  if (!tg.cloud.supported) return false;
  const ts = Date.now();
  if (!force && ts - lastCloudWrite < CLOUD_THROTTLE) return false;
  lastCloudWrite = ts;
  try {
    const json = JSON.stringify(state);
    const chunks = [];
    for (let i = 0; i < json.length; i += CHUNK) chunks.push(json.slice(i, i + CHUNK));
    if (chunks.length > 8) return false; // сейв неожиданно разросся — не мусорим в облаке
    await Promise.all(chunks.map((c, i) => tg.cloud.set(CLOUD_PREFIX + i, c)));
    await tg.cloud.set(CLOUD_META, JSON.stringify({ n: chunks.length, savedAt: state.savedAt }));
    return true;
  } catch (err) {
    console.warn('[storage] cloud save failed', err);
    return false;
  }
}

export async function loadCloud() {
  if (!tg.cloud.supported) return null;
  try {
    const metaRaw = await tg.cloud.get(CLOUD_META);
    if (!metaRaw) return null;
    const meta = JSON.parse(metaRaw);
    const parts = [];
    for (let i = 0; i < meta.n; i++) parts.push(await tg.cloud.get(CLOUD_PREFIX + i));
    if (parts.some((p) => p === null || p === undefined || p === '')) return null;
    return JSON.parse(parts.join(''));
  } catch (err) {
    console.warn('[storage] cloud load failed', err);
    return null;
  }
}
