const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

class TeleFlex {
  constructor(bot, options = {}) {
    this.bot = bot;
    this.modulesPath = options.modulesPath || './modules';
    this.buttonsPerPage = options.buttonsPerPage || 6;
    this.floodControl = new Map(); // Store last action time for each user
    this.floodWait = options.floodWait || 1000; // Minimum time between actions (ms)
    this.theme = options.theme || 'default'; // New theme support
    this.parseMode = options.parseMode || 'Markdown'; // Support for different parse modes
    this.buttonLayout = options.buttonLayout || 2; // Control button layout columns
    this.enableCallbackErrorHandling = options.enableCallbackErrorHandling !== false; // Enable error handling by default
    
    // Theme configurations
    this.themes = {
      default: {
        emojis: {
          help: '🛠',
          module: '🔍',
          back: '◀️',
          prev: '⬅️',
          next: '➡️',
          warning: '⚠️',
        },
        style: {
          title: '**{text}**',
          highlight: '__{text}__',
          code: '`{text}`',
        }
      },
      minimal: {
        emojis: {
          help: '',
          module: '',
          back: '<',
          prev: '<',
          next: '>',
          warning: '!',
        },
        style: {
          title: '{text}',
          highlight: '{text}',
          code: '{text}',
        }
      },
      modern: {
        emojis: {
          help: '📚',
          module: '📋',
          back: '🔙',
          prev: '◀️',
          next: '▶️',
          warning: '⚠️',
        },
        style: {
          title: '*{text}*',
          highlight: '_{text}_',
          code: '```{text}```',
        }
      },
      ...options.themes,
    };
    
    // Active theme
    this.activeTheme = this.themes[this.theme] || this.themes.default;
    
    this.texts = {
      helpMenuTitle: `${this.activeTheme.emojis.help} Help Menu`,
      helpMenuIntro: 'Available modules ({count}):\n{modules}\n\nTap a module to explore.',
      moduleHelpTitle: `${this.activeTheme.emojis.module} {moduleName} Commands`,
      moduleHelpIntro: '{helpText}',
      noModulesLoaded: `${this.activeTheme.emojis.warning} No modules available.`,
      backButton: `${this.activeTheme.emojis.back} Back`,
      prevButton: `${this.activeTheme.emojis.prev} Previous`,
      nextButton: `${this.activeTheme.emojis.next} Next`,
      floodMessage: `${this.activeTheme.emojis.warning} Please wait a moment before clicking again`,
      ...options.texts,
    };
    
    this.helpVar = options.helpVar || 'HELP';
    this.moduleVar = options.moduleVar || 'MODULE';
    this.modules = {};
    this.callbacks = new Map(); // Store custom callbacks

    this._loadModules();
  }

  // Apply theme formatting to text
  _formatText(type, text) {
    if (!this.activeTheme.style[type]) return text;
    return this.activeTheme.style[type].replace('{text}', text);
  }

  _loadModules() {
    try {
      if (!fs.existsSync(this.modulesPath)) {
        console.warn(`Modules directory not found: ${this.modulesPath}`);
        return;
      }
      
      const files = fs.readdirSync(this.modulesPath);
      for (const file of files) {
        const filePath = path.join(this.modulesPath, file);
        try {
          const module = require(filePath);
          const moduleName = module[this.moduleVar];
          const helpText = module[this.helpVar];

          if (moduleName && helpText) {
            this.modules[moduleName] = helpText;
          }
        } catch (error) {
          console.error(`Failed to load module: ${file} - ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`Failed to access modules directory: ${this.modulesPath} - ${error.message}`);
      this.modules = {};
    }
  }

  /**
   * Manually register a module without requiring a file
   * @param {string} moduleName - The name of the module
   * @param {string} helpText - The help text for the module
   * @returns {TeleFlex} - The TeleFlex instance for chaining
   */
  registerModule(moduleName, helpText) {
    if (moduleName && helpText) {
      this.modules[moduleName] = helpText;
    }
    return this;
  }
  
  /**
   * Remove a registered module
   * @param {string} moduleName - The name of the module to remove
   * @returns {boolean} - Whether the module was successfully removed
   */
  unregisterModule(moduleName) {
    if (this.modules[moduleName]) {
      delete this.modules[moduleName];
      return true;
    }
    return false;
  }

  _paginate(array, pageSize, pageNumber) {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  _createKeyboard(items, currentPage, totalPages) {
    // Create module buttons based on buttonLayout
    const moduleButtons = [];
    const columns = this.buttonLayout;
    
    for (let i = 0; i < items.length; i += columns) {
      const row = [];
      for (let j = 0; j < columns; j++) {
        if (i + j < items.length) {
          row.push(Markup.button.callback(items[i + j], `module:${items[i + j]}`));
        }
      }
      moduleButtons.push(row);
    }

    // Create navigation row
    const navigationButtons = [];

    if (currentPage > 1) {
      navigationButtons.push(Markup.button.callback(this.texts.prevButton, `page:${currentPage - 1}`));
    }

    if (currentPage < totalPages) {
      navigationButtons.push(Markup.button.callback(this.texts.nextButton, `page:${currentPage + 1}`));
    }

    // Add navigation row if there are navigation buttons
    if (navigationButtons.length > 0) {
      moduleButtons.push(navigationButtons);
    }

    return Markup.inlineKeyboard(moduleButtons);
  }

  _checkFloodControl(userId) {
    const now = Date.now();
    const lastAction = this.floodControl.get(userId) || 0;
    
    if (now - lastAction < this.floodWait) {
      return false;
    }
    
    this.floodControl.set(userId, now);
    return true;
  }

  async _handleMessageEdit(ctx, message, keyboard) {
    try {
      await ctx.editMessageText(message, { 
        parse_mode: this.parseMode, 
        reply_markup: keyboard.reply_markup 
      });
      await ctx.answerCbQuery();
    } catch (error) {
      if (error.description?.includes('message is not modified')) {
        await ctx.answerCbQuery('Content hasn\'t changed');
      } else {
        await ctx.answerCbQuery('An error occurred');
        if (this.enableCallbackErrorHandling) {
          console.error(`TeleFlex error in _handleMessageEdit: ${error.message}`);
        } else {
          throw error;
        }
      }
    }
  }

  async showHelpMenu(ctx, page = 1) {
    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      if (!this._checkFloodControl(userId)) {
        return ctx.answerCbQuery(this.texts.floodMessage);
      }
    }

    const moduleNames = Object.keys(this.modules);
    const totalModules = moduleNames.length;

    if (totalModules === 0) {
      return ctx.callbackQuery ? 
        ctx.editMessageText(this.texts.noModulesLoaded) : 
        ctx.reply(this.texts.noModulesLoaded);
    }

    const totalPages = Math.ceil(totalModules / this.buttonsPerPage);
    const currentPageModules = this._paginate(moduleNames, this.buttonsPerPage, page);
    const modulesText = currentPageModules.join('\n');

    const formattedTitle = this._formatText('title', this.texts.helpMenuTitle);
    const helpMessage = formattedTitle + '\n' +
      this.texts.helpMenuIntro
        .replace('{count}', totalModules)
        .replace('{modules}', modulesText);

    const keyboard = this._createKeyboard(currentPageModules, page, totalPages);

    if (ctx.callbackQuery) {
      try {
        await ctx.editMessageText(helpMessage, { 
          parse_mode: this.parseMode, 
          reply_markup: keyboard.reply_markup 
        });
        await ctx.answerCbQuery();
      } catch (error) {
        if (error.description?.includes('message is not modified')) {
          await ctx.answerCbQuery('You are already on this page');
        } else {
          await ctx.answerCbQuery('An error occurred');
          if (this.enableCallbackErrorHandling) {
            console.error(`TeleFlex error in showHelpMenu: ${error.message}`);
          } else {
            throw error;
          }
        }
      }
    } else {
      if (this.parseMode === 'Markdown') {
        await ctx.replyWithMarkdown(helpMessage, keyboard);
      } else if (this.parseMode === 'HTML') {
        await ctx.replyWithHTML(helpMessage, keyboard);
      } else {
        await ctx.reply(helpMessage, keyboard);
      }
    }
  }

  async showModuleHelp(ctx, moduleName) {
    if (ctx.callbackQuery) {
      const userId = ctx.callbackQuery.from.id;
      if (!this._checkFloodControl(userId)) {
        return ctx.answerCbQuery(this.texts.floodMessage);
      }
    }

    const helpText = this.modules[moduleName];

    if (!helpText) {
      return ctx.answerCbQuery('Module not found!');
    }

    const formattedTitle = this._formatText('title', this.texts.moduleHelpTitle);
    const helpMessage = formattedTitle
      .replace('{moduleName}', moduleName) +
      '\n' +
      this.texts.moduleHelpIntro.replace('{helpText}', helpText);

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback(this.texts.backButton, 'back:help'),
    ]);

    await this._handleMessageEdit(ctx, helpMessage, keyboard);
    
    // Trigger any registered custom callbacks for this module
    if (this.callbacks.has(moduleName)) {
      try {
        await this.callbacks.get(moduleName)(ctx);
      } catch (error) {
        console.error(`Error executing callback for module ${moduleName}:`, error);
      }
    }
  }

  /**
   * Register a custom callback function for a specific module
   * @param {string} moduleName - The name of the module
   * @param {Function} callback - The callback function that receives the context
   */
  onModuleSelect(moduleName, callback) {
    if (typeof callback === 'function') {
      this.callbacks.set(moduleName, callback);
    }
    return this;
  }

  /**
   * Change the active theme
   * @param {string} themeName - The name of the theme to activate
   * @returns {boolean} - Whether the theme was successfully changed
   */
  setTheme(themeName) {
    if (this.themes[themeName]) {
      this.theme = themeName;
      this.activeTheme = this.themes[themeName];
      
      // Update texts with new theme emojis
      this.texts = {
        ...this.texts,
        helpMenuTitle: `${this.activeTheme.emojis.help} Help Menu`,
        moduleHelpTitle: `${this.activeTheme.emojis.module} {moduleName} Commands`,
        noModulesLoaded: `${this.activeTheme.emojis.warning} No modules available.`,
        backButton: `${this.activeTheme.emojis.back} Back`,
        prevButton: `${this.activeTheme.emojis.prev} Previous`,
        nextButton: `${this.activeTheme.emojis.next} Next`,
        floodMessage: `${this.activeTheme.emojis.warning} Please wait a moment before clicking again`,
      };
      
      return true;
    }
    return false;
  }

  setupHandlers() {
    this.bot.action(/module:(.+)/, async (ctx) => {
      const moduleName = ctx.match[1];
      await this.showModuleHelp(ctx, moduleName);
    });

    this.bot.action(/page:(\d+)/, async (ctx) => {
      const page = parseInt(ctx.match[1], 10);
      await this.showHelpMenu(ctx, page);
    });

    this.bot.action('back:help', async (ctx) => {
      await this.showHelpMenu(ctx);
    });

    this.bot.command('help', async (ctx) => {
      await this.showHelpMenu(ctx);
    });
    
    return this; // Allow chaining
  }
}

module.exports = TeleFlex;