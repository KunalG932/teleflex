/**
 * Basic Telegram Bot Example using TeleFlex
 * 
 * This example demonstrates how to create a Telegram bot with dynamic help menus using TeleFlex.
 */

const { Telegraf } = require('telegraf');
const TeleFlex = require('../src/teleflex');
const fs = require('fs');
const path = require('path');

// Set your Telegram bot token here
const BOT_TOKEN = '';

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Set up TeleFlex with custom options
const teleflex = new TeleFlex(bot, {
  modulesPath: path.join(__dirname, 'modules'), // Path to modules directory
  buttonsPerPage: 5,                            // Number of buttons per page in help menu
  theme: 'minimal',                              // Theme to use (default, minimal, modern)
  parseMode: 'Markdown',                        // Parse mode for messages (Markdown, HTML)
  buttonLayout: 2,                              // Button columns in help menu
  floodWait: 500,                               // Minimum time between actions (ms)
  texts: {                                      // Custom text strings
    helpMenuTitle: '📚 Bot Commands',
    helpMenuIntro: 'Here are the available commands ({count}):\n{modules}\n\nSelect a command to see how to use it.',
    helpButton: '❓ Help'                        // Customize the help button text
  }
});

// Make teleflex instance available to all contexts
bot.use((ctx, next) => {
  ctx.teleflex = teleflex;
  return next();
});

// Add custom callback for the Weather module
teleflex.onModuleSelect('Weather', (ctx) => {
  ctx.reply('Weather module was selected! Please use /weather <city> to check the weather.');
});

// Import module handlers from module files
const startModule = require('./modules/start');
const echoModule = require('./modules/echo');
const randomModule = require('./modules/random');
const aboutModule = require('./modules/about');
const weatherModule = require('./modules/weather');

// Import the new modules
const pollModule = require('./modules/poll');
const reminderModule = require('./modules/reminder');
const calculatorModule = require('./modules/calculator');
const translateModule = require('./modules/translate');
const newsModule = require('./modules/news');
const quoteModule = require('./modules/quote');
const timerModule = require('./modules/timer');
const gameModule = require('./modules/game');
const currencyModule = require('./modules/currency');
const memeModule = require('./modules/meme');
const todoModule = require('./modules/todo');

// Set up your bot commands
bot.command('start', startModule.startCommand);
bot.command('help', (ctx) => {
  teleflex.showHelpMenu(ctx);
});
bot.command('echo', echoModule.echoCommand);
bot.command('random', randomModule.randomCommand);
bot.command('about', aboutModule.aboutCommand);
bot.command('weather', weatherModule.weatherCommand);
bot.command('poll', pollModule.pollCommand);
bot.command('reminder', reminderModule.reminderCommand);
bot.command('calc', calculatorModule.calculatorCommand);
bot.command('translate', translateModule.translateCommand);
bot.command('news', newsModule.newsCommand);
bot.command('quote', quoteModule.quoteCommand);
bot.command('timer', timerModule.timerCommand);
bot.command('game', gameModule.gameCommand);
bot.command('currency', currencyModule.currencyCommand);
bot.command('meme', memeModule.memeCommand);
bot.command('todo', todoModule.todoCommand);

// Add custom callbacks for some of the new modules
teleflex.onModuleSelect('Calculator', (ctx) => {
  ctx.reply('Calculator module selected! Use /calc <expression> to calculate mathematical expressions.');
});

teleflex.onModuleSelect('Game', (ctx) => {
  ctx.reply('Game module selected! Use /game to start a new number guessing game.');
});

teleflex.onModuleSelect('Todo', (ctx) => {
  ctx.reply('Todo list module selected! Use /todo add <task> to add a task or /todo list to see your tasks.');
});

// Set up TeleFlex handlers for the help menu
teleflex.setupHandlers();

// Start the bot
console.log('Starting TeleFlex Example Bot...');
bot.launch().then(() => {
  console.log('Bot is running! Press Ctrl+C to stop.');
}).catch(err => {
  console.error('Failed to start bot:', err);
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));