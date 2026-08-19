// Тонкие помощники для DOM — вместо фреймворка.

export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'data' && typeof v === 'object') {
      for (const [dk, dv] of Object.entries(v)) node.dataset[dk] = dv;
    } else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c.nodeType ? c : document.createTextNode(String(c)));
  }
  return node;
}

export function $(sel, root = document) {
  return root.querySelector(sel);
}

export function $$(sel, root = document) {
  return [...root.querySelectorAll(sel)];
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
  return node;
}

/** Делегирование: один слушатель на корне вместо сотни на карточках. */
export function delegate(root, eventName, selector, handler) {
  const fn = (ev) => {
    const target = ev.target.closest(selector);
    if (target && root.contains(target)) handler(ev, target);
  };
  root.addEventListener(eventName, fn);
  return () => root.removeEventListener(eventName, fn);
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

/** Инлайн-SVG иконки навигации: currentColor, без внешних файлов. */
export function icon(name) {
  const paths = {
    home: '<path d="M3 11.2 12 4l9 7.2M5.5 9.8V20h13V9.8"/>',
    shop: '<path d="M4 8h16l-1.2 11.2a1 1 0 0 1-1 .8H6.2a1 1 0 0 1-1-.8L4 8Z"/><path d="M8.5 8V6.2a3.5 3.5 0 0 1 7 0V8"/>',
    quests: '<path d="M6 3.6h12v16.8l-6-3.4-6 3.4V3.6Z"/><path d="M9.2 9.4h5.6M9.2 12.6h5.6"/>',
    friends: '<circle cx="9" cy="8.4" r="3.2"/><path d="M3.6 19.4c0-3 2.4-5.2 5.4-5.2s5.4 2.2 5.4 5.2"/><path d="M16 5.6a3 3 0 0 1 0 5.8M17 14.6c2.2.5 3.6 2.3 3.6 4.8"/>',
    wallet: '<rect x="3.4" y="6.2" width="17.2" height="12.6" rx="2.4"/><path d="M3.4 10.2h17.2"/><circle cx="16.8" cy="14.4" r="1.2"/>',
  };
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
    stroke-linecap="round" stroke-linejoin="round">${paths[name] || ''}</svg>`;
}
