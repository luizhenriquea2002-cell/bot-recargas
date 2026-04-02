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

// ESCOLHER JOGO
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  const user = await Usuario.findOne({ chatId });

  if (text === '🔥 Free Fire') {
    user.etapa = 'ff';
    await user.save();

    return bot.sendMessage(chatId, '💎 100 Diamantes = R$5\nConfirmar compra? (sim)');
  }

  if (text === '🟦 Roblox') {
    user.etapa = 'roblox';
    await user.save();

    return bot.sendMessage(chatId, '🟦 80 Robux = R$10\nConfirmar compra? (sim)');
  }

  if (text === '⚔️ Mobile Legends') {
    user.etapa = 'ml';
    await user.save();

    return bot.sendMessage(chatId, '💎 86 Diamantes = R$6\nConfirmar compra? (sim)');
  }

  // CONFIRMAR COMPRA
  if (text.toLowerCase() === 'sim') {

    let preco = 0;
    let jogo = '';

    if (user.etapa === 'ff') {
      preco = 5;
      jogo = 'Free Fire';
    }

    if (user.etapa === 'roblox') {
      preco = 10;
      jogo = 'Roblox';
    }

    if (user.etapa === 'ml') {
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

    bot.sendMessage(chatId, `
🎉 Compra realizada!

🎮 Jogo: ${jogo}
💰 Valor: R$ ${preco}

⚡ Sua recarga será enviada em breve!
    `);
  }
});
