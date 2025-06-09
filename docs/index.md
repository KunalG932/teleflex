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
  - [Web App Support](#web-app-support)
  - [Session Management](#session-management)
- [Advanced Usage](#advanced-usage)
  - [Custom Callbacks](#custom-callbacks)
  - [Start Messages](#start-messages)
  - [Button Layouts](#button-layouts)
  - [Error Handling](#error-handling)
  - [Message Helpers](#message-helpers)
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
- 🌐 **Web App Support**: Integrated Telegram Web App functionality
- 🔄 **Session Management**: Built-in user session handling
- 💬 **Message Helpers**: Success, Error, and Info message templates

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

// Initialize TeleFlex with new features
const teleflex = new TeleFlex(bot, {
  modulesPath: './modules',
  buttonsPerPage: 6,
  theme: 'modern',
  enableSession: true,
  enableWebApp: true
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
    warning: '⚠️',
    success: '✨',
    error: '💥',
    info: '💡'
  },
  style: {
    title: '*{text}*',
    highlight: '_{text}_',
    code: '```{text}```',
    inlineCode: '`{text}`',
    bold: '*{text}*',
    italic: '_{text}_'
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

### Web App Support

Create and manage Web App buttons:

```javascript
// Create a Web App button
const webAppButton = teleflex.createWebAppButton('Open App', 'https://your-app.com');

// Create a keyboard with Web App button
const keyboard = teleflex.createInlineKeyboard([
  webAppButton,
  { text: 'Back', callback_data: 'back' }
]);

// Handle Web App data
bot.on('web_app_data', async (ctx) => {
  const data = ctx.update.message.web_app_data.data;
  try {
    const parsedData = JSON.parse(data);
    await teleflex.sendSuccess(ctx, 'Data received!');
  } catch (error) {
    await teleflex.sendError(ctx, 'Invalid data format');
  }
});
```

### Session Management

Manage user sessions with built-in support:

```javascript
// Enable session support
const teleflex = new TeleFlex(bot, {
  enableSession: true
});

// Use session in commands
bot.command('setname', async (ctx) => {
  const name = ctx.message.text.split(' ')[1];
  ctx.session.userData = { name };
  await teleflex.sendSuccess(ctx, `Name set to: ${name}`);
});
```

## Advanced Usage

### Message Helpers

Use built-in message helpers for consistent formatting:

```javascript
// Success message
await teleflex.sendSuccess(ctx, 'Operation completed!');

// Error message
await teleflex.sendError(ctx, 'Something went wrong!');

// Info message
await teleflex.sendInfo(ctx, 'Here is some information');
```

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

  // New features
  enableSession: true,
  enableWebApp: true,
  enableInlineMode: true,

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
    floodMessage: '⚠️ Please wait',
    successMessage: '✨ {message}',
    errorMessage: '💥 {message}',
    infoMessage: '💡 {message}'
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
   - Use message helpers for consistent formatting

4. **Performance**
   - Optimize module loading
   - Use appropriate pagination settings
   - Cache frequently used data
   - Enable session support for user data

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

#### New Methods
```typescript
sendSuccess(ctx: Context, message: string): Promise<void>
sendError(ctx: Context, message: string): Promise<void>
sendInfo(ctx: Context, message: string): Promise<void>
createWebAppButton(text: string, url: string): InlineKeyboardButton
createInlineKeyboard(buttons: ButtonConfig[]): InlineKeyboardMarkup
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

### Basic Bot with New Features
```javascript
const { Telegraf } = require('telegraf');
const TeleFlex = require('teleflex');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);
const teleflex = new TeleFlex(bot, {
  modulesPath: path.join(__dirname, 'modules'),
  theme: 'modern',
  enableSession: true,
  enableWebApp: true
});

bot.command('start', async (ctx) => {
  const webAppButton = teleflex.createWebAppButton('Open App', 'https://your-app.com');
  const keyboard = teleflex.createInlineKeyboard([
    webAppButton,
    { text: 'Help', callback_data: 'show:help' },
    { text: 'Website', url: 'https://example.com' }
  ]);

  await ctx.reply('Welcome to my bot!', {
    reply_markup: keyboard
  });
});

bot.command('help', (ctx) => teleflex.showHelpMenu(ctx));

// Handle Web App data
bot.on('web_app_data', async (ctx) => {
  const data = ctx.update.message.web_app_data.data;
  try {
    const parsedData = JSON.parse(data);
    await teleflex.sendSuccess(ctx, 'Data received!');
  } catch (error) {
    await teleflex.sendError(ctx, 'Invalid data format');
  }
});

teleflex.setupHandlers();
bot.launch();
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

4. **Web App Issues**
   - Verify Web App URL
   - Check bot settings in @BotFather
   - Handle Web App data properly

5. **Session Problems**
   - Enable session support
   - Check session middleware
   - Handle session errors

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
