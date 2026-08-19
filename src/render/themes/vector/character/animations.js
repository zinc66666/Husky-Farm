// Клипы анимаций. Поверх любого из них аддитивно накладывается «дыхание»,
// поэтому фигура никогда не выглядит замороженной.

import { POSES as P } from './poses.js';

export const CLIPS = {
  walk: {
    duration: 0.9,
    keys: [
      { t: 0,    pose: P.stepA,   ease: 'sine' },
      { t: 0.25, pose: P.passing, ease: 'sine' },
      { t: 0.5,  pose: P.stepB,   ease: 'sine' },
      { t: 0.75, pose: P.passing, ease: 'sine' },
    ],
  },

  // Печать: быстро двигаются только кисти, корпус почти неподвижен.
  play: {
    duration: 2.4,
    keys: [
      { t: 0,    pose: P.sitDesk,       ease: 'sine' },
      { t: 0.18, pose: P.reachKeyboard, ease: 'sine' },
      { t: 0.36, pose: P.sitDesk,       ease: 'sine' },
      { t: 0.54, pose: P.reachKeyboard, ease: 'sine' },
      { t: 0.74, pose: P.sitBack,       ease: 'inOut' },
      { t: 0.9,  pose: P.sitDesk,       ease: 'inOut' },
    ],
  },

  tea: {
    duration: 5,
    keys: [
      { t: 0,    pose: P.mugLow,  ease: 'inOut' },
      { t: 0.25, pose: P.mugHigh, ease: 'out' },
      { t: 0.45, pose: P.mugHigh, ease: 'linear' },
      { t: 0.68, pose: P.mugLow,  ease: 'inOut' },
      { t: 0.9,  pose: P.sitDesk, ease: 'inOut' },
    ],
  },

  window: {
    duration: 6,
    keys: [
      { t: 0,    pose: P.leanWindow,     ease: 'sine' },
      { t: 0.35, pose: P.leanWindowTurn, ease: 'sine' },
      { t: 0.6,  pose: P.leanWindow,     ease: 'sine' },
      { t: 0.82, pose: P.stretchUp,      ease: 'inOut' },
    ],
  },

  idle: {
    duration: 4,
    keys: [
      { t: 0,   pose: P.stand, ease: 'sine' },
      { t: 0.5, pose: P.passing, ease: 'sine' },
    ],
  },
};

export function clipFor(activity) {
  return CLIPS[activity] || CLIPS.idle;
}
