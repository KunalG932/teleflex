/**
 * Reminder Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Reminder';
const HELP = 'Use /reminder <time_in_minutes> <message> to set a reminder';

// Export module handler function
function reminderCommand(ctx) {
  const args = ctx.message.text.split(' ');
  
  if (args.length < 3) {
    return ctx.reply('Please specify time in minutes and message. Example: /reminder 10 Check the oven');
  }
  
  const minutes = parseInt(args[1]);
  if (isNaN(minutes) || minutes <= 0) {
    return ctx.reply('Please provide a valid number of minutes.');
  }
  
  const message = args.slice(2).join(' ');
  ctx.reply(`⏰ I'll remind you about "${message}" in ${minutes} minutes.`);
  
  // In a real implementation, you would set a timer
  // For this demo we just show the response
  // setTimeout(() => {
  //   ctx.reply(`⏰ REMINDER: ${message}`);
  // }, minutes * 60000);
}

module.exports = {
  MODULE,
  HELP,
  reminderCommand
};