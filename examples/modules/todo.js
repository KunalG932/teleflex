/**
 * Todo Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'Todo';
const HELP = 'Use /todo add <task> to add a task, /todo list to view tasks, /todo done <number> to complete a task';

// Store users' todo lists - in a real bot you'd use a database
const todoLists = {};

// Export module handler function
function todoCommand(ctx) {
  const userId = ctx.from.id;
  const args = ctx.message.text.split(' ');
  const action = args[1]?.toLowerCase();
  
  if (!todoLists[userId]) {
    todoLists[userId] = [];
  }
  
  if (!action || !['add', 'list', 'done', 'clear'].includes(action)) {
    return ctx.reply(
      '📝 Todo List Commands:\n' +
      '/todo add <task> - Add a new task\n' +
      '/todo list - View your tasks\n' +
      '/todo done <number> - Mark a task as done\n' +
      '/todo clear - Remove all tasks'
    );
  }
  
  // Handle different actions
  if (action === 'add') {
    const taskText = args.slice(2).join(' ');
    if (!taskText) {
      return ctx.reply('Please provide a task to add. Example: /todo add Buy milk');
    }
    
    todoLists[userId].push(taskText);
    return ctx.reply(`✅ Task added: "${taskText}"`);
  }
  
  if (action === 'list') {
    const tasks = todoLists[userId];
    if (tasks.length === 0) {
      return ctx.reply('Your todo list is empty. Add tasks with /todo add <task>');
    }
    
    const taskList = tasks.map((task, i) => `${i + 1}. ${task}`).join('\n');
    return ctx.reply(`📝 Your Todo List:\n\n${taskList}`);
  }
  
  if (action === 'done') {
    const taskIndex = parseInt(args[2]) - 1;
    if (isNaN(taskIndex) || taskIndex < 0 || taskIndex >= todoLists[userId].length) {
      return ctx.reply('Please provide a valid task number. View your tasks with /todo list');
    }
    
    const completedTask = todoLists[userId][taskIndex];
    todoLists[userId].splice(taskIndex, 1);
    return ctx.reply(`✅ Task completed: "${completedTask}"`);
  }
  
  if (action === 'clear') {
    todoLists[userId] = [];
    return ctx.reply('Todo list cleared. All tasks have been removed.');
  }
}

module.exports = {
  MODULE,
  HELP,
  todoCommand
};