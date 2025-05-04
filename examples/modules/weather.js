/**
 * Weather Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Weather';
const HELP = 'Use /weather <city> to get weather information';

// Export module handler function
function weatherCommand(ctx) {
  const city = ctx.message.text.split(' ').slice(1).join(' ');
  if (city) {
    ctx.reply(`🌦 Weather forecast for ${city}:\nThis is a demo, so imagine some weather data here!`);
  } else {
    ctx.reply('Please provide a city name. Usage: /weather London');
  }
}

module.exports = {
  MODULE,
  HELP,
  weatherCommand
};