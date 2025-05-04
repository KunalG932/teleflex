import { Telegraf, Context } from 'telegraf';

interface ThemeStyle {
  title: string;
  highlight: string;
  code: string;
}

interface ThemeEmojis {
  help: string;
  module: string;
  back: string;
  prev: string;
  next: string;
  warning: string;
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
  };
}

declare class TeleFlex {
  constructor(bot: Telegraf, options?: TeleflexOptions);
  
  /**
   * Display the help menu with available modules
   * @param ctx Telegraf context
   * @param page Page number to display (default: 1)
   */
  showHelpMenu(ctx: Context, page?: number): Promise<void>;
  
  /**
   * Display help for a specific module
   * @param ctx Telegraf context
   * @param moduleName Name of the module to show help for
   */
  showModuleHelp(ctx: Context, moduleName: string): Promise<void>;
  
  /**
   * Set up handlers for the bot instance
   * @returns TeleFlex instance for chaining
   */
  setupHandlers(): TeleFlex;
  
  /**
   * Register a module without requiring a file
   * @param moduleName Name of the module
   * @param helpText Help text for the module
   * @returns TeleFlex instance for chaining
   */
  registerModule(moduleName: string, helpText: string): TeleFlex;
  
  /**
   * Remove a registered module
   * @param moduleName Name of the module to remove
   * @returns Whether the module was successfully removed
   */
  unregisterModule(moduleName: string): boolean;
  
  /**
   * Register a callback for when a module is selected
   * @param moduleName Name of the module
   * @param callback Callback function that receives the context
   * @returns TeleFlex instance for chaining
   */
  onModuleSelect(moduleName: string, callback: (ctx: Context) => Promise<void>): TeleFlex;
  
  /**
   * Change the active theme
   * @param themeName Name of the theme to activate
   * @returns Whether the theme was successfully changed
   */
  setTheme(themeName: string): boolean;
  
  private _formatText(type: 'title' | 'highlight' | 'code', text: string): string;
  private _loadModules(): void;
  private _paginate(array: any[], pageSize: number, pageNumber: number): any[];
  private _createKeyboard(items: string[], currentPage: number, totalPages: number): any;
  private _checkFloodControl(userId: number): boolean;
  private _handleMessageEdit(ctx: Context, message: string, keyboard: any): Promise<void>;
}

export = TeleFlex;