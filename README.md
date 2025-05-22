

# Teleflex

A flexible [Telegraf](https://github.com/telegraf/telegraf) helper library for creating dynamic help menus and module management for Telegram bots.

[![npm version](https://img.shields.io/npm/v/teleflex.svg)](https://www.npmjs.com/package/teleflex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Features

- Plug-and-play module system for Telegraf bots
- Dynamic help menu generation
- Easy command registration
- Simple configuration

---

## Installation

Install using npm:

```bash
npm install teleflex
````

---

## Basic Usage

```js
const { Teleflex } = require('teleflex');
const { Telegraf } = require('telegraf');

const bot = new Telegraf('BOT_TOKEN');

const teleflex = new Teleflex(bot, {
  helpCommand: 'help',
  modulesPath: './modules',
});

teleflex.loadModules(); // Auto-load modules from directory

bot.launch();
```

---

## Documentation

Full documentation is available here:
**[Teleflex Docs](https://github.com/KunalG932/teleflex/blob/main/docs/index.md)**

---

## Contributing

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).


