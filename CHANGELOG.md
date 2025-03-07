# Changelog

All notable changes to the Obsidian Link Plugin will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-01-XX

### Changed

- **Breaking**: Removed root `_Link` folder and leading underscores from folder names for Hugo compatibility
- Removed unnecessary file explorer features
- Simplified link style settings to focus on Hugo compatibility
- Improved daily notes check interval algorithm with random variance to prevent system load spikes

### Added

- New `hugoCompatibleLinks` setting to ensure links work with Hugo and other static site generators
- Check interval variance setting (1-15 minutes) to distribute system load
- Clear separation between plugin's folder templates and Templater functionality

### Removed

- File explorer auto-reveal feature
- Default link style options
- Auto-format links setting
- Template editing functionality (now view-only to avoid conflicts with other template plugins)

### Technical

- Refactored settings interface to be more focused and maintainable
- Improved folder check scheduling with randomized intervals
- Removed dependencies on file explorer API

### Development Notes

For future git updates to this repository:

1. All significant changes should be documented in this CHANGELOG.md file
2. Changes should be grouped under these categories:
   - Added (for new features)
   - Changed (for changes in existing functionality)
   - Deprecated (for soon-to-be removed features)
   - Removed (for now removed features)
   - Fixed (for any bug fixes)
   - Security (in case of vulnerabilities)
   - Technical (for internal changes that affect developers)
3. Breaking changes should be marked with **Breaking** in bold
4. Each change should be described in a way that users can understand
5. Version numbers should follow semantic versioning:
   - MAJOR version for incompatible API changes
   - MINOR version for added functionality in a backward compatible manner
   - PATCH version for backward compatible bug fixes
