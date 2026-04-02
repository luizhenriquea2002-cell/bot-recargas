require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

// CRIAR BOT
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

console.log('🤖 Bot iniciado...');

// TESTE /start
bot.onText(/\/start/, (msg) => {
  console.log('START RECEBIDO');
  bot.sendMessage(msg.chat.id, '✅ Bot está funcionando!');
});

// ERRO
bot.on('polling_error', (error) => {
  console.log('ERRO:', error);
});
