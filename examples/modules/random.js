/**
 * Random Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Random';
const HELP = 'Use /random to get a random number between 1-100';

// Export module handler function
function randomCommand(ctx) {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  ctx.reply(`🎲 Your random number is: ${randomNumber}`);
}

module.exports = {
  MODULE,
  HELP,
  randomCommand
};