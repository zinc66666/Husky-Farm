// Именованные позы. Каждая — словарь чисел, между ними всё интерполируется.
//
//   hipsY    высота таза над полом (доля от длины ноги)
//   lean     наклон корпуса вперёд, рад
//   armL/R   угол плеча от вертикали, рад (наружу — положительный)
//   elbL/R   сгиб локтя, рад
//   handUp   насколько предплечья подняты вперёд (0 — вдоль тела, 1 — на столе)
//   legOut   разведение ног
//   kneeBend сгиб колена (0 — прямая нога, 1 — сидя)
//   headTilt наклон головы, рад
//   headTurn поворот головы: -1 влево, +1 вправо
//   stepPhase смещение ног при ходьбе (-1..1)
//   seated   1 — фигура сидит

export const POSES = {
  stand: {
    hipsY: 1, lean: 0.02, armL: 0.12, armR: 0.12, elbL: 0.1, elbR: 0.1,
    handUp: 0, legOut: 0.08, kneeBend: 0, headTilt: 0, headTurn: 0, stepPhase: 0, seated: 0,
  },
  stepA: {
    hipsY: 0.97, lean: 0.06, armL: 0.3, armR: -0.22, elbL: 0.2, elbR: 0.18,
    handUp: 0, legOut: 0.1, kneeBend: 0.18, headTilt: 0.02, headTurn: 0, stepPhase: 1, seated: 0,
  },
  stepB: {
    hipsY: 0.97, lean: 0.06, armL: -0.22, armR: 0.3, elbL: 0.18, elbR: 0.2,
    handUp: 0, legOut: 0.1, kneeBend: 0.18, headTilt: -0.02, headTurn: 0, stepPhase: -1, seated: 0,
  },
  passing: {
    hipsY: 1.02, lean: 0.04, armL: 0.04, armR: 0.04, elbL: 0.14, elbR: 0.14,
    handUp: 0, legOut: 0.04, kneeBend: 0.1, headTilt: 0, headTurn: 0, stepPhase: 0, seated: 0,
  },
  sitDesk: {
    hipsY: 0.62, lean: 0.14, armL: 0.34, armR: 0.34, elbL: 1.15, elbR: 1.15,
    handUp: 0.9, legOut: 0.34, kneeBend: 1, headTilt: 0.08, headTurn: 0, stepPhase: 0, seated: 1,
  },
  reachKeyboard: {
    hipsY: 0.62, lean: 0.2, armL: 0.4, armR: 0.28, elbL: 1.25, elbR: 1.05,
    handUp: 1, legOut: 0.34, kneeBend: 1, headTilt: 0.1, headTurn: 0, stepPhase: 0, seated: 1,
  },
  sitBack: {
    hipsY: 0.62, lean: -0.06, armL: 0.3, armR: 0.3, elbL: 0.9, elbR: 0.9,
    handUp: 0.55, legOut: 0.34, kneeBend: 1, headTilt: -0.06, headTurn: 0, stepPhase: 0, seated: 1,
  },
  mugLow: {
    hipsY: 0.62, lean: 0.06, armL: 0.22, armR: 0.42, elbL: 0.6, elbR: 1.1,
    handUp: 0.5, legOut: 0.32, kneeBend: 1, headTilt: 0.02, headTurn: 0, stepPhase: 0, seated: 1,
  },
  mugHigh: {
    hipsY: 0.62, lean: 0.02, armL: 0.2, armR: 0.5, elbL: 0.6, elbR: 2.0,
    handUp: 0.9, legOut: 0.32, kneeBend: 1, headTilt: -0.12, headTurn: 0, stepPhase: 0, seated: 1,
  },
  leanWindow: {
    hipsY: 0.99, lean: 0.05, armL: 0.4, armR: 0.4, elbL: 0.55, elbR: 0.55,
    handUp: 0.28, legOut: 0.12, kneeBend: 0.04, headTilt: -0.04, headTurn: 0.4, stepPhase: 0, seated: 0,
  },
  leanWindowTurn: {
    hipsY: 0.99, lean: 0.04, armL: 0.42, armR: 0.36, elbL: 0.6, elbR: 0.5,
    handUp: 0.3, legOut: 0.12, kneeBend: 0.04, headTilt: 0.03, headTurn: -0.55, stepPhase: 0, seated: 0,
  },
  // Потягивается: руки идут вверх, а не в стороны — угол больше π/2,
  // поэтому локоть оказывается выше плеча.
  stretchUp: {
    hipsY: 1.01, lean: -0.08, armL: 2.55, armR: 2.55, elbL: 0.35, elbR: 0.35,
    handUp: 0, legOut: 0.1, kneeBend: 0, headTilt: -0.1, headTurn: 0, stepPhase: 0, seated: 0,
  },
};
