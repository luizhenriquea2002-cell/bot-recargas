require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 🔗 CONEXÃO MONGODB
mongoose.connect(process.env.MONGO_URL)
.then(() => console.log('Mongo conectado'))
.catch(err => console.log(err));

// 📦 MODEL
const Pedido = mongoose.model('Pedido', {
  chatId: Number,
  jogo: String,
  player_id: String,
  valor: Number,
  status: String
});

// MENU
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

// FLUXO
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === '/start') return;

  if (text === '🔥 Free Fire') {
    return bot.sendMessage(chatId, '💎 100 diamantes - R$5\nDigite seu ID:');
  }

  // salvar pedido
  if (!text.includes('Free Fire') && !text.includes('Roblox')) {

    const pedido = await Pedido.create({
      chatId,
      jogo: 'Free Fire',
      player_id: text,
      valor: 5,
      status: 'pendente'
    });

    bot.sendMessage(chatId, '💳 Envie o Pix e aguarde confirmação.');
  }
});

// 📊 API ADMIN
app.get('/pedidos', async (req, res) => {
  const pedidos = await Pedido.find().sort({ _id: -1 });
  res.json(pedidos);
});

// ✅ CONFIRMAR
app.post('/confirmar/:id', async (req, res) => {
  const pedido = await Pedido.findById(req.params.id);

  pedido.status = 'pago';
  await pedido.save();

  bot.sendMessage(pedido.chatId, '✅ Pagamento confirmado!');
  bot.sendMessage(pedido.chatId, '🎉 Recarga enviada!');

  res.send('OK');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Servidor rodando');
});
app.get('/', (req, res) => {
  res.redirect('/admin.html');
});
