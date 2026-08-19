// Персонаж со спины: скелет + отрисовка. Ни одной картинки — только фигуры,
// поэтому пол, причёску и цвета одежды можно менять параметром.

import { capsule, roundRect } from '../../../shapes.js';
import { rgba, mix } from '../../../material.js';
import { proportionsFor, paletteFor } from './proportions.js';
import { clipFor } from './animations.js';
import { playClip, breathe } from '../../../anim.js';

/** Считает точки скелета из позы. Начало координат — между стопами. */
export function solve(pose, p) {
  const legLen = p.leg;
  const hipsY = -legLen * pose.hipsY * (pose.seated > 0.5 ? 1 : 1);
  const seatDrop = pose.seated * 0;
  const hips = { x: 0, y: hipsY + seatDrop };

  const lean = pose.lean;
  const chest = {
    x: hips.x + Math.sin(lean) * p.torso,
    y: hips.y - Math.cos(lean) * p.torso,
  };
  const neck = {
    x: chest.x + Math.sin(lean) * 8,
    y: chest.y - 8,
  };
  const head = {
    x: neck.x + Math.sin(lean + pose.headTilt) * (p.headR + 6),
    y: neck.y - Math.cos(lean + pose.headTilt) * (p.headR + 6),
  };

  const shoulderL = { x: chest.x - p.shoulder, y: chest.y + 4 };
  const shoulderR = { x: chest.x + p.shoulder, y: chest.y + 4 };

  // side: -1 — дальняя от зрителя рука, +1 — ближняя.
  // angle — отведение плеча наружу, elbow — сгиб локтя,
  // lift — насколько предплечье вынесено вперёд (к столу).
  const arm = (sh, side, angle, elbow) => {
    const elb = {
      x: sh.x + side * Math.sin(angle) * p.upperArm,
      y: sh.y + Math.cos(angle) * p.upperArm,
    };
    const lift = pose.handUp;
    // Вперёд в 2D-виде со спины читается как укорочение предплечья:
    // кисть уходит чуть внутрь и вверх, но никогда не пересекает корпус.
    const fx = elb.x + side * (0.12 - lift * 0.25) * p.foreArm;
    const fy = elb.y + Math.cos(elbow * 0.5) * p.foreArm * (1 - lift * 2.1);
    return { elbow: elb, hand: { x: fx, y: fy } };
  };

  const armLeft = arm(shoulderL, -1, pose.armL, pose.elbL);
  const armRight = arm(shoulderR, 1, pose.armR, pose.elbR);

  const leg = (side) => {
    const out = pose.legOut * side;
    const step = pose.stepPhase * side;
    const bend = pose.kneeBend;
    const kneeX = hips.x + side * p.hip * 0.62 + out * 22 + step * 16;
    const kneeY = hips.y + legLen * (bend > 0.5 ? 0.46 : 0.52) * (1 - bend * 0.12);
    const footX = kneeX + step * 18 + out * 8 - side * bend * 6;
    const footY = pose.seated > 0.5 ? 0 : Math.min(0, -Math.abs(step) * 6);
    return { knee: { x: kneeX, y: kneeY }, foot: { x: footX, y: footY } };
  };

  return {
    hips, chest, neck, head,
    shoulderL, shoulderR,
    armLeft, armRight,
    legLeft: leg(-1), legRight: leg(1),
  };
}

/** Рисует фигуру. ctx уже переведён в точку (низ-центр персонажа). */
export function drawFigure(ctx, { gender, activity, t, scale = 1, tint, world, mugVisible }) {
  const p = proportionsFor(gender);
  const pal = paletteFor(gender, tint);
  const clip = clipFor(activity);
  const pose = playClip(clip, t);
  const br = breathe(t);
  const s = scale * p.height;

  ctx.save();
  ctx.scale(s, s);

  const rig = solve(pose, p);
  const outline = 'rgba(12,14,20,.55)';

  // тень на полу
  if (pose.seated < 0.5) {
    ctx.fillStyle = 'rgba(0,0,0,.26)';
    ctx.beginPath();
    ctx.ellipse(0, -2, p.shoulder * 1.1, 8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ноги
  for (const [legKey, side] of [['legLeft', -1], ['legRight', 1]]) {
    const l = rig[legKey];
    capsule(ctx, rig.hips.x + side * p.hip * 0.55, rig.hips.y, l.knee.x, l.knee.y, p.limbW, p.limbW * 0.86, pal.bottom);
    capsule(ctx, l.knee.x, l.knee.y, l.foot.x, l.foot.y, p.limbW * 0.86, p.limbW * 0.66, pal.bottom);
    // стопа
    ctx.fillStyle = pal.shoe;
    roundRect(ctx, l.foot.x - p.limbW, l.foot.y - p.limbW * 0.7, p.limbW * 2.1, p.limbW * 0.9, 4);
    ctx.fill();
  }

  // дальняя рука
  drawArm(ctx, rig.shoulderL, rig.armLeft, p, pal, br);

  // торс
  drawTorso(ctx, rig, p, pal, br);

  // ближняя рука
  drawArm(ctx, rig.shoulderR, rig.armRight, p, pal, br);

  // кружка в правой руке
  if (mugVisible) {
    const h = rig.armRight.hand;
    ctx.fillStyle = '#f2f4f8';
    roundRect(ctx, h.x - 7, h.y - 12, 14, 15, 3);
    ctx.fill();
    ctx.strokeStyle = '#f2f4f8';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.arc(h.x + 9, h.y - 5, 4.5, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }

  // шея и голова
  capsule(ctx, rig.neck.x, rig.neck.y + 4, rig.head.x, rig.head.y + p.headR * 0.4, p.armW, p.armW * 0.9, pal.skin);
  drawHead(ctx, rig, p, pal, pose, br);

  ctx.strokeStyle = outline;
  ctx.restore();
}

function drawTorso(ctx, rig, p, pal, br) {
  const hips = rig.hips;
  const chest = rig.chest;
  const sw = p.shoulder * (br.chestScale || 1);
  ctx.fillStyle = pal.top;
  ctx.beginPath();
  ctx.moveTo(hips.x - p.hip, hips.y + 6);
  ctx.quadraticCurveTo(chest.x - sw * 1.05, chest.y + p.torso * 0.35, chest.x - sw, chest.y);
  ctx.quadraticCurveTo(chest.x, chest.y - 10, chest.x + sw, chest.y);
  ctx.quadraticCurveTo(chest.x + sw * 1.05, chest.y + p.torso * 0.35, hips.x + p.hip, hips.y + 6);
  ctx.closePath();
  ctx.fill();

  // складка по центру спины — читается объём
  ctx.strokeStyle = rgba(mix(pal.top, '#000000', 0.35), 0.55);
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  ctx.moveTo((hips.x + chest.x) / 2, chest.y + 12);
  ctx.lineTo((hips.x + chest.x) / 2 + 1, hips.y - 4);
  ctx.stroke();
}

function drawArm(ctx, shoulder, arm, p, pal) {
  capsule(ctx, shoulder.x, shoulder.y, arm.elbow.x, arm.elbow.y, p.armW, p.armW * 0.88, pal.top);
  capsule(ctx, arm.elbow.x, arm.elbow.y, arm.hand.x, arm.hand.y, p.armW * 0.86, p.armW * 0.72, pal.skin);
  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(arm.hand.x, arm.hand.y, p.armW * 0.8, 0, Math.PI * 2);
  ctx.fill();
}

function drawHead(ctx, rig, p, pal, pose, br) {
  const hx = rig.head.x + (pose.headTurn || 0) * 3;
  const hy = rig.head.y + (br.headBob || 0) * 0.4;

  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.arc(hx, hy, p.headR, 0, Math.PI * 2);
  ctx.fill();

  // ухо появляется при повороте головы — единственный намёк на профиль
  const turn = pose.headTurn || 0;
  if (Math.abs(turn) > 0.15) {
    ctx.fillStyle = mix(pal.skin, '#c98a68', 0.3);
    ctx.beginPath();
    ctx.ellipse(hx + Math.sign(turn) * p.headR * 0.92, hy + 2, 4.5, 6.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  drawHair(ctx, hx, hy, p, pal, turn);
}

function drawHair(ctx, hx, hy, p, pal, turn) {
  ctx.fillStyle = pal.hair;
  const r = p.headR;

  if (p.hair === 'ponytail') {
    ctx.beginPath();
    ctx.arc(hx, hy - 1, r * 1.06, Math.PI * 0.05, Math.PI * 0.95, true);
    ctx.lineTo(hx - r * 0.9, hy + r * 0.75);
    ctx.quadraticCurveTo(hx, hy + r * 0.5, hx + r * 0.9, hy + r * 0.75);
    ctx.closePath();
    ctx.fill();
    // хвост со вторичным смещением от поворота головы
    const tx = hx + turn * 5;
    ctx.beginPath();
    ctx.moveTo(tx - 6, hy + r * 0.5);
    ctx.quadraticCurveTo(tx + turn * 12 + 4, hy + r * 1.5, tx + turn * 8, hy + r * 2.5);
    ctx.quadraticCurveTo(tx - 6 + turn * 6, hy + r * 1.6, tx - 10, hy + r * 0.6);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(hx, hy - 2, r * 1.04, Math.PI * 0.02, Math.PI * 0.98, true);
    ctx.lineTo(hx - r * 0.95, hy + r * 0.42);
    ctx.quadraticCurveTo(hx, hy + r * 0.1, hx + r * 0.95, hy + r * 0.42);
    ctx.closePath();
    ctx.fill();
  }
}
