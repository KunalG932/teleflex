/**
 * Calculator Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Calculator';
const HELP = 'Use /calc <expression> to calculate mathematical expressions';

// Export module handler function
function calculatorCommand(ctx) {
  const expression = ctx.message.text.slice(6).trim(); // Remove '/calc ' part
  
  if (!expression) {
    return ctx.reply('Please provide a math expression. Example: /calc 2 + 2');
  }
  
  try {
    // WARNING: In a production bot, never use eval for security reasons
    // This is just for demonstration purposes
    // Use a proper math expression parser instead
    const sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, '');
    const result = eval(sanitizedExpression);
    ctx.reply(`🧮 ${expression} = ${result}`);
  } catch (error) {
    ctx.reply('Sorry, I could not calculate that. Make sure it\'s a valid math expression.');
  }
}

module.exports = {
  MODULE,
  HELP,
  calculatorCommand
};