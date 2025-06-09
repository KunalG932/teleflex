/**
 * Weather Module for TeleFlex example bot (TypeScript version)
 */
import { Context } from 'telegraf';

// Define the module name and help text that TeleFlex will use
export const MODULE = 'Weather';
export const HELP = 'Use /weather <city> to get weather information';

// Export module handler function
export function weatherCommand(ctx: Context): void {
  const city = ctx.message?.text?.split(' ').slice(1).join(' ');
  if (city) {
    ctx.reply(`🌦 Weather forecast for ${city}:\nThis is a demo, so imagine some weather data here!`);
  } else {
    ctx.reply('Please provide a city name. Usage: /weather London');
  }
}
