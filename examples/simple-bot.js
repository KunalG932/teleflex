const { Telegraf } = require('telegraf');
const { TeleFlex } = require('../src/teleflex');

// Create bot instance
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create TeleFlex instance with basic configuration
const teleflex = new TeleFlex(bot, {
  theme: 'modern',
  enableSession: true,
  buttonLayout: 2,
  texts: {
    helpMenuTitle: '🤖 Bot Commands',
    successMessage: '✨ {message}',
    errorMessage: '💥 {message}',
    infoMessage: '💡 {message}'
  }
});

// Register basic modules
teleflex.registerModule('Basic Commands', `
/start - Start the bot
/help - Show this help menu
/info - Show bot information
/echo <text> - Echo your message
`);

teleflex.registerModule('User Commands', `
/setname <name> - Set your name
/getname - Get your name
/clear - Clear your data
`);

// Start command
bot.command('start', async (ctx) => {
  const keyboard = teleflex.createInlineKeyboard([
    { text: 'Show Help', callback_data: 'help' },
    { text: 'Set Name', callback_data: 'setname' }
  ]);

  await ctx.reply('Welcome to Simple Bot! 👋\n\nUse /help to see available commands.', {
    reply_markup: keyboard
  });
});

// Help command
bot.command('help', async (ctx) => {
  await teleflex.showHelpMenu(ctx);
});

// Info command
bot.command('info', async (ctx) => {
  await teleflex.sendInfo(ctx, 'This is a simple bot built with Teleflex!');
});

// Echo command
bot.command('echo', async (ctx) => {
  const text = ctx.message.text.split(' ').slice(1).join(' ');
  if (!text) {
    await teleflex.sendError(ctx, 'Please provide some text to echo!');
    return;
  }
  await teleflex.sendSuccess(ctx, text);
});

// Set name command
bot.command('setname', async (ctx) => {
  const name = ctx.message.text.split(' ').slice(1).join(' ');
  if (!name) {
    await teleflex.sendError(ctx, 'Please provide a name!');
    return;
  }

  if (!ctx.session) {
    await teleflex.sendError(ctx, 'Session is not enabled!');
    return;
  }

  ctx.session.userData = { name };
  await teleflex.sendSuccess(ctx, `Name set to: ${name}`);
});

// Get name command
bot.command('getname', async (ctx) => {
  if (!ctx.session) {
    await teleflex.sendError(ctx, 'Session is not enabled!');
    return;
  }

  const name = ctx.session.userData?.name;
  if (!name) {
    await teleflex.sendError(ctx, 'No name set! Use /setname to set your name.');
    return;
  }

  await teleflex.sendInfo(ctx, `Your name is: ${name}`);
});

// Clear command
bot.command('clear', async (ctx) => {
  if (!ctx.session) {
    await teleflex.sendError(ctx, 'Session is not enabled!');
    return;
  }

  ctx.session.userData = {};
  await teleflex.sendSuccess(ctx, 'Your data has been cleared!');
});

// Handle callback queries
bot.action('help', async (ctx) => {
  await teleflex.showHelpMenu(ctx);
});

bot.action('setname', async (ctx) => {
  await teleflex.sendInfo(ctx, 'Use /setname <your name> to set your name.');
});

// Setup all handlers
teleflex.setupHandlers();

// Start the bot
bot.launch().then(() => {
  console.log('Bot started successfully!');
}).catch((error) => {
  console.error('Failed to start bot:', error);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM')); 