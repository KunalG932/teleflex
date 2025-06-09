const { Telegraf } = require('telegraf');
const { TeleFlex } = require('../src/teleflex');

// Create bot instance
const bot = new Telegraf(process.env.BOT_TOKEN);

// Create TeleFlex instance with all new features enabled
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  theme: 'modern',
  enableSession: true,
  enableWebApp: true,
  enableInlineMode: true,
  buttonLayout: 2,
  texts: {
    helpMenuTitle: '🤖 Bot Commands',
    helpMenuIntro: 'Here are the available commands ({count}):\n{modules}\n\nSelect a command to see how to use it.',
    moduleHelpTitle: '📚 {moduleName} Commands',
    moduleHelpIntro: '{helpText}',
    successMessage: '✨ {message}',
    errorMessage: '💥 {message}',
    infoMessage: '💡 {message}'
  }
});

// Register some example modules
teleflex.registerModule('Basic Commands', `
/start - Start the bot
/help - Show this help menu
/info - Show bot information
`);

teleflex.registerModule('Web App Demo', `
/webapp - Open the Web App demo
`);

teleflex.registerModule('Session Demo', `
/session - Show session demo
/setname - Set your name
/getname - Get your name
`);

// Start command with Web App button
bot.command('start', async (ctx) => {
  const webAppButton = teleflex.createWebAppButton('Open Web App', 'https://your-web-app.com');
  const keyboard = teleflex.createInlineKeyboard([
    webAppButton,
    { text: 'Show Help', callback_data: 'help' }
  ]);

  await ctx.reply('Welcome to the Advanced Bot Demo!', {
    reply_markup: keyboard
  });
});

// Web App demo command
bot.command('webapp', async (ctx) => {
  const keyboard = teleflex.createInlineKeyboard([
    {
      text: 'Open Web App',
      web_app: { url: 'https://your-web-app.com' }
    },
    {
      text: 'Visit Website',
      url: 'https://your-website.com'
    }
  ]);

  await ctx.reply('Try out our Web App:', {
    reply_markup: keyboard
  });
});

// Session demo commands
bot.command('session', async (ctx) => {
  if (!ctx.session) {
    await teleflex.sendError(ctx, 'Session is not enabled!');
    return;
  }

  await teleflex.sendInfo(ctx, 'Session is working! Try /setname and /getname commands.');
});

bot.command('setname', async (ctx) => {
  if (!ctx.session) {
    await teleflex.sendError(ctx, 'Session is not enabled!');
    return;
  }

  const name = ctx.message.text.split(' ').slice(1).join(' ');
  if (!name) {
    await teleflex.sendError(ctx, 'Please provide a name!');
    return;
  }

  ctx.session.userData = { name };
  await teleflex.sendSuccess(ctx, `Name set to: ${name}`);
});

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

// Help command with custom keyboard
bot.command('help', async (ctx) => {
  const keyboard = teleflex.createInlineKeyboard([
    { text: 'Basic Commands', callback_data: 'module:Basic Commands' },
    { text: 'Web App Demo', callback_data: 'module:Web App Demo' },
    { text: 'Session Demo', callback_data: 'module:Session Demo' }
  ]);

  await ctx.reply('Select a category:', {
    reply_markup: keyboard
  });
});

// Handle Web App data
bot.on('web_app_data', async (ctx) => {
  const data = ctx.update.message.web_app_data.data;
  try {
    const parsedData = JSON.parse(data);
    await teleflex.sendSuccess(ctx, `Received data from Web App: ${JSON.stringify(parsedData)}`);
  } catch (error) {
    await teleflex.sendError(ctx, 'Failed to parse Web App data');
  }
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