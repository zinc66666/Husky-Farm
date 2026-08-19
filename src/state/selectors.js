// Чистые производные значения. Здесь же строится RoomModel — единственное,
// что умеет рисовать рендерер.

import { incomePerSec, capacity, capacitySec, decorStats } from '../game/economy.js';
import { rankFromXp, rankName, rankProgress, xpToNext } from '../game/ranks.js';
import { tierInfo } from '../game/upgrades.js';
import { slotsByZ, SLOT_RANK } from '../data/slots.js';
import { itemById } from '../data/catalog.js';
import { now } from '../core/clock.js';

export function income(state, ts = now()) {
  return incomePerSec(state, ts);
}

export function bankInfo(state, ts = now()) {
  const cap = capacity(state, ts);
  return {
    amount: state.bank.amount,
    capacity: cap,
    ratio: cap > 0 ? Math.min(1, state.bank.amount / cap) : 0,
    capacitySec: capacitySec(state),
    full: cap > 0 && state.bank.amount >= cap - 0.001,
  };
}

export function rankInfo(state) {
  const xp = state.player.xp;
  const index = rankFromXp(xp);
  return {
    index,
    name: rankName(index),
    progress: rankProgress(xp),
    toNext: xpToNext(xp),
    xp,
  };
}

export function activeGuests(state, ts = now()) {
  return (state.social.guests || []).filter((g) => g.expiresAt > ts);
}

export function isSlotUnlocked(state, slot) {
  const need = SLOT_RANK[slot];
  return need === undefined || rankFromXp(state.player.xp) >= need;
}

export function canAfford(state, price) {
  return state.wallet.coins >= price;
}

export function owns(state, itemId) {
  return !!state.owned[itemId];
}

/** Что нарисовать: единственный формат, который принимает рендерер. */
export function toRoomModel(state, world, activity) {
  const rank = rankFromXp(state.player.xp);
  const items = [];
  for (const slot of slotsByZ()) {
    const placed = state.room.items?.[slot.id];
    if (!placed || !placed.itemId) continue;
    const item = itemById(placed.itemId);
    if (!item) continue;
    items.push({
      slot: slot.id,
      itemId: placed.itemId,
      color: placed.color || item.defaultColor,
      draw: item.draw,
      variant: item.variant,
      z: slot.z,
    });
  }
  return {
    seed: state.seed || 'player',
    owner: { name: state.player.name, gender: state.player.gender || 'm', rankIndex: rank },
    pcTier: state.rig.pcTier,
    pcVisual: tierInfo(state.rig.pcTier).visual,
    wallColor: state.room.wallColor,
    floorColor: state.room.floorColor,
    items,
    activity: activity?.visual || 'play',
    intent: activity?.activity || 'play',
    pos: activity?.pos || null,
    activityT: activity?.t || 0,
    world,
    isVisit: false,
  };
}

/** Качество комнаты 0..1 — от него зависят оценки гостей и бонусы. */
export function roomQuality(state) {
  const { score, harmony } = decorStats(state.room);
  const pc = Math.min(1, state.rig.pcTier / 10);
  const decor = Math.min(1, score / 60);
  return 0.4 * pc + 0.4 * decor + 0.2 * (harmony ? 1 : 0.35);
}
