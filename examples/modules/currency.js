/**
 * Currency Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Currency';
const HELP = 'Use /currency <amount> <from> <to> to convert currencies (e.g., /currency 100 USD EUR)';

// Export module handler function
function currencyCommand(ctx) {
  const args = ctx.message.text.split(' ');
  
  if (args.length !== 4) {
    return ctx.reply('Please use the format: /currency <amount> <from> <to>\nExample: /currency 100 USD EUR');
  }
  
  const amount = parseFloat(args[1]);
  if (isNaN(amount)) {
    return ctx.reply('Please provide a valid amount.');
  }
  
  const fromCurrency = args[2].toUpperCase();
  const toCurrency = args[3].toUpperCase();
  
  // Mock exchange rates - in a real bot, you would use an API
  const rates = {
    'USD': { 'EUR': 0.92, 'GBP': 0.78, 'JPY': 149.8, 'CAD': 1.36, 'AUD': 1.53 },
    'EUR': { 'USD': 1.09, 'GBP': 0.85, 'JPY': 163.5, 'CAD': 1.48, 'AUD': 1.67 },
    'GBP': { 'USD': 1.28, 'EUR': 1.18, 'JPY': 192.0, 'CAD': 1.74, 'AUD': 1.96 }
  };
  
  // Check if currencies are supported
  if (!rates[fromCurrency]) {
    return ctx.reply(`Currency ${fromCurrency} is not supported. Supported base currencies: ${Object.keys(rates).join(', ')}`);
  }
  
  if (!rates[fromCurrency][toCurrency]) {
    return ctx.reply(`Conversion to ${toCurrency} is not supported from ${fromCurrency}.`);
  }
  
  const convertedAmount = amount * rates[fromCurrency][toCurrency];
  ctx.reply(`💱 ${amount} ${fromCurrency} = ${convertedAmount.toFixed(2)} ${toCurrency}`);
}

module.exports = {
  MODULE,
  HELP,
  currencyCommand
};