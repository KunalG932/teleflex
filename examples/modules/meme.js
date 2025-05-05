/**
 * Meme Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Meme';
const HELP = 'Use /meme <category> to get a random meme (categories: programming, life, pets)';

// Export module handler function
function memeCommand(ctx) {
  const category = ctx.message.text.split(' ')[1]?.toLowerCase() || 'random';
  
  // Mock meme database - in a real bot you might use a meme API
  const memes = {
    programming: [
      "When your code works but you don't know why",
      "It works on my machine",
      "99 little bugs in the code, take one down, patch it around, 127 little bugs in the code"
    ],
    life: [
      "Monday morning feeling",
      "When you finally finish all your tasks",
      "When someone asks if you have plans this weekend"
    ],
    pets: [
      "Cat knocking things off the table",
      "Dog waiting for you at the door",
      "When your pet pretends they haven't been fed yet"
    ],
    random: [
      "When you find the perfect meme",
      "That moment when...",
      "Nobody: Absolutely nobody:"
    ]
  };
  
  const validCategories = Object.keys(memes);
  
  if (!validCategories.includes(category)) {
    return ctx.reply(`Invalid category. Available categories: ${validCategories.join(', ')}`);
  }
  
  const memesInCategory = memes[category];
  const randomMeme = memesInCategory[Math.floor(Math.random() * memesInCategory.length)];
  
  ctx.reply(`😂 ${randomMeme}\n\n[Imagine a funny image here]`);
}

module.exports = {
  MODULE,
  HELP,
  memeCommand
};