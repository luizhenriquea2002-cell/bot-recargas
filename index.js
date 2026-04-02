require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
app.use(express.json());

// controle de pedidos
let pedidos = {};

// MENU INICIAL
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

  if (text === '/start') return;

  // CANCELAR
  if (text === '❌ Cancelar') {
    delete pedidos[chatId];
    return bot.sendMessage(chatId, '❌ Pedido cancelado.');
  }

  // ESCOLHA DO JOGO
  if (text === '🔥 Free Fire') {
    pedidos[chatId] = { jogo: 'Free Fire', etapa: 'pacote', chatId };

    return bot.sendMessage(chatId, 'Escolha o pacote:', {
      reply_markup: {
        keyboard: [
          ['💎 100 - R$5'],
          ['💎 310 - R$15'],
          ['❌ Cancelar']
        ],
        resize_keyboard: true
      }
    });
  }

  // PACOTES
  if (text.includes('💎') && pedidos[chatId]?.etapa === 'pacote') {
    pedidos[chatId].valor = text.includes('100') ? 5 : 15;
    pedidos[chatId].etapa = 'id';

    return bot.sendMessage(chatId, 'Digite seu ID do jogo:');
  }

  // RECEBER ID
  if (pedidos[chatId]?.etapa === 'id') {
    pedidos[chatId].player_id = text;
    pedidos[chatId].etapa = 'pagamento';

    const pagamento = await criarPix(pedidos[chatId].valor);
    pedidos[chatId].txid = pagamento.txid;

    return bot.sendMessage(chatId, `
💳 PAGAMENTO PIX

${pagamento.qrcode}

Clique quando pagar:
    `, {
      reply_markup: {
        keyboard: [
          ['✅ Já paguei'],
          ['❌ Cancelar']
        ],
        resize_keyboard: true
      }
    });
  }

  // CONFIRMAÇÃO MANUAL
  if (text === '✅ Já paguei' && pedidos[chatId]) {
    return bot.sendMessage(chatId, '⏳ Verificando pagamento...');
  }
});

// PIX
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
      qrcode: 'PIX_MANUAL_AQUI',
      txid: Math.random().toString()
    };
  }
}

// WEBHOOK
app.post('/webhook', async (req, res) => {
  const txid = req.body.id;

  const pedido = Object.values(pedidos).find(p => p.txid === txid);

  if (pedido) {
    await bot.sendMessage(pedido.chatId, '✅ Pagamento confirmado!');

    await enviarRecarga(pedido);

    await bot.sendMessage(pedido.chatId, '🎉 Recarga enviada com sucesso!');

    delete pedidos[pedido.chatId];
  }

  res.sendStatus(200);
});

// ENTREGA
async function enviarRecarga(pedido) {
  console.log('ENVIAR:', pedido);

  // integrar API aqui depois
}

app.listen(process.env.PORT || 3000, () => {
  console.log('🚀 Rodando...');
});
