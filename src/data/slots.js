// Геометрия комнаты в виртуальных координатах 560×1000.
// Пропорция 0.56 почти совпадает с вертикальным экраном телефона, поэтому
// сцена заполняет зону целиком: по бокам срезается пара сантиметров стены,
// на широком экране — лишний потолок.
//
// Масштаб: рост персонажа стоя ≈ 250 единиц ≈ 175 см, то есть 1 единица ≈ 0.7 см.
// Все размеры мебели считаны по этой шкале, иначе стол оказывается выше плеч.
//
// Рисовалка получает готовые x/y/w/h и никогда не хардкодит позицию — один
// и тот же предмет годится и в комнату игрока, и в комнату соседа.

export const ROOM = {
  w: 560,
  h: 1000,
  floorY: 600,                                  // линия стыка стены и пола
  window: { x: 330, y: 118, w: 218, h: 254 },
  door: { x: 6, y: 312, w: 112, h: 288 },
};

const DESK_TOP = 660;                           // уровень столешницы

/** Каждый слот: точка привязки (низ-центр), размер и z-порядок. */
export const SLOTS = {
  rug:            { x: 286, y: 918, w: 330, h: 118, z: 10 },
  wall_art_1:     { x: 118, y: 300, w: 112, h: 92,  z: 20 },
  wall_art_2:     { x: 240, y: 286, w: 88,  h: 112, z: 20 },
  shelf:          { x: 152, y: 412, w: 162, h: 62,  z: 22 },
  curtains:       { x: 439, y: 392, w: 262, h: 286, z: 24 },
  desk_plant:     { x: 372, y: 390, w: 44,  h: 56,  z: 26 },   // на подоконнике
  desk:           { x: 266, y: 764, w: 320, h: 104, z: 30 },
  organizer:      { x: 132, y: DESK_TOP - 2, w: 52, h: 44, z: 32 },
  lamp:           { x: 400, y: DESK_TOP - 2, w: 50, h: 88, z: 32 },
  monitor_side_l: { x: 186, y: DESK_TOP, w: 96,  h: 62,  z: 34 },
  monitor_side_r: { x: 346, y: DESK_TOP, w: 96,  h: 62,  z: 34 },
  monitor_main:   { x: 266, y: DESK_TOP, w: 152, h: 96,  z: 36 },
  keyboard:       { x: 266, y: DESK_TOP + 12, w: 112, h: 14, z: 38 },
  mug:            { x: 190, y: DESK_TOP + 8, w: 20, h: 22, z: 38 },
  headset:        { x: 342, y: DESK_TOP + 8, w: 32, h: 30, z: 38 },
  pc:             { x: 492, y: 796, w: 62,  h: 132, z: 40 },
  console:        { x: 84,  y: 852, w: 70,  h: 40,  z: 42 },
  plant:          { x: 52,  y: 886, w: 76,  h: 132, z: 50 },
  aquarium:       { x: 508, y: 892, w: 90,  h: 62,  z: 52 },
  chair:          { x: 266, y: 848, w: 148, h: 226, z: 60 },
};

export const CHARACTER_Z = 70;
export const CHAIR_BACK_Z = 80;

/** Точки, между которыми ходит персонаж (низ-центр фигуры). */
export const WAYPOINTS = {
  desk:   { x: 266, y: 812 },
  window: { x: 434, y: 852 },
  room_l: { x: 128, y: 902 },
  room_c: { x: 214, y: 928 },
  room_r: { x: 384, y: 914 },
  door:   { x: 68,  y: 866 },
};

/** Слоты, которые открываются только на определённом ранге. */
export const SLOT_RANK = {
  monitor_side_l: 3,
  monitor_side_r: 5,
  wall_art_1: 4,
  wall_art_2: 4,
  shelf: 4,
  aquarium: 7,
};

export function slotOf(id) {
  return SLOTS[id] || null;
}

/** Слоты в порядке отрисовки. */
export function slotsByZ() {
  return Object.entries(SLOTS)
    .map(([id, s]) => ({ id, ...s }))
    .sort((a, b) => a.z - b.z);
}
