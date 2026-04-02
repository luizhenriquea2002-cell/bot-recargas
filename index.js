require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
app.use(express.json());

let pedidos = {};

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '🎮 LZ7 RECARGAS', {
    reply_markup: {
      keyboard: [
        ['🔥 Free Fire', '🟦 Roblox'],
        ['⚔️ Mobile Legends']
      ],
      resize_keyboard: true
    }
  });
});

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '🔥 Free Fire') {
    pedidos[chatId] = { jogo: 'Free Fire', valor: 5, chatId };
    return bot.sendMessage(chatId, '💎 100 diamantes - R$5\nDigite seu ID:');
  }

  if (text === '🟦 Roblox') {
    pedidos[chatId] = { jogo: 'Roblox', valor: 10, chatId };
    return bot.sendMessage(chatId, '🟦 80 Robux - R$10\nDigite seu ID:');
  }

  if (text === '⚔️ Mobile Legends') {
    pedidos[chatId] = { jogo: 'Mobile Legends', valor: 6, chatId };
    return bot.sendMessage(chatId, '💎 86 diamantes - R$6\nDigite seu ID:');
  }

  if (pedidos[chatId] && !pedidos[chatId].player_id) {
    pedidos[chatId].player_id = text;

    const pagamento = await criarPix(pedidos[chatId].valor);

    pedidos[chatId].txid = pagamento.txid;

    bot.sendMessage(chatId, `
💳 PIX

${pagamento.qrcode}

Aguarde confirmação automática ⏳
    `);
  }
});

async function criarPix(valor) {
  try {
    const res = await axios.post(process.env.PIX_API_URL, {
      amount: valor
    });

    return {
      qrcode: res.data.qr_code || 'PIX_AQUI',
      txid: res.data.id || Math.random().toString()
    };
  } catch {
    return {
      qrcode: 'PIX_MANUAL',
      txid: Math.random().toString()
    };
  }
}

app.post('/webhook', async (req, res) => {
  const txid = req.body.id;

  const pedido = Object.values(pedidos).find(p => p.txid === txid);

  if (pedido) {
    await bot.sendMessage(pedido.chatId, '✅ Pagamento confirmado!');
    await bot.sendMessage(pedido.chatId, '🎉 Recarga enviada!');
  }

  res.sendStatus(200);
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Rodando...');
});
