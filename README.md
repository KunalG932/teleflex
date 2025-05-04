# Teleflex

A flexible Telegraf helper library for creating dynamic help menus and module management for Telegram bots.

[![npm version](https://img.shields.io/npm/v/teleflex.svg)](https://www.npmjs.com/package/teleflex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 📚 Automatic module discovery and loading
- 📑 Paginated help menus with inline navigation
- 🎨 Fully customizable texts and appearance
- 🎭 Multiple themes (default, modern, minimal)
- ⌨️ Dynamic inline keyboards with customizable layouts
- 🔄 Easy navigation between modules
- 📦 TypeScript support
- 🛡️ Built-in flood control
- 🔄 Smart message update handling
- 🚦 Rate limiting for button clicks
- 🔌 Custom module callbacks

## Installation

```bash
npm install teleflex
```

## Quick Start

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');

// Initialize your bot
const bot = new Telegraf('YOUR_BOT_TOKEN');

// Initialize TeleFlex
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  buttonsPerPage: 6,
});

// Set up the help command
bot.command('help', (ctx) => {
  teleflex.showHelpMenu(ctx);
});

// Setup the handlers
teleflex.setupHandlers();

// Start the bot
bot.launch();
```

## Module Structure

TeleFlex works by automatically loading modules from a directory. Each module file should export two variables:

1. `MODULE` - The name of the module (displayed in the help menu)
2. `HELP` - The help text for the module (displayed when the module is selected)

### Module File Example

```javascript
// modules/admin.js

// Module name that appears in the help menu
const MODULE = 'Admin';

// Help text that appears when the module is selected
// Supports Markdown or HTML based on your parseMode setting
const HELP = `
**Admin Commands**:

/ban - Ban a user
/unban - Unban a user
/mute - Mute a user
/unmute - Unmute a user
`;

// You can also include command handlers in the same file
function banUser(ctx) {
  // Command implementation
}

// Export the required variables and any functions
module.exports = {
  MODULE,
  HELP,
  banUser
};
```

## Manual Module Registration

If you prefer not to use the automatic module loading, you can manually register modules:

```javascript
// Register modules manually
teleflex
  .registerModule('Admin', 'Admin commands help text')
  .registerModule('User', 'User commands help text')
  .registerModule('Settings', 'Settings commands help text');
```

## Custom Module Callbacks

You can register custom callbacks that run when a module is selected:

```javascript
// Run custom code when a module is selected
teleflex.onModuleSelect('Admin', (ctx) => {
  // Maybe log that someone viewed the admin help
  console.log(`User ${ctx.from.id} viewed admin help`);
  
  // You could also send an additional message
  ctx.reply('Note: Admin commands require special privileges.');
});
```

## Configuration Options

TeleFlex accepts a variety of configuration options:

```javascript
const options = {
  // Path to modules directory (relative or absolute)
  modulesPath: './modules',

  // Number of buttons per page in the help menu
  buttonsPerPage: 6,
  
  // Control button layout - number of columns
  buttonLayout: 2,
  
  // Visual theme - 'default', 'modern', or 'minimal'
  theme: 'modern',
  
  // Parse mode for messages - 'Markdown', 'HTML', or 'plain'
  parseMode: 'Markdown',

  // Custom variable names in module files
  helpVar: 'HELP',       // Variable name for help text
  moduleVar: 'MODULE',   // Variable name for module name

  // Flood control (milliseconds between actions)
  floodWait: 1000,
  
  // Enable callback error handling (logs errors instead of throwing)
  enableCallbackErrorHandling: true,
  
  // Custom themes (extend or override built-in themes)
  themes: {
    custom: {
      emojis: {
        help: '📖',
        module: '📝',
        back: '◀',
        prev: '⬅',
        next: '➡',
        warning: '⚠',
      },
      style: {
        title: '*{text}*',
        highlight: '_{text}_',
        code: '`{text}`',
      }
    }
  },

  // Customizable texts
  texts: {
    helpMenuTitle: '🛠 Help Menu',
    helpMenuIntro: 'Available modules ({count}):\n{modules}\n\nTap a module to explore.',
    moduleHelpTitle: '🔍 {moduleName} Commands',
    moduleHelpIntro: '{helpText}',
    noModulesLoaded: '⚠️ No modules available.',
    backButton: '◀️ Back',
    prevButton: '⬅️ Previous',
    nextButton: '➡️ Next',
    floodMessage: '⚠️ Please wait a moment before clicking again'
  }
};
```

## Themes

TeleFlex comes with three built-in themes:

### Default Theme
Classic look with distinct emojis

### Modern Theme
More colorful emojis with enhanced formatting

### Minimal Theme
Clean interface with minimal emojis and simple formatting

Change the theme using the `theme` option:

```javascript
const teleflex = new TeleFlex(bot, {
  theme: 'modern' // 'default', 'modern', or 'minimal'
});
```

Or switch themes at runtime:

```javascript
// Switch to minimal theme
teleflex.setTheme('minimal');
```

## API Reference

### TeleFlex Class

#### Constructor
```javascript
new TeleFlex(bot, options)
```

#### Methods

- `showHelpMenu(ctx, page = 1)` - Display the help menu with pagination
- `showModuleHelp(ctx, moduleName)` - Display help for a specific module
- `setupHandlers()` - Setup all necessary bot handlers for menu navigation
- `registerModule(moduleName, helpText)` - Manually register a module
- `unregisterModule(moduleName)` - Remove a registered module
- `onModuleSelect(moduleName, callback)` - Register a callback for when a module is selected
- `setTheme(themeName)` - Change the active theme

## Complete Example

Here's a more complete example showing how to create a Telegram bot with TeleFlex:

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');
const path = require('path');

// Initialize your bot
const bot = new Telegraf(process.env.BOT_TOKEN);

// Initialize TeleFlex
const teleflex = new TeleFlex(bot, {
  modulesPath: path.join(__dirname, 'modules'),
  buttonsPerPage: 5,
  theme: 'modern',
  parseMode: 'Markdown',
  buttonLayout: 2,
  floodWait: 500,
  texts: {
    helpMenuTitle: '📚 Bot Commands',
    helpMenuIntro: 'Here are the available commands ({count}):\n{modules}\n\nSelect a command to see how to use it.',
  }
});

// Loading modules from the modules directory
// Example module structure:
// - modules/
//   - admin.js   (exports MODULE='Admin', HELP='...', and command handlers)
//   - user.js    (exports MODULE='User', HELP='...', and command handlers)
//   - settings.js (exports MODULE='Settings', HELP='...', and command handlers)

// Import module handlers from module files
const adminModule = require('./modules/admin');
const userModule = require('./modules/user');

// Set up your bot commands
bot.command('start', (ctx) => {
  ctx.reply('👋 Welcome to my bot! Type /help to see available commands.');
});

bot.command('help', (ctx) => {
  teleflex.showHelpMenu(ctx);
});

// Use the command handlers from your modules
bot.command('ban', adminModule.banUser);
bot.command('settings', (ctx) => userModule.showSettings(ctx));

// Add custom callbacks for modules
teleflex.onModuleSelect('Admin', (ctx) => {
  // Log that admin help was viewed
  console.log(`User ${ctx.from.username || ctx.from.id} viewed admin help`);
});

// Setup TeleFlex handlers
teleflex.setupHandlers();

// Start the bot
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
```

## Working with Tests

TeleFlex now includes a comprehensive test suite. To run the tests:

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (useful during development)
npm run test:watch
```

## Running the Example Bot

TeleFlex comes with a fully functional example bot that demonstrates all its features:

```bash
# Run the example bot
npm run example
```

## Error Handling

TeleFlex includes built-in error handling for common scenarios:

- 🔄 Message modification errors (e.g., when a message hasn't changed)
- ⏱️ Rate limiting for rapid clicks (flood control)
- 🚫 Invalid module requests
- 📝 Message content validation

## TypeScript Support

TeleFlex includes TypeScript definitions out of the box:

```typescript
import TeleFlex from 'teleflex';
import { Telegraf } from 'telegraf';

const bot = new Telegraf('BOT_TOKEN');
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  theme: 'modern'
});
```

## Contributing

For details on how to contribute to TeleFlex, please see [CONTRIBUTING.md](CONTRIBUTING.md).

## Changelog

For a list of changes in each version, see [CHANGELOG.md](CHANGELOG.md).

## License

MIT © [Kunal Gaikwad]

## Support

If you have any questions or need help, please:
1. Check the [documentation](https://github.com/kunalg932/teleflex#readme)
2. Open an [issue](https://github.com/kunalg932/teleflex/issues)