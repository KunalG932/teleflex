/**
 * News Module for TeleFlex example bot
 */

// Define the module name and help text that TeleFlex will use
const MODULE = 'News';
const HELP = 'Use /news <category> to get latest news headlines (categories: tech, sports, world)';

// Export module handler function
function newsCommand(ctx) {
  const category = ctx.message.text.split(' ')[1]?.toLowerCase() || 'general';
  
  // Mock news headlines - in a real bot you would use a news API
  const mockNews = {
    tech: [
      "New AI Model Can Generate Videos from Text",
      "Tech Giant Unveils Revolutionary Smartphone",
      "Quantum Computing Breakthrough Announced"
    ],
    sports: [
      "Local Team Wins Championship in Overtime",
      "Star Athlete Signs Record-Breaking Contract",
      "Olympic Committee Announces New Event"
    ],
    world: [
      "International Summit on Climate Change Begins",
      "Historic Peace Agreement Signed",
      "Global Economic Forum Predicts Growth"
    ],
    general: [
      "Scientists Make Breakthrough Discovery",
      "New Study Reveals Health Benefits",
      "Community Project Receives Funding"
    ]
  };
  
  const validCategories = Object.keys(mockNews);
  
  if (!validCategories.includes(category)) {
    return ctx.reply(`Invalid category. Please choose from: ${validCategories.join(', ')}`);
  }
  
  const headlines = mockNews[category];
  const formattedNews = headlines.map((headline, i) => `${i + 1}. ${headline}`).join('\n');
  
  ctx.reply(`📰 Top Headlines (${category.toUpperCase()}):\n\n${formattedNews}`);
}

module.exports = {
  MODULE,
  HELP,
  newsCommand
};