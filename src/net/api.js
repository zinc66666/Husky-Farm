// Граница «сети». Всё асинхронное: локальная реализация подменяется серверной
// без правок в игре. Адаптер никогда не мутирует стор — он возвращает данные,
// а применяет их actions.js.

import * as local from './localAdapter.js';
import * as remote from './remoteAdapter.js';

const USE_REMOTE = new URLSearchParams(location.search).get('api') === 'remote';

/**
 * @typedef {Object} NeighborSummary
 * @property {string} id
 * @property {string} name
 * @property {number} rankIndex
 * @property {number} pcTier
 * @property {number} quality
 */

export function getApi() {
  return USE_REMOTE ? remote : local;
}

export const Api = {
  listNeighbors: (...a) => getApi().listNeighbors(...a),
  getNeighborRoom: (...a) => getApi().getNeighborRoom(...a),
  rateNeighbor: (...a) => getApi().rateNeighbor(...a),
  getIncomingVisits: (...a) => getApi().getIncomingVisits(...a),
  getFriends: (...a) => getApi().getFriends(...a),
  addFriend: (...a) => getApi().addFriend(...a),
  getLeaderboard: (...a) => getApi().getLeaderboard(...a),
  pushProfile: (...a) => getApi().pushProfile(...a),
  pullProfile: (...a) => getApi().pullProfile(...a),
};
