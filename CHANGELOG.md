# Changelog

All notable changes to the "teleflex" package will be documented in this file.


## [2.1.0] - 2024-06-09

### Added
- Support for Telegram Web Apps with new `createWebAppButton` method
- Enhanced inline keyboard support with `createInlineKeyboard` method
- New message helper methods: `sendSuccess`, `sendError`, and `sendInfo`
- Session support with `enableSession` option
- New theme properties for better text formatting
- Additional emoji support for success, error, and info messages
- Updated dependencies to their latest versions

### Changed
- Updated Telegraf dependency to version 4.15.3
- Improved type definitions for better TypeScript support
- Enhanced theme system with more formatting options

### Fixed
- Type definitions for theme configurations
- Improved error handling for callback queries


## [2.0.2] - 2025-05-06

### Added
- Start message with customizable buttons in a grid format
- "Back to Start" button in help menu for easier navigation
- Support for URL and callback buttons in start messages
- Enhanced navigation between help menu and start message

### Changed
- Improved start message handling with more flexibility
- Better message state management for navigation

## [2.0.1] - 2025-05-04

### Added
- Comprehensive test suite with Jest
- Examples folder with working bot implementation
- TypeScript definitions and type support

### Changed
- Improved error handling for message editing
- Enhanced flood control implementation
- Better support for different parse modes

### Fixed
- Bug in pagination handling
- Error when module directory doesn't exist

## [2.0.0] - 2025-03-15

### Added
- Custom themes support with modern, minimal, and default themes
- Rate limiting for button clicks
- Support for custom button layouts
- Enhanced module callbacks

### Changed
- Updated to Telegraf 4.x compatibility
- Improved message formatting
- Enhanced module discovery

## [1.0.0] - 2025-01-10

### Added
- Initial release
- Module discovery and loading
- Dynamic help menu generation
- Pagination support for help menus
- Customizable text and emoji
