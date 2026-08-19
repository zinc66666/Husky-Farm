// Ряд кружков-цветов. Выбор сразу применяется к предмету в комнате.

import { el } from '../../core/dom.js';
import { hexOf, colorSet, colorName } from '../../data/palettes.js';

export function colorPicker({ set = 'full', value, onPick }) {
  const row = el('div', { class: 'swatches' });
  for (const key of colorSet(set)) {
    const btn = el('button', {
      class: `swatch${key === value ? ' on' : ''}`,
      type: 'button',
      title: colorName(key),
      style: { background: hexOf(key) },
      onclick: () => {
        for (const s of row.children) s.classList.remove('on');
        btn.classList.add('on');
        onPick?.(key);
      },
    });
    row.append(btn);
  }
  return row;
}
