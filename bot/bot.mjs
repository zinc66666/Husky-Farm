// Минимальный Telegram-бот для запуска мини-приложения.
// Зависимостей нет: только fetch и long polling, нужен Node 18+.
//
//   BOT_TOKEN=123:ABC WEBAPP_URL=https://zinc66666.github.io/Husky-Farm/ node bot/bot.mjs
//
// Кнопку меню (синяя кнопка слева от поля ввода) достаточно настроить один раз —
// бот делает это сам при старте.

const TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;

if (!TOKEN || !WEBAPP_URL) {
  console.error('Нужны переменные окружения BOT_TOKEN и WEBAPP_URL (https://…).');
  process.exit(1);
}
if (!WEBAPP_URL.startsWith('https://')) {
  console.error('Telegram открывает мини-приложения только по https.');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

async function call(method, payload) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

const WELCOME = [
  'Привет! Это Husky Farm — твоя комната геймера.',
  '',
  'Персонаж играет, пока тебя нет, и приносит монеты. На них покупается мощность',
  'компьютера и декор: столы, кресла, мониторы, полки, растения — всё',
  'перекрашивается в любой цвет. Освещение, сезон и погода в комнате совпадают',
  'с реальным временем.',
  '',
  'Жми кнопку ниже, чтобы открыть игру.',
].join('\n');

const keyboard = {
  inline_keyboard: [[{ text: '🎮 Открыть комнату', web_app: { url: WEBAPP_URL } }]],
};

async function handleUpdate(update) {
  const msg = update.message;
  if (!msg || !msg.text) return;
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text.startsWith('/start') || text.startsWith('/play') || text.startsWith('/game')) {
    await call('sendMessage', { chat_id: chatId, text: WELCOME, reply_markup: keyboard });
    return;
  }
  if (text.startsWith('/help')) {
    await call('sendMessage', {
      chat_id: chatId,
      text: 'Команды: /start — открыть игру, /help — эта справка.',
      reply_markup: keyboard,
    });
  }
}

async function main() {
  const me = await call('getMe');
  console.log(`Бот @${me.username} запущен, мини-приложение: ${WEBAPP_URL}`);

  await call('setChatMenuButton', {
    menu_button: { type: 'web_app', text: 'Играть', web_app: { url: WEBAPP_URL } },
  });
  await call('setMyCommands', {
    commands: [
      { command: 'start', description: 'Открыть комнату' },
      { command: 'help', description: 'Справка' },
    ],
  });

  let offset = 0;
  for (;;) {
    try {
      const updates = await call('getUpdates', { offset, timeout: 30 });
      for (const update of updates) {
        offset = update.update_id + 1;
        await handleUpdate(update).catch((err) => console.error('update:', err.message));
      }
    } catch (err) {
      console.error('polling:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
