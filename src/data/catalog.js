// Каталог предметов — только данные. Поле `draw` это строковый ключ в тему рендера,
// поэтому пиксельная или 3D-тема подменяется без правок каталога и игровой логики.
//
//   decorScore — вклад в множитель дохода и в «качество» комнаты для оценок
//   comfort    — увеличивает ёмкость банка (можно дольше не заходить)

export const BANDS = {
  start:    { name: 'Стартовый',    rank: 1 },
  cozy:     { name: 'Уютный',       rank: 2 },
  advanced: { name: 'Продвинутый',  rank: 5 },
  lux:      { name: 'Люкс',         rank: 7 },
};

const ITEM_LIST = [
  // --- Стол ---
  { id: 'desk_basic',  slot: 'desk', name: 'Стол «Старт»',      price: 0,          draw: 'desk',  variant: 'basic',  colors: 'wood', defaultColor: 'wood',   decorScore: 2,  comfort: 0, band: 'start' },
  { id: 'desk_wide',   slot: 'desk', name: 'Широкий стол',      price: 12_000,     draw: 'desk',  variant: 'wide',   colors: 'wood', defaultColor: 'walnut', decorScore: 6,  comfort: 1, band: 'cozy' },
  { id: 'desk_l',      slot: 'desk', name: 'Угловой стол',      price: 180_000,    draw: 'desk',  variant: 'corner', colors: 'full', defaultColor: 'black',  decorScore: 12, comfort: 2, band: 'advanced' },
  { id: 'desk_glass',  slot: 'desk', name: 'Стеклянный стол',   price: 4_000_000,  draw: 'desk',  variant: 'glass',  colors: 'tech', defaultColor: 'graphite', decorScore: 20, comfort: 3, band: 'lux' },

  // --- Кресло ---
  { id: 'chair_basic',  slot: 'chair', name: 'Табурет',          price: 0,          draw: 'chair', variant: 'stool',  colors: 'wood', defaultColor: 'black',  decorScore: 1,  comfort: 0, band: 'start' },
  { id: 'chair_office', slot: 'chair', name: 'Офисное кресло',   price: 5_000,      draw: 'chair', variant: 'office', colors: 'soft', defaultColor: 'gray',   decorScore: 4,  comfort: 1, band: 'cozy' },
  { id: 'chair_gaming', slot: 'chair', name: 'Геймерское кресло', price: 180_000,   draw: 'chair', variant: 'gaming', colors: 'full', defaultColor: 'red',    decorScore: 11, comfort: 3, band: 'advanced' },
  { id: 'chair_throne', slot: 'chair', name: 'Трон стримера',    price: 6_000_000,  draw: 'chair', variant: 'throne', colors: 'full', defaultColor: 'purple', decorScore: 22, comfort: 4, band: 'lux' },

  // --- Главный монитор ---
  { id: 'monitor_24',    slot: 'monitor_main', name: 'Монитор 24"',      price: 0,          draw: 'monitor', variant: 'm24',   colors: 'tech', defaultColor: 'black',    decorScore: 2,  comfort: 0, band: 'start' },
  { id: 'monitor_27',    slot: 'monitor_main', name: 'Монитор 27" 144Гц', price: 9_000,     draw: 'monitor', variant: 'm27',   colors: 'tech', defaultColor: 'black',    decorScore: 5,  comfort: 0, band: 'cozy' },
  { id: 'monitor_ultra', slot: 'monitor_main', name: 'Ультраширокий',    price: 1_200_000,  draw: 'monitor', variant: 'ultra', colors: 'tech', defaultColor: 'graphite', decorScore: 18, comfort: 1, band: 'advanced' },
  { id: 'monitor_oled',  slot: 'monitor_main', name: 'OLED-панель',      price: 20_000_000, draw: 'monitor', variant: 'oled',  colors: 'tech', defaultColor: 'black',    decorScore: 26, comfort: 1, band: 'lux' },

  // --- Боковые мониторы ---
  { id: 'side_left',  slot: 'monitor_side_l', name: 'Второй монитор',   price: 60_000,  draw: 'monitor', variant: 'side', colors: 'tech', defaultColor: 'black', decorScore: 7, comfort: 0, band: 'advanced' },
  { id: 'side_right', slot: 'monitor_side_r', name: 'Третий монитор',   price: 320_000, draw: 'monitor', variant: 'side', colors: 'tech', defaultColor: 'black', decorScore: 9, comfort: 0, band: 'advanced' },

  // --- Ковры ---
  { id: 'rug_small', slot: 'rug', name: 'Коврик',            price: 600,     draw: 'rug', variant: 'small', colors: 'soft', defaultColor: 'gray',  decorScore: 2,  comfort: 0, band: 'start' },
  { id: 'rug_round', slot: 'rug', name: 'Круглый ковёр',     price: 15_000,  draw: 'rug', variant: 'round', colors: 'soft', defaultColor: 'mint',  decorScore: 5,  comfort: 1, band: 'cozy' },
  { id: 'rug_shag',  slot: 'rug', name: 'Пушистый ковёр',    price: 300_000, draw: 'rug', variant: 'shag',  colors: 'full', defaultColor: 'purple', decorScore: 10, comfort: 2, band: 'advanced' },

  // --- Растения ---
  { id: 'plant_cactus',   slot: 'plant',      name: 'Кактус',       price: 400,     draw: 'plant', variant: 'cactus',   colors: 'soft', defaultColor: 'green', decorScore: 1, comfort: 0, band: 'start' },
  { id: 'plant_ficus',    slot: 'plant',      name: 'Фикус',        price: 9_000,   draw: 'plant', variant: 'ficus',    colors: 'soft', defaultColor: 'green', decorScore: 4, comfort: 1, band: 'cozy' },
  { id: 'plant_monstera', slot: 'plant',      name: 'Монстера',     price: 220_000, draw: 'plant', variant: 'monstera', colors: 'soft', defaultColor: 'green', decorScore: 9, comfort: 1, band: 'advanced' },
  { id: 'plant_desk',     slot: 'desk_plant', name: 'Суккулент',    price: 900,     draw: 'plant', variant: 'desk',     colors: 'soft', defaultColor: 'mint',  decorScore: 2, comfort: 0, band: 'start' },

  // --- Стены ---
  { id: 'poster_game',      slot: 'wall_art_1', name: 'Постер игры',      price: 500,     draw: 'painting', variant: 'poster',  colors: 'full', defaultColor: 'blue',   decorScore: 2,  comfort: 0, band: 'start' },
  { id: 'painting_abstract', slot: 'wall_art_1', name: 'Абстракция',      price: 30_000,  draw: 'painting', variant: 'abstract', colors: 'full', defaultColor: 'purple', decorScore: 6,  comfort: 0, band: 'cozy' },
  { id: 'painting_neon',    slot: 'wall_art_1', name: 'Неоновая вывеска', price: 500_000, draw: 'painting', variant: 'neon',    colors: 'full', defaultColor: 'pink',   decorScore: 12, comfort: 0, band: 'advanced' },
  { id: 'poster_esport',    slot: 'wall_art_2', name: 'Киберспорт-постер', price: 700,    draw: 'painting', variant: 'poster',  colors: 'full', defaultColor: 'red',    decorScore: 2,  comfort: 0, band: 'start' },
  { id: 'painting_city',    slot: 'wall_art_2', name: 'Ночной город',     price: 45_000,  draw: 'painting', variant: 'city',    colors: 'full', defaultColor: 'cyan',   decorScore: 7,  comfort: 0, band: 'cozy' },

  // --- Полки ---
  { id: 'shelf_wood',  slot: 'shelf', name: 'Полка',           price: 5_000,   draw: 'shelf', variant: 'wood',  colors: 'wood', defaultColor: 'wood',  decorScore: 4, comfort: 0, band: 'cozy' },
  { id: 'shelf_glass', slot: 'shelf', name: 'Стеллаж-витрина', price: 150_000, draw: 'shelf', variant: 'glass', colors: 'tech', defaultColor: 'white', decorScore: 9, comfort: 1, band: 'advanced' },

  // --- Занавески ---
  { id: 'curtains_simple', slot: 'curtains', name: 'Занавески',        price: 2_000,  draw: 'curtains', variant: 'simple', colors: 'soft', defaultColor: 'cyan',  decorScore: 3, comfort: 1, band: 'start' },
  { id: 'curtains_black',  slot: 'curtains', name: 'Блэкаут-шторы',    price: 40_000, draw: 'curtains', variant: 'heavy',  colors: 'full', defaultColor: 'black', decorScore: 6, comfort: 2, band: 'cozy' },

  // --- Свет ---
  { id: 'lamp_desk', slot: 'lamp', name: 'Настольная лампа', price: 1_200,  draw: 'lamp', variant: 'desk', colors: 'soft', defaultColor: 'white', decorScore: 2, comfort: 0, band: 'start' },
  { id: 'lamp_neon', slot: 'lamp', name: 'Неоновая лампа',   price: 90_000, draw: 'lamp', variant: 'neon', colors: 'full', defaultColor: 'pink',  decorScore: 7, comfort: 0, band: 'advanced' },

  // --- Мелочи на столе ---
  { id: 'organizer_basic', slot: 'organizer', name: 'Органайзер',       price: 300,     draw: 'organizer', variant: 'basic', colors: 'soft', defaultColor: 'white',  decorScore: 1, comfort: 0, band: 'start' },
  { id: 'organizer_pro',   slot: 'organizer', name: 'Органайзер-хаб',   price: 20_000,  draw: 'organizer', variant: 'pro',   colors: 'tech', defaultColor: 'black',  decorScore: 4, comfort: 1, band: 'cozy' },
  { id: 'kb_membrane',     slot: 'keyboard',  name: 'Клавиатура',       price: 200,     draw: 'misc', variant: 'kb_membrane', colors: 'tech', defaultColor: 'black', decorScore: 1, comfort: 0, band: 'start' },
  { id: 'kb_mech',         slot: 'keyboard',  name: 'Механика',         price: 25_000,  draw: 'misc', variant: 'kb_mech',     colors: 'full', defaultColor: 'white', decorScore: 5, comfort: 0, band: 'cozy' },
  { id: 'kb_custom',       slot: 'keyboard',  name: 'Кастом-клава',     price: 900_000, draw: 'misc', variant: 'kb_custom',   colors: 'full', defaultColor: 'pink',  decorScore: 12, comfort: 1, band: 'advanced' },
  { id: 'mug_tea',         slot: 'mug',       name: 'Кружка чая',       price: 200,     draw: 'misc', variant: 'mug',         colors: 'soft', defaultColor: 'white', decorScore: 1, comfort: 0, band: 'start' },
  { id: 'mug_husky',       slot: 'mug',       name: 'Кружка с хаски',   price: 8_000,   draw: 'misc', variant: 'mug_husky',   colors: 'soft', defaultColor: 'cyan',  decorScore: 3, comfort: 1, band: 'cozy' },
  { id: 'headset_basic',   slot: 'headset',   name: 'Наушники',         price: 1_500,   draw: 'misc', variant: 'headset',     colors: 'tech', defaultColor: 'black', decorScore: 2, comfort: 0, band: 'start' },
  { id: 'headset_pro',     slot: 'headset',   name: 'Про-гарнитура',    price: 120_000, draw: 'misc', variant: 'headset_pro', colors: 'full', defaultColor: 'purple', decorScore: 7, comfort: 1, band: 'advanced' },

  // --- Крупные вещи ---
  { id: 'console_retro', slot: 'console',  name: 'Ретро-консоль',  price: 700_000,    draw: 'misc',     variant: 'console', colors: 'full', defaultColor: 'gray',   decorScore: 14, comfort: 2, band: 'advanced' },
  { id: 'arcade',        slot: 'console',  name: 'Аркадный автомат', price: 30_000_000, draw: 'misc',   variant: 'arcade',  colors: 'full', defaultColor: 'red',    decorScore: 28, comfort: 4, band: 'lux' },
  { id: 'aquarium',      slot: 'aquarium', name: 'Аквариум',       price: 8_000_000,  draw: 'misc',     variant: 'aquarium', colors: 'soft', defaultColor: 'cyan',  decorScore: 24, comfort: 4, band: 'lux' },
];

export const ITEMS = Object.fromEntries(ITEM_LIST.map((it) => [it.id, normalize(it)]));

function normalize(it) {
  return {
    tintable: true,
    requiresRank: BANDS[it.band]?.rank ?? 0,
    ...it,
  };
}

export function itemById(id) {
  return ITEMS[id] || null;
}

export function itemsForSlot(slot) {
  return ITEM_LIST.filter((it) => it.slot === slot).map((it) => ITEMS[it.id]);
}

export function allItems() {
  return Object.values(ITEMS);
}

/** Цена перекраски: первая бесплатна, дальше 5% стоимости. */
export function recolorPrice(item, alreadyRecolored) {
  if (!alreadyRecolored) return 0;
  return Math.max(50, Math.round(item.price * 0.05));
}
