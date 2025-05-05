/**
 * Game Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Game';
const HELP = 'Use /game to play a number guessing game';

// Store active games - in a real bot you'd use a database
const activeGames = {};

// Export module handler function
function gameCommand(ctx) {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ');
  
  // If the user is starting a new game
  if (args.length === 1 || args[1] === 'new') {
    // Generate a random number between 1-100
    const randomNumber = Math.floor(Math.random() * 100) + 1;
    activeGames[userId] = {
      number: randomNumber,
      attempts: 0
    };
    
    return ctx.reply(
      '🎮 I\'m thinking of a number between 1 and 100.\n' +
      'Try to guess it by using /game <number>\n' +
      'For example: /game 50'
    );
  }
  
  // Check if the user has an active game
  if (!activeGames[userId]) {
    return ctx.reply('You don\'t have an active game. Start a new one with /game');
  }
  
  // Process the user's guess
  const guess = parseInt(args[1]);
  
  if (isNaN(guess) || guess < 1 || guess > 100) {
    return ctx.reply('Please enter a valid number between 1 and 100.');
  }
  
  const game = activeGames[userId];
  game.attempts++;
  
  if (guess === game.number) {
    const message = `🎉 Congratulations! You guessed it in ${game.attempts} attempts!`;
    delete activeGames[userId];
    return ctx.reply(message);
  } else if (guess < game.number) {
    return ctx.reply(`Too low! Try a higher number. Attempts: ${game.attempts}`);
  } else {
    return ctx.reply(`Too high! Try a lower number. Attempts: ${game.attempts}`);
  }
}

module.exports = {
  MODULE,
  HELP,
  gameCommand
};