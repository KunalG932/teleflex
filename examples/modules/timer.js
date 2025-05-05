/**
 * Timer Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Timer';
const HELP = 'Use /timer <seconds> to start a countdown timer';

// Export module handler function
function timerCommand(ctx) {
  const seconds = parseInt(ctx.message.text.split(' ')[1]);
  
  if (isNaN(seconds) || seconds <= 0 || seconds > 300) {
    return ctx.reply('Please provide a valid number of seconds (1-300). Example: /timer 60');
  }
  
  ctx.reply(`⏱ Timer started for ${seconds} seconds!`);
  
  // In a real implementation, you would handle the timer properly
  // This is just a demonstration of the command
  // setTimeout(() => {
  //   ctx.reply('⏱ Time is up!');
  // }, seconds * 1000);
}

module.exports = {
  MODULE,
  HELP,
  timerCommand
};