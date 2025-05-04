const { describe, test, expect, beforeEach } = require('@jest/globals');
const TeleFlex = require('../src/teleflex');
const fs = require('fs');
const path = require('path');

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

describe('TeleFlex Help Menu', () => {
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
    
    // Create teleflex instance
    teleflex = new TeleFlex(bot);
    
    // Mock context
    ctx = {
      reply: jest.fn().mockResolvedValue({}),
      replyWithMarkdown: jest.fn().mockResolvedValue({
        reply_markup: {
          inline_keyboard: [[{ text: 'Module1', callback_data: 'module:Module1' }]]
        }
      }),
      replyWithHTML: jest.fn().mockResolvedValue({
        reply_markup: {
          inline_keyboard: [[{ text: 'Module1', callback_data: 'module:Module1' }]]
        }
      }),
      editMessageText: jest.fn().mockResolvedValue({}),
      answerCbQuery: jest.fn().mockResolvedValue({})
    };
  });
  
  test('should show help menu with modules', async () => {
    // Create context without callbackQuery for this test
    ctx = {
      ...ctx,
      callbackQuery: null
    };
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.replyWithMarkdown).toHaveBeenCalled();
    const messageArg = ctx.replyWithMarkdown.mock.calls[0][0];
    expect(messageArg).toContain('Help Menu');
    expect(messageArg).toContain('Module1');
    expect(messageArg).toContain('Module2');
  });

  test('should show help menu without modules if none loaded', async () => {
    // Override the modules
    teleflex.modules = {};
    
    // Create context without callbackQuery for this test
    ctx = {
      ...ctx,
      callbackQuery: null
    };
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.reply).toHaveBeenCalledWith(expect.stringContaining('No modules available'));
  });
  
  test('should handle pagination in help menu', async () => {
    // Create a teleflex instance with 1 button per page
    teleflex = new TeleFlex(bot, { buttonsPerPage: 1 });
    teleflex.modules = {
      'Module1': 'Help text for module 1',
      'Module2': 'Help text for module 2'
    };
    
    // Create context without callbackQuery for this test
    ctx = {
      ...ctx,
      callbackQuery: null
    };
    
    // Show page 1
    await teleflex.showHelpMenu(ctx, 1);
    
    expect(ctx.replyWithMarkdown).toHaveBeenCalled();
    
    // Get the keyboard from the mock
    const markup = ctx.replyWithMarkdown.mock.calls[0][1];
    
    // Create a new context with callback query for page 2
    const ctxWithCallback = {
      ...ctx,
      callbackQuery: { from: { id: 123 } },
      editMessageText: jest.fn().mockResolvedValue({}),
      answerCbQuery: jest.fn().mockResolvedValue({})
    };
    
    // Show page 2
    await teleflex.showHelpMenu(ctxWithCallback, 2);
    
    expect(ctxWithCallback.editMessageText).toHaveBeenCalled();
    expect(ctxWithCallback.answerCbQuery).toHaveBeenCalled();
  });
  
  test('should handle different parse modes', async () => {
    // Test with HTML parse mode
    teleflex = new TeleFlex(bot, { parseMode: 'HTML' });
    teleflex.modules = {
      'Module1': 'Help text for module 1',
      'Module2': 'Help text for module 2'
    };
    
    // Create context without callbackQuery for this test
    ctx = {
      ...ctx,
      callbackQuery: null
    };
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.replyWithHTML).toHaveBeenCalled();
    
    // Test with default parse mode (no specific method call)
    teleflex = new TeleFlex(bot, { parseMode: 'plain' });
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.reply).toHaveBeenCalled();
  });
  
  test('should edit message when showing help menu with callback query', async () => {
    // Create context with callbackQuery
    ctx = {
      ...ctx,
      callbackQuery: { from: { id: 123 } }
    };
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.editMessageText).toHaveBeenCalled();
    expect(ctx.answerCbQuery).toHaveBeenCalled();
  });

  test('should handle error if message is not modified', async () => {
    // Create context with callbackQuery
    ctx = {
      ...ctx,
      callbackQuery: { from: { id: 123 } },
      editMessageText: jest.fn().mockRejectedValueOnce({ description: 'message is not modified' })
    };
    
    await teleflex.showHelpMenu(ctx);
    
    expect(ctx.answerCbQuery).toHaveBeenCalledWith('You are already on this page');
  });
});