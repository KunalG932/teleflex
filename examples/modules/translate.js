/**
 * Translate Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Translate';
const HELP = 'Use /translate <lang> <text> to translate text (e.g., /translate es Hello)';

// Export module handler function
function translateCommand(ctx) {
  const args = ctx.message.text.split(' ');
  
  if (args.length < 3) {
    return ctx.reply('Please specify language code and text. Example: /translate es Hello world');
  }
  
  const langCode = args[1].toLowerCase();
  const text = args.slice(2).join(' ');
  
  // This is a mock translation - in a real bot you would use a translation API
  const translations = {
    'es': { 'hello': 'hola', 'world': 'mundo', 'hello world': 'hola mundo' },
    'fr': { 'hello': 'bonjour', 'world': 'monde', 'hello world': 'bonjour monde' },
    'de': { 'hello': 'hallo', 'world': 'welt', 'hello world': 'hallo welt' }
  };
  
  const supportedLangs = Object.keys(translations);
  
  if (!supportedLangs.includes(langCode)) {
    return ctx.reply(`Language not supported. Try one of these: ${supportedLangs.join(', ')}`);
  }
  
  const translated = translations[langCode][text.toLowerCase()] || `[Translation of "${text}" to ${langCode}]`;
  
  ctx.reply(`🌐 Translation: ${translated}`);
}

module.exports = {
  MODULE,
  HELP,
  translateCommand
};