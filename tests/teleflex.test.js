const { describe, test, expect, beforeEach } = require('@jest/globals');
const TeleFlex = require('../src/teleflex');
const fs = require('fs');
const path = require('path');
const { Markup } = require('telegraf');

// Mock dependencies
jest.mock('fs');
jest.mock('path');
jest.mock('telegraf', () => ({
  Markup: {
    button: {
      callback: jest.fn((text, data) => ({ text, callback_data: data }))
    },
    inlineKeyboard: jest.fn((buttons) => ({
      reply_markup: { inline_keyboard: buttons }
    }))
  }
}));

// Mock require to avoid actual file system access
const originalRequire = jest.requireActual('../src/teleflex');

describe('TeleFlex', () => {
  let bot;
  let teleflex;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock bot
    bot = {
      action: jest.fn(),
      command: jest.fn()
    };
    
    // Skip actual module loading to avoid file system access
    jest.spyOn(TeleFlex.prototype, '_loadModules').mockImplementation(function() {
      this.modules = {
        'Module1': 'Help text for module 1',
        'Module2': 'Help text for module 2'
      };
    });
  });
  
  test('should initialize with default options', () => {
    teleflex = new TeleFlex(bot);
    
    expect(teleflex.bot).toBe(bot);
    expect(teleflex.modulesPath).toBe('./modules');
    expect(teleflex.buttonsPerPage).toBe(6);
    expect(teleflex.theme).toBe('default');
    expect(teleflex.parseMode).toBe('Markdown');
  });
  
  test('should initialize with custom options', () => {
    const options = {
      modulesPath: './custom-modules',
      buttonsPerPage: 8,
      theme: 'modern',
      parseMode: 'HTML',
      buttonLayout: 3
    };
    
    teleflex = new TeleFlex(bot, options);
    
    expect(teleflex.modulesPath).toBe('./custom-modules');
    expect(teleflex.buttonsPerPage).toBe(8);
    expect(teleflex.theme).toBe('modern');
    expect(teleflex.parseMode).toBe('HTML');
    expect(teleflex.buttonLayout).toBe(3);
  });
  
  test('should load modules on initialization', () => {
    // Restore the original implementation for this test
    jest.spyOn(TeleFlex.prototype, '_loadModules').mockRestore();
    
    // Set up mocks for module loading
    fs.existsSync.mockReturnValue(true);
    fs.readdirSync.mockReturnValue(['module1.js', 'module2.js']);
    path.join.mockImplementation((dir, file) => `${dir}/${file}`);
    
    // Mock require to return module objects
    jest.spyOn(global, 'require').mockImplementation((filePath) => {
      if (filePath === './modules/module1.js') {
        return {
          MODULE: 'Module1',
          HELP: 'Help text for module 1'
        };
      } else if (filePath === './modules/module2.js') {
        return {
          MODULE: 'Module2',
          HELP: 'Help text for module 2'
        };
      }
      return originalRequire;
    });
    
    teleflex = new TeleFlex(bot);
    
    expect(fs.existsSync).toHaveBeenCalledWith('./modules');
    expect(fs.readdirSync).toHaveBeenCalledWith('./modules');
    expect(path.join).toHaveBeenCalledWith('./modules', 'module1.js');
    expect(path.join).toHaveBeenCalledWith('./modules', 'module2.js');
    expect(teleflex.modules).toEqual({
      'Module1': 'Help text for module 1',
      'Module2': 'Help text for module 2'
    });
    
    // Clean up
    jest.spyOn(TeleFlex.prototype, '_loadModules').mockImplementation(function() {
      this.modules = {
        'Module1': 'Help text for module 1',
        'Module2': 'Help text for module 2'
      };
    });
  });
  
  test('should register module manually', () => {
    teleflex = new TeleFlex(bot);
    
    teleflex.registerModule('TestModule', 'Test help text');
    
    expect(teleflex.modules).toHaveProperty('TestModule', 'Test help text');
  });
  
  test('should unregister module', () => {
    teleflex = new TeleFlex(bot);
    teleflex.modules = {
      'Module1': 'Help text for module 1'
    };
    
    const result = teleflex.unregisterModule('Module1');
    
    expect(result).toBe(true);
    expect(teleflex.modules).not.toHaveProperty('Module1');
  });
  
  test('should return false when unregistering non-existent module', () => {
    teleflex = new TeleFlex(bot);
    
    const result = teleflex.unregisterModule('NonExistentModule');
    
    expect(result).toBe(false);
  });

  test('should set theme correctly', () => {
    teleflex = new TeleFlex(bot);
    
    const result = teleflex.setTheme('modern');
    
    expect(result).toBe(true);
    expect(teleflex.theme).toBe('modern');
    expect(teleflex.activeTheme).toBe(teleflex.themes.modern);
  });
  
  test('should not set theme if theme does not exist', () => {
    teleflex = new TeleFlex(bot);
    const originalTheme = teleflex.theme;
    
    const result = teleflex.setTheme('nonExistentTheme');
    
    expect(result).toBe(false);
    expect(teleflex.theme).toBe(originalTheme);
  });
  
  test('should set up handlers correctly', () => {
    teleflex = new TeleFlex(bot);
    
    const result = teleflex.setupHandlers();
    
    expect(bot.action).toHaveBeenCalledTimes(3);
    expect(bot.command).toHaveBeenCalledTimes(1);
    expect(result).toBe(teleflex); // Should return this for chaining
  });
});