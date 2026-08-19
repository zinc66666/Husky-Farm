// Сезон из месяца: вид за окном, оттенок и длина светового дня.
// Зимой рассвет позже, а закат раньше — короткий день получается из того же LUT.

export const SEASONS = {
  winter: {
    name: 'Зима',
    sunrise: 8.0, sunset: 16.5,
    ground: '#dfe6f2', foliage: '#4a5d5a', trunk: '#43382f',
    snowCover: 1, ambient: '#c9d8ee',
    fall: 'snow', fallRate: 0.35,
    weather: [
      { v: 'clear', w: 3 }, { v: 'cloudy', w: 4 }, { v: 'snow', w: 4 },
      { v: 'fog', w: 2 }, { v: 'rain', w: 0.6 },
    ],
  },
  spring: {
    name: 'Весна',
    sunrise: 6.0, sunset: 20.0,
    ground: '#6ea45f', foliage: '#7ec96a', trunk: '#5a4632',
    snowCover: 0, ambient: '#e6f2e0',
    fall: 'petals', fallRate: 0.18,
    weather: [
      { v: 'clear', w: 4 }, { v: 'cloudy', w: 3 }, { v: 'rain', w: 3 },
      { v: 'fog', w: 1.4 }, { v: 'hail', w: 0.5 },
    ],
  },
  summer: {
    name: 'Лето',
    sunrise: 5.0, sunset: 21.5,
    ground: '#6fae55', foliage: '#4f9c46', trunk: '#5a4632',
    snowCover: 0, ambient: '#fff3d8',
    fall: null, fallRate: 0,
    weather: [
      { v: 'clear', w: 6 }, { v: 'cloudy', w: 2.4 }, { v: 'rain', w: 2 },
      { v: 'hail', w: 0.5 }, { v: 'fog', w: 0.6 },
    ],
  },
  autumn: {
    name: 'Осень',
    sunrise: 7.0, sunset: 18.5,
    ground: '#8b7a4e', foliage: '#d08a3c', trunk: '#4d3b2a',
    snowCover: 0, ambient: '#f0dcc0',
    fall: 'leaves', fallRate: 0.22,
    weather: [
      { v: 'clear', w: 2.4 }, { v: 'cloudy', w: 4 }, { v: 'rain', w: 4 },
      { v: 'fog', w: 3 }, { v: 'hail', w: 0.6 },
    ],
  },
};

const MONTH_TO_SEASON = [
  'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
  'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter',
];

export function seasonForMonth(month) {
  return MONTH_TO_SEASON[Math.max(0, Math.min(11, month | 0))];
}

export function seasonData(key) {
  return SEASONS[key] || SEASONS.summer;
}
