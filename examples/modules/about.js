/**
 * About Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'About';
const HELP = 'Use /about to learn more about this bot';

// Export module handler function
function aboutCommand(ctx) {
  ctx.reply('This is a demo bot showcasing the TeleFlex library for Telegraf.\nGitHub: https://github.com/kunalg932/teleflex');
}

module.exports = {
  MODULE,
  HELP,
  aboutCommand
};