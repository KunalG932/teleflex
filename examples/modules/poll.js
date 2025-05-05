/**
 * Poll Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Poll';
const HELP = 'Use /poll <question> | <option1> | <option2> | ... to create a poll';

// Export module handler function
function pollCommand(ctx) {
  const text = ctx.message.text.slice(6); // Remove the '/poll ' part
  if (!text) {
    return ctx.reply('Please provide a question and options separated by | character.\nExample: /poll Do you like pizza? | Yes | No | Maybe');
  }

  const parts = text.split('|').map(part => part.trim());
  if (parts.length < 3) {
    return ctx.reply('Please provide a question and at least 2 options separated by | character.');
  }

  const question = parts[0];
  const options = parts.slice(1);

  // For a real implementation, you would use ctx.telegram.sendPoll
  // This is just a simple simulation
  ctx.reply(`📊 Poll created: "${question}"\n\nOptions:\n${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}`);
}

module.exports = {
  MODULE,
  HELP,
  pollCommand
};