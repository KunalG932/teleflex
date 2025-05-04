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
const BOT_TOKEN = '7518235640:AAHChkrH6-vaZuItuZmicj9-wQz04OstLE4';

// Initialize the bot
const bot = new Telegraf(BOT_TOKEN);

// Set up TeleFlex with custom options
const teleflex = new TeleFlex(bot, {
  modulesPath: path.join(__dirname, 'modules'), // Path to modules directory
  buttonsPerPage: 5,                            // Number of buttons per page in help menu
  theme: 'modern',                              // Theme to use (default, minimal, modern)
  parseMode: 'Markdown',                        // Parse mode for messages (Markdown, HTML)
  buttonLayout: 2,                              // Button columns in help menu
  floodWait: 500,                               // Minimum time between actions (ms)
  texts: {                                      // Custom text strings
    helpMenuTitle: '📚 Bot Commands',
    helpMenuIntro: 'Here are the available commands ({count}):\n{modules}\n\nSelect a command to see how to use it.',
  }
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

// Set up your bot commands
bot.command('start', startModule.startCommand);
bot.command('help', (ctx) => {
  teleflex.showHelpMenu(ctx);
});
bot.command('echo', echoModule.echoCommand);
bot.command('random', randomModule.randomCommand);
bot.command('about', aboutModule.aboutCommand);
bot.command('weather', weatherModule.weatherCommand);

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