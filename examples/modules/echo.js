/**
 * Echo Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Echo';
const HELP = 'Use /echo <message> to make the bot repeat your message';

// Export module handler function
function echoCommand(ctx) {
  const message = ctx.message.text.split(' ').slice(1).join(' ');
  if (message) {
    ctx.reply(`Echo: ${message}`);
  } else {
    ctx.reply('Please provide a message to echo. Usage: /echo Hello World');
  }
}

module.exports = {
  MODULE,
  HELP,
  echoCommand
};