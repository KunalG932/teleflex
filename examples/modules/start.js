/**
 * Start Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Start';
const HELP = 'Use /start to initialize the bot and see the welcome message';

// Export module handler function
function startCommand(ctx) {
  // Access teleflex instance via global bot instance
  if (ctx.teleflex) {
    // Define URL buttons in a grid format
    const buttons = [
      { text: 'GitHub', url: 'https://github.com' },
      { text: 'Telegram', url: 'https://telegram.org' },
      { text: 'Documentation', url: 'https://core.telegram.org/bots/api' },
      { text: 'News', url: 'https://telegram.org/blog' },
      { text: 'Support', callback_data: 'support:contact' },
      { text: 'About', callback_data: 'about:info' }
    ];

    // Use the enhanced sendStartMessage method with grid buttons and help button
    ctx.teleflex.sendStartMessage(
      ctx, 
      '👋 Welcome to the TeleFlex Example Bot!\n\nExplore our useful links below or use the help button for commands.',
      {
        buttons: buttons,
        columns: 2, // Two buttons per row
        includeHelp: true // Add help button at the bottom
      }
    );
  } else {
    // Fallback if teleflex instance is not available
    ctx.reply('👋 Welcome to the TeleFlex Example Bot! Type /help to see available commands.');
  }
}

module.exports = {
  MODULE,
  HELP,
  startCommand
};