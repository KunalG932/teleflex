/**
 * Quote Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Quote';
const HELP = 'Use /quote to get an inspirational quote';

// Export module handler function
function quoteCommand(ctx) {
  // Array of inspirational quotes - in a real bot you might use an API
  const quotes = [
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" }
  ];
  
  // Get a random quote
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  ctx.reply(`💭 "${randomQuote.text}"\n— ${randomQuote.author}`);
}

module.exports = {
  MODULE,
  HELP,
  quoteCommand
};