// Манифест векторной темы. Пиксельная или 3D-тема должна экспортировать
// ровно те же ключи с теми же сигнатурами — и подменится без правок игры.

import * as room from './room.js';
import * as windowScene from './window.js';
import * as effects from './effects.js';
import * as character from './character/index.js';

import * as desk from './furniture/desk.js';
import * as chair from './furniture/chair.js';
import * as monitor from './furniture/monitor.js';
import * as pc from './furniture/pc.js';
import * as shelf from './furniture/shelf.js';
import * as painting from './furniture/painting.js';
import * as plant from './furniture/plant.js';
import * as curtains from './furniture/curtains.js';
import * as organizer from './furniture/organizer.js';
import * as lamp from './furniture/lamp.js';
import * as rug from './furniture/rug.js';
import * as misc from './furniture/misc.js';

export default {
  id: 'vector',
  name: '2D-вектор',
  roomSpace: { w: 720, h: 1000, floorY: 600 },
  room: {
    drawFloor: room.drawFloor,
    drawWalls: room.drawWalls,
    drawWindowFrame: room.drawWindowFrame,
    drawDoor: room.drawDoor,
  },
  window: { drawOutside: windowScene.drawOutside },
  furniture: {
    desk: desk.draw,
    chair: chair.draw,
    monitor: monitor.draw,
    pc: pc.draw,
    shelf: shelf.draw,
    painting: painting.draw,
    plant: plant.draw,
    curtains: curtains.draw,
    organizer: organizer.draw,
    lamp: lamp.draw,
    rug: rug.draw,
    misc: misc.draw,
  },
  character: { draw: character.draw },
  effects,
};
