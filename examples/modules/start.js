/**
 * Start Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Start';
const HELP = 'Use /start to initialize the bot and see the welcome message';

// Export module handler function
function startCommand(ctx) {
  ctx.reply('👋 Welcome to the TeleFlex Example Bot! Type /help to see available commands.');
}

module.exports = {
  MODULE,
  HELP,
  startCommand
};