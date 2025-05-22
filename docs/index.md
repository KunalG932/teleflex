# Teleflex Documentation

<div align="center">

A flexible Telegraf helper library for creating dynamic help menus and module management for Telegram bots.

[![npm version](https://img.shields.io/npm/v/teleflex.svg)](https://www.npmjs.com/package/teleflex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
  - [Module Structure](#module-structure)
  - [Help Menu](#help-menu)
  - [Themes](#themes)
  - [Navigation](#navigation)
- [Advanced Usage](#advanced-usage)
  - [Custom Callbacks](#custom-callbacks)
  - [Start Messages](#start-messages)
  - [Button Layouts](#button-layouts)
  - [Error Handling](#error-handling)
- [Configuration](#configuration)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Troubleshooting](#troubleshooting)

## Features

- 📚 **Automatic Module Discovery**: Dynamically loads modules from a directory
- 📑 **Paginated Help Menus**: Built-in pagination for large module lists
- 🎨 **Multiple Themes**: Choose from default, modern, or minimal themes
- ⌨️ **Dynamic Keyboards**: Flexible inline keyboard layouts
- 🔄 **Smart Navigation**: Easy movement between modules and menus
- 🔘 **Grid Layouts**: Customizable button grid formats
- 📦 **TypeScript Support**: Full type definitions included
- 🛡️ **Flood Control**: Built-in rate limiting for actions
- 🔄 **Message Management**: Smart message update handling
- 🚦 **Rate Limiting**: Button click throttling
- 🔌 **Custom Callbacks**: Module-specific action handlers

## Installation

```bash
npm install teleflex
```

## Quick Start

Here's a basic example to get you started:

```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');

// Initialize your bot
const bot = new Telegraf('YOUR_BOT_TOKEN');

// Initialize TeleFlex
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  buttonsPerPage: 6,
  theme: 'modern'
});

// Set up the help command
bot.command('help', (ctx) => {
  teleflex.showHelpMenu(ctx);
});

// Setup handlers
teleflex.setupHandlers();

// Start the bot
bot.launch();
```

## Core Concepts

### Module Structure

Modules are the building blocks of your bot's functionality. Each module should export:

```javascript
// modules/weather.js
const MODULE = 'Weather';
const HELP = 'Use /weather <city> to get weather information';

function weatherCommand(ctx) {
  // Command implementation
}

module.exports = {
  MODULE,
  HELP,
  weatherCommand
};
```

### Help Menu

The help menu automatically displays all available modules with pagination:

```javascript
teleflex.showHelpMenu(ctx, page = 1);
```

### Themes

Choose from three built-in themes or create custom ones:

```javascript
// Use built-in theme
const teleflex = new TeleFlex(bot, {
  theme: 'modern' // 'default', 'modern', or 'minimal'
});

// Create custom theme
const customTheme = {
  emojis: {
    help: '📚',
    module: '📋',
    back: '🔙',
    prev: '◀️',
    next: '▶️',
    warning: '⚠️'
  },
  style: {
    title: '*{text}*',
    highlight: '_{text}_',
    code: '```{text}```'
  }
};

const teleflex = new TeleFlex(bot, {
  themes: { custom: customTheme },
  theme: 'custom'
});
```

### Navigation

TeleFlex provides seamless navigation between menus:

```javascript
// Show help menu
teleflex.showHelpMenu(ctx);

// Show specific module help
teleflex.showModuleHelp(ctx, 'Weather');

// Return to start
teleflex.backToStart(ctx);
```

## Advanced Usage

### Custom Callbacks

Register callbacks for specific modules:

```javascript
teleflex.onModuleSelect('Weather', async (ctx) => {
  await ctx.reply('Weather module selected! Use /weather <city>');
});
```

### Start Messages

Create rich start messages with custom buttons:

```javascript
const buttons = [
  { text: 'Website', url: 'https://example.com' },
  { text: 'Support', callback_data: 'support:contact' }
];

teleflex.sendStartMessage(ctx, 'Welcome!', {
  buttons: buttons,
  columns: 2,
  includeHelp: true
});
```

### Button Layouts

Customize button grid layouts:

```javascript
const teleflex = new TeleFlex(bot, {
  buttonLayout: 2, // Two columns
  buttonsPerPage: 6 // Six buttons per page
});
```

### Error Handling

TeleFlex includes built-in error handling:

```javascript
const teleflex = new TeleFlex(bot, {
  enableCallbackErrorHandling: true,
  floodWait: 1000 // 1 second between actions
});
```

## Configuration

Full configuration options:

```javascript
const options = {
  // Core settings
  modulesPath: './modules',
  buttonsPerPage: 6,
  buttonLayout: 2,
  theme: 'modern',
  parseMode: 'Markdown',

  // Variable names in modules
  helpVar: 'HELP',
  moduleVar: 'MODULE',

  // Control settings
  floodWait: 1000,
  enableCallbackErrorHandling: true,

  // Custom text strings
  texts: {
    helpMenuTitle: '🛠 Help Menu',
    helpMenuIntro: 'Available modules ({count}):\n{modules}',
    moduleHelpTitle: '🔍 {moduleName} Commands',
    backButton: '◀️ Back',
    floodMessage: '⚠️ Please wait'
  }
};
```

## Best Practices

1. **Module Organization**
   - Keep modules focused and single-purpose
   - Use clear, descriptive module names
   - Include comprehensive help text

2. **Error Handling**
   - Enable callback error handling
   - Set appropriate flood control limits
   - Handle edge cases in callbacks

3. **User Experience**
   - Use consistent button layouts
   - Provide clear navigation paths
   - Include helpful error messages

4. **Performance**
   - Optimize module loading
   - Use appropriate pagination settings
   - Cache frequently used data

## API Reference

### TeleFlex Class

#### Constructor
```typescript
new TeleFlex(bot: Telegraf, options?: TeleflexOptions)
```

#### Core Methods
```typescript
showHelpMenu(ctx: Context, page?: number): Promise<void>
showModuleHelp(ctx: Context, moduleName: string): Promise<void>
setupHandlers(): TeleFlex
registerModule(moduleName: string, helpText: string): TeleFlex
unregisterModule(moduleName: string): boolean
```

#### Navigation Methods
```typescript
backToStart(ctx: Context): Promise<void>
sendStartMessage(ctx: Context, message: string, options?: StartMessageOptions): Promise<void>
```

#### Theme Methods
```typescript
setTheme(themeName: string): boolean
```

#### Callback Methods
```typescript
onModuleSelect(moduleName: string, callback: (ctx: Context) => Promise<void>): TeleFlex
```

## Examples

### Basic Bot
```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);
const teleflex = new TeleFlex(bot, {
  modulesPath: path.join(__dirname, 'modules'),
  theme: 'modern'
});

bot.command('start', (ctx) => {
  teleflex.sendStartMessage(ctx, 'Welcome to my bot!', {
    buttons: [
      { text: 'Help', callback_data: 'show:help' },
      { text: 'Website', url: 'https://example.com' }
    ],
    columns: 2
  });
});

bot.command('help', (ctx) => teleflex.showHelpMenu(ctx));
teleflex.setupHandlers();
bot.launch();
```

### Weather Module
```javascript
// modules/weather.js
const MODULE = 'Weather';
const HELP = 'Use /weather <city> to get weather information';

async function weatherCommand(ctx) {
  const city = ctx.message.text.split(' ')[1];
  if (!city) {
    return ctx.reply('Please provide a city name: /weather London');
  }
  await ctx.reply(`Weather forecast for ${city}...`);
}

module.exports = {
  MODULE,
  HELP,
  weatherCommand
};
```

## Troubleshooting

### Common Issues

1. **Modules Not Loading**
   - Check modulesPath configuration
   - Verify module exports
   - Check file permissions

2. **Button Actions Not Working**
   - Ensure setupHandlers() is called
   - Check flood control settings
   - Verify callback data format

3. **Message Updates Failing**
   - Check bot permissions
   - Verify message age
   - Handle edit exceptions

### Debug Tips

1. Enable verbose logging:
```javascript
const teleflex = new TeleFlex(bot, {
  debug: true
});
```

2. Check module registration:
```javascript
console.log(teleflex.modules);
```

3. Test flood control:
```javascript
const isAllowed = teleflex._checkFloodControl(userId);
console.log('Action allowed:', isAllowed);
```

---

## Contributing

Please see our [Contributing Guide](CONTRIBUTING.md) for details on how to:
- Submit issues
- Propose new features
- Submit pull requests

## License

MIT © [Kunal Gaikwad]

## Support

Need help? Here are your options:

1. Check the [documentation](https://github.com/kunalg932/teleflex#readme)
2. Open an [issue](https://github.com/kunalg932/teleflex/issues)
3. Join our [community](https://t.me/teleflexchat) (Coming soon)
