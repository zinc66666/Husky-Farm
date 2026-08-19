// Локальная реализация «сети»: соседи генерируются процедурно.
// Искусственная задержка стоит здесь намеренно — она заставляет UI иметь
// настоящие состояния загрузки, и переезд на сервер ничего не обнажит.

import { feedIds, generate, summary } from '../game/neighbors.js';
import { getState } from '../state/store.js';
import { rankFromXp } from '../game/ranks.js';
import { activeGuestList } from '../game/guests.js';
import { rateNeighbor as applyRating, addFriend as applyFriend } from '../game/ratings.js';

const delay = () => new Promise((r) => setTimeout(r, 80 + Math.random() * 120));

export async function listNeighbors({ limit = 12 } = {}) {
  await delay();
  const s = getState();
  const rank = rankFromXp(s.player.xp);
  const ids = feedIds(s.seed || 'anon', limit);
  return { items: ids.map((id) => summary(id, rank)), cursor: null };
}

export async function getNeighborRoom(id) {
  await delay();
  const s = getState();
  return generate(id, rankFromXp(s.player.xp));
}

export async function rateNeighbor(id, stars) {
  await delay();
  const neighbor = await getNeighborRoom(id);
  const reward = applyRating(neighbor, stars);
  return { ok: reward > 0, reward };
}

export async function getIncomingVisits() {
  await delay();
  return activeGuestList();
}

export async function getFriends() {
  await delay();
  return getState().social.friends;
}

export async function addFriend(id) {
  await delay();
  const neighbor = await getNeighborRoom(id);
  const ok = applyFriend(neighbor);
  return { ok, friend: { id: neighbor.id, name: neighbor.owner.name, seed: neighbor.seed } };
}

export async function getLeaderboard({ limit = 10 } = {}) {
  await delay();
  const s = getState();
  const rank = rankFromXp(s.player.xp);
  const rows = feedIds(`${s.seed}:board`, limit)
    .map((id) => summary(id, rank))
    .map((n) => ({ name: n.name, rankIndex: n.rankIndex, score: Math.round(n.quality * 1000) }));
  rows.push({ name: s.player.name, rankIndex: rank, score: Math.round(1000 * 0.4 * (s.rig.pcTier / 10)) , me: true });
  rows.sort((a, b) => b.score - a.score);
  return rows;
}

export async function pushProfile() {
  return { ok: true, serverTime: Date.now() };
}

export async function pullProfile() {
  return null;
}
