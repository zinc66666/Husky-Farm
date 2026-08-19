// Заглушка серверного адаптера: тот же интерфейс, что у локального.
// В v1 не используется — включается через ?api=remote, когда появится бэкенд.

const BASE = '/api';

async function req(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'content-type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

export const listNeighbors = ({ cursor, limit = 12 } = {}) =>
  req(`/neighbors?limit=${limit}${cursor ? `&cursor=${cursor}` : ''}`);

export const getNeighborRoom = (id) => req(`/neighbors/${encodeURIComponent(id)}`);

export const rateNeighbor = (id, stars) =>
  req(`/neighbors/${encodeURIComponent(id)}/rate`, { method: 'POST', body: JSON.stringify(stars) });

export const getIncomingVisits = ({ since } = {}) => req(`/visits?since=${since || 0}`);

export const getFriends = () => req('/friends');

export const addFriend = (id) =>
  req('/friends', { method: 'POST', body: JSON.stringify({ id }) });

export const getLeaderboard = ({ scope = 'global' } = {}) => req(`/leaderboard?scope=${scope}`);

export const pushProfile = (publicState) =>
  req('/profile', { method: 'PUT', body: JSON.stringify(publicState) });

export const pullProfile = () => req('/profile');
