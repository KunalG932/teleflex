import * as fs from 'fs';
import * as path from 'path';
import { Telegraf, Markup, Context, session } from 'telegraf';

interface ThemeStyle {
  title: string;
  highlight: string;
  code: string;
  inlineCode: string;
  bold: string;
  italic: string;
}

interface ThemeEmojis {
  help: string;
  module: string;
  back: string;
  prev: string;
  next: string;
  warning: string;
  success: string;
  error: string;
  info: string;
}

interface Theme {
  emojis: ThemeEmojis;
  style: ThemeStyle;
}

interface TeleflexOptions {
  modulesPath?: string;
  buttonsPerPage?: number;
  helpVar?: string;
  moduleVar?: string;
  floodWait?: number;
  theme?: string;
  parseMode?: 'Markdown' | 'HTML' | 'MarkdownV2';
  buttonLayout?: number;
  enableCallbackErrorHandling?: boolean;
  enableSession?: boolean;
  enableInlineMode?: boolean;
  enableWebApp?: boolean;
  themes?: Record<string, Theme>;
  texts?: {
    helpMenuTitle?: string;
    helpMenuIntro?: string;
    moduleHelpTitle?: string;
    moduleHelpIntro?: string;
    noModulesLoaded?: string;
    backButton?: string;
    prevButton?: string;
    nextButton?: string;
    floodMessage?: string;
    helpButton?: string;
    startBackButton?: string;
    successMessage?: string;
    errorMessage?: string;
    infoMessage?: string;
  };
}

type CallbackFn = (ctx: Context) => Promise<void> | void;

class TeleFlex {
  private bot: Telegraf;
  private modulesPath: string;
  private buttonsPerPage: number;
  private floodControl: Map<number, number>;
  private floodWait: number;
  private theme: string;
  private parseMode: 'Markdown' | 'HTML' | 'MarkdownV2';
  private buttonLayout: number;
  private enableCallbackErrorHandling: boolean;
  private enableSession: boolean;
  private enableInlineMode: boolean;
  private enableWebApp: boolean;
  private themes: Record<string, Theme>;
  private activeTheme: Theme;
  private texts: {
    helpMenuTitle: string;
    helpMenuIntro: string;
    moduleHelpTitle: string;
    moduleHelpIntro: string;
    noModulesLoaded: string;
    backButton: string;
    prevButton: string;
    nextButton: string;
    floodMessage: string;
    helpButton: string;
    startBackButton: string;
    successMessage: string;
    errorMessage: string;
    infoMessage: string;
  };
  private helpVar: string;
  private moduleVar: string;
  private modules: Record<string, string>;
  private callbacks: Map<string, CallbackFn>;
  private lastStartMessages: Map<number, any>;

  constructor(bot: Telegraf, options: TeleflexOptions = {}) {
    this.bot = bot;
    this.modulesPath = options.modulesPath || './modules';
    this.buttonsPerPage = options.buttonsPerPage || 6;
    this.floodControl = new Map(); // Store last action time for each user
    this.floodWait = options.floodWait || 1000; // Minimum time between actions (ms)
    this.theme = options.theme || 'default'; // New theme support
    this.parseMode = options.parseMode || 'Markdown'; // Support for different parse modes
    this.buttonLayout = options.buttonLayout || 2; // Control button layout columns
    this.enableCallbackErrorHandling = options.enableCallbackErrorHandling !== false; // Enable error handling by default
    this.enableSession = options.enableSession || false;
    this.enableInlineMode = options.enableInlineMode || false;
    this.enableWebApp = options.enableWebApp || false;
    
    // Initialize session if enabled
    if (this.enableSession) {
      this.bot.use(session());
    }

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
          success: '✅',
          error: '❌',
          info: 'ℹ️'
        },
        style: {
          title: '**{text}**',
          highlight: '__{text}__',
          code: '`{text}`',
          inlineCode: '`{text}`',
          bold: '**{text}**',
          italic: '_{text}_'
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
          success: '+',
          error: '-',
          info: 'i'
        },
        style: {
          title: '{text}',
          highlight: '{text}',
          code: '{text}',
          inlineCode: '{text}',
          bold: '{text}',
          italic: '{text}'
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
      },
      ...(options.themes || {}),
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
      helpButton: `${this.activeTheme.emojis.help} Help`,
      startBackButton: `${this.activeTheme.emojis.back} Back to Start`,
      successMessage: `${this.activeTheme.emojis.success} {message}`,
      errorMessage: `${this.activeTheme.emojis.error} {message}`,
      infoMessage: `${this.activeTheme.emojis.info} {message}`,
      ...(options.texts || {}),
    };
    
    this.helpVar = options.helpVar || 'HELP';
    this.moduleVar = options.moduleVar || 'MODULE';
    this.modules = {};
    this.callbacks = new Map(); // Store custom callbacks
    this.lastStartMessages = new Map();

    this._loadModules();
  }

  // Apply theme formatting to text
  private _formatText(type: keyof ThemeStyle, text: string): string {
    if (!this.activeTheme.style[type]) return text;
    return this.activeTheme.style[type].replace('{text}', text);
  }

  private _loadModules(): void {
    try {
      if (!fs.existsSync(this.modulesPath)) {
        console.warn(`Modules directory not found: ${this.modulesPath}`);
        return;
      }
      
      const files = fs.readdirSync(this.modulesPath);
      for (const file of files) {
        const filePath = path.join(this.modulesPath, file);
        try {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const module = require(filePath);
          const moduleName = module[this.moduleVar];
          const helpText = module[this.helpVar];

          if (moduleName && helpText) {
            this.modules[moduleName] = helpText;
          }
        } catch (error) {
          console.error(`Failed to load module: ${file} - ${(error as Error).message}`);
        }
      }
    } catch (error) {
      console.error(`Failed to access modules directory: ${this.modulesPath} - ${(error as Error).message}`);
      this.modules = {};
    }
  }

  /**
   * Manually register a module without requiring a file
   * @param moduleName - The name of the module
   * @param helpText - The help text for the module
   * @returns The TeleFlex instance for chaining
   */
  registerModule(moduleName: string, helpText: string): TeleFlex {
    if (moduleName && helpText) {
      this.modules[moduleName] = helpText;
    }
    return this;
  }
  
  /**
   * Remove a registered module
   * @param moduleName - The name of the module to remove
   * @returns Whether the module was successfully removed
   */
  unregisterModule(moduleName: string): boolean {
    if (this.modules[moduleName]) {
      delete this.modules[moduleName];
      return true;
    }
    return false;
  }

  private _paginate<T>(array: T[], pageSize: number, pageNumber: number): T[] {
    return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
  }

  private _createKeyboard(items: string[], currentPage: number, totalPages: number) {
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
    
    // Add Back to Start button at the bottom
    moduleButtons.push([
      Markup.button.callback(this.texts.startBackButton, 'back:start')
    ]);

    return Markup.inlineKeyboard(moduleButtons);
  }

  private _checkFloodControl(userId: number): boolean {
    const now = Date.now();
    const lastAction = this.floodControl.get(userId) || 0;
    
    if (now - lastAction < this.floodWait) {
      return false; // Too frequent, should be throttled
    }
    
    this.floodControl.set(userId, now);
    return true;
  }

  // More methods will be added here to complete the TypeScript implementation
  
  // Add callback hooks for modules
  onModuleSelect(moduleName: string, callback: CallbackFn): TeleFlex {
    this.callbacks.set(moduleName, callback);
    return this;
  }

  /**
   * Send a success message to the user
   * @param ctx - The Telegraf context
   * @param message - The message to send
   */
  async sendSuccess(ctx: Context, message: string): Promise<void> {
    const formattedMessage = this.texts.successMessage.replace('{message}', message);
    await ctx.reply(formattedMessage, { parse_mode: this.parseMode });
  }

  /**
   * Send an error message to the user
   * @param ctx - The Telegraf context
   * @param message - The message to send
   */
  async sendError(ctx: Context, message: string): Promise<void> {
    const formattedMessage = this.texts.errorMessage.replace('{message}', message);
    await ctx.reply(formattedMessage, { parse_mode: this.parseMode });
  }

  /**
   * Send an info message to the user
   * @param ctx - The Telegraf context
   * @param message - The message to send
   */
  async sendInfo(ctx: Context, message: string): Promise<void> {
    const formattedMessage = this.texts.infoMessage.replace('{message}', message);
    await ctx.reply(formattedMessage, { parse_mode: this.parseMode });
  }

  /**
   * Create a Web App button
   * @param text - The button text
   * @param url - The Web App URL
   */
  createWebAppButton(text: string, url: string) {
    return Markup.button.webApp(text, url);
  }

  /**
   * Create an inline keyboard with custom buttons
   * @param buttons - Array of button configurations
   */
  createInlineKeyboard(buttons: Array<{
    text: string;
    callback_data?: string;
    url?: string;
    web_app?: { url: string };
  }>) {
    return Markup.inlineKeyboard(buttons.map(btn => {
      if (btn.web_app) {
        return Markup.button.webApp(btn.text, btn.web_app.url);
      } else if (btn.url) {
        return Markup.button.url(btn.text, btn.url);
      } else {
        return Markup.button.callback(btn.text, btn.callback_data || '');
      }
    }));
  }
}

export = TeleFlex;
