const { describe, test, expect, beforeEach } = require('@jest/globals');
const TeleFlex = require('../src/teleflex');

// Mock telegraf
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

describe('TeleFlex Module Help', () => {
  let bot;
  let teleflex;
  let ctx;
  
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
    
    // Create teleflex instance with test modules
    teleflex = new TeleFlex(bot);
    
    // Mock context
    ctx = {
      reply: jest.fn().mockResolvedValue({}),
      replyWithMarkdown: jest.fn().mockResolvedValue({}),
      replyWithHTML: jest.fn().mockResolvedValue({}),
      editMessageText: jest.fn().mockResolvedValue({}),
      answerCbQuery: jest.fn().mockResolvedValue({}),
      callbackQuery: {
        from: { id: 123 }
      }
    };
  });
  
  test('should show module help', async () => {
    await teleflex.showModuleHelp(ctx, 'Module1');
    
    expect(ctx.editMessageText).toHaveBeenCalled();
    const messageArg = ctx.editMessageText.mock.calls[0][0];
    expect(messageArg).toContain('Module1 Commands');
    expect(messageArg).toContain('Help text for module 1');
    
    // Check that back button is present
    const options = ctx.editMessageText.mock.calls[0][1];
    expect(options.reply_markup).toBeDefined();
    expect(options.reply_markup.inline_keyboard).toBeDefined();
    expect(options.reply_markup.inline_keyboard[0][0].callback_data).toBe('back:help');
    expect(options.reply_markup.inline_keyboard[0][0].text).toContain('Back');
    
    expect(ctx.answerCbQuery).toHaveBeenCalled();
  });
  
  test('should handle non-existent module', async () => {
    await teleflex.showModuleHelp(ctx, 'NonExistentModule');
    
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('Module not found!');
    expect(ctx.editMessageText).not.toHaveBeenCalled();
  });
  
  test('should handle flood control', async () => {
    // First call will pass
    await teleflex.showModuleHelp(ctx, 'Module1');
    expect(ctx.editMessageText).toHaveBeenCalled();
    
    // Reset mocks
    ctx.editMessageText.mockClear();
    ctx.answerCbQuery.mockClear();
    
    // Second call should be blocked by flood control
    await teleflex.showModuleHelp(ctx, 'Module1');
    expect(ctx.editMessageText).not.toHaveBeenCalled();
    expect(ctx.answerCbQuery).toHaveBeenCalledWith(expect.stringContaining('Please wait a moment'));
  });
  
  test('should trigger custom callback when showing module help', async () => {
    const mockCallback = jest.fn();
    teleflex.onModuleSelect('Module1', mockCallback);
    
    await teleflex.showModuleHelp(ctx, 'Module1');
    
    expect(mockCallback).toHaveBeenCalledWith(ctx);
  });
  
  test('should handle error in custom callback', async () => {
    // Mock console.error to check for error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const mockErrorCallback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    
    teleflex.onModuleSelect('Module1', mockErrorCallback);
    
    // Should not throw error
    await expect(teleflex.showModuleHelp(ctx, 'Module1')).resolves.not.toThrow();
    
    // Should log error
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(consoleErrorSpy.mock.calls[0][0]).toContain('Error executing callback for module Module1');
    
    consoleErrorSpy.mockRestore();
  });
  
  test('should handle message edit errors', async () => {
    // Mock console.error to check for error logging
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock editMessageText to throw error
    ctx.editMessageText.mockRejectedValueOnce(new Error('Test error'));
    
    await teleflex.showModuleHelp(ctx, 'Module1');
    
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('An error occurred');
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });
  
  test('should respect different parse modes', async () => {
    teleflex = new TeleFlex(bot, { parseMode: 'HTML' });
    teleflex.modules = {
      'Module1': 'Help text for module 1'
    };
    
    await teleflex.showModuleHelp(ctx, 'Module1');
    
    expect(ctx.editMessageText.mock.calls[0][1].parse_mode).toBe('HTML');
  });
});