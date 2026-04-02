// MENU DE JOGOS
bot.onText(/💳 Comprar Recargas/, async (msg) => {
  bot.sendMessage(msg.chat.id, '🎮 Escolha o jogo:', {
    reply_markup: {
      keyboard: [
        ['🔥 Free Fire', '🟦 Roblox'],
        ['⚔️ Mobile Legends'],
        ['⬅️ Voltar']
      ],
      resize_keyboard: true
    }
  });
});

// FLUXO ÚNICO (SEM BUG)
bot.on('message', async (msg) => {
  try {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (!text) return;

    const user = await Usuario.findOne({ chatId });
    if (!user) return;

    // IGNORAR COMANDOS PRINCIPAIS
    if (text === '/start' || text === '💳 Comprar GG') return;

    // ESCOLHER JOGO
    if (text === '🔥 Free Fire') {
      user.etapa = 'ff_id';
      await user.save();
      return bot.sendMessage(chatId, 'Digite seu ID do Free Fire:');
    }

    if (text === '🟦 Roblox') {
      user.etapa = 'rb_id';
      await user.save();
      return bot.sendMessage(chatId, 'Digite seu ID/Username do Roblox:');
    }

    if (text === '⚔️ Mobile Legends') {
      user.etapa = 'ml_id';
      await user.save();
      return bot.sendMessage(chatId, 'Digite seu ID do Mobile Legends:');
    }

    // RECEBER ID
    if (['ff_id', 'rb_id', 'ml_id'].includes(user.etapa)) {

      user.player_id = text;

      if (user.etapa === 'ff_id') {
        user.etapa = 'ff_confirm';
        await user.save();

        return bot.sendMessage(chatId, `
💎 Free Fire

ID: ${text}
Pacote: 100 Diamantes
Valor: R$5

Confirmar compra? (sim)
        `);
      }

      if (user.etapa === 'rb_id') {
        user.etapa = 'rb_confirm';
        await user.save();

        return bot.sendMessage(chatId, `
🟦 Roblox

Usuário: ${text}
Pacote: 80 Robux
Valor: R$10

Confirmar compra? (sim)
        `);
      }

      if (user.etapa === 'ml_id') {
        user.etapa = 'ml_confirm';
        await user.save();

        return bot.sendMessage(chatId, `
⚔️ Mobile Legends

ID: ${text}
Pacote: 86 Diamantes
Valor: R$6

Confirmar compra? (sim)
        `);
      }
    }

    // CONFIRMAR COMPRA
    if (text.toLowerCase() === 'sim') {

      let preco = 0;
      let jogo = '';

      if (user.etapa === 'ff_confirm') {
        preco = 5;
        jogo = 'Free Fire';
      }

      if (user.etapa === 'rb_confirm') {
        preco = 10;
        jogo = 'Roblox';
      }

      if (user.etapa === 'ml_confirm') {
        preco = 6;
        jogo = 'Mobile Legends';
      }

      if (!preco) return;

      if (user.saldo < preco) {
        return bot.sendMessage(chatId, '❌ Saldo insuficiente');
      }

      user.saldo -= preco;
      user.etapa = null;

      await user.save();

      return bot.sendMessage(chatId, `
🎉 Compra realizada!

🎮 Jogo: ${jogo}
👤 ID: ${user.player_id}
💰 Valor: R$ ${preco}

⚡ Enviando recarga...
      `);
    }

  } catch (err) {
    console.log('ERRO:', err);
  }
});
