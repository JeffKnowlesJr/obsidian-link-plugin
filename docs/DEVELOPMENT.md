# Development Guide - DateFolders for DailyNotes Plugin

This document provides development guidelines, testing strategies, and contribution information for the DateFolders for DailyNotes plugin.

## 📖 Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Code Style](#code-style)
- [Testing Strategy](#testing-strategy)
- [Debugging](#debugging)
- [Contributing](#contributing)
- [Release Process](#release-process)

## Development Setup

### Prerequisites

1. **Node.js**: Version 16 or higher
2. **npm**: Package manager
3. **Git**: Version control
4. **Obsidian**: For testing the plugin

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd obsidian-link-plugin

# Install dependencies
npm install

# Build the plugin
npm run build

# Watch for changes during development
npm run dev
```

### Development Environment

1. **TypeScript**: The project uses TypeScript for type safety
2. **ESLint**: Code linting and style enforcement
3. **Jest**: Unit testing framework
4. **esbuild**: Fast bundling for development

## Project Structure

```
obsidian-link-plugin/
├── src/
│   ├── main.ts                 # Main plugin class
│   ├── types.ts                # Type definitions
│   ├── constants.ts            # Constants and configuration
│   ├── settings.ts             # Settings management
│   ├── managers/
│   │   ├── directoryManager.ts # Directory structure management
│   │   └── dailyNotesManager.ts # Daily note management
│   ├── services/
│   │   └── dateService.ts      # Date handling utilities
│   ├── settings/
│   │   ├── index.ts            # Settings exports
│   │   ├── defaultSettings.ts  # Default settings
│   │   ├── settingsValidator.ts # Settings validation
│   │   ├── directorySettings.ts # Directory settings
│   │   ├── dailyNotesSettings.ts # Daily note settings
│   │   └── generalSettings.ts  # General settings
│   ├── ui/
│   │   ├── settingsTab.ts      # Settings UI
│   │   └── ribbonManager.ts    # Ribbon button management
│   └── utils/
│       ├── errorHandler.ts     # Error handling
│       ├── pathUtils.ts        # Path utilities
│       └── debugUtils.ts       # Debug utilities
├── docs/                       # Documentation
├── tests/                      # Test files
├── manifest.json               # Plugin manifest
├── package.json                # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── esbuild.config.mjs         # Build configuration
└── jest.config.js             # Test configuration
```

### Key Components

- **Main Plugin Class**: Orchestrates all components
- **DirectoryManager**: Handles folder structure creation
- **DailyNotesManager**: Manages daily note creation and links
- **DateService**: Provides date utilities
- **Settings System**: Modular configuration management
- **UI Components**: Settings and ribbon management
- **Utilities**: Error handling, path utilities, debugging

## Code Style

### TypeScript Guidelines

1. **Type Safety**: Use strict TypeScript settings
2. **Interfaces**: Define clear interfaces for all data structures
3. **Generics**: Use generics where appropriate
4. **Enums**: Use enums for constants
5. **Async/Await**: Prefer async/await over Promises

### Naming Conventions

1. **Classes**: PascalCase (e.g., `DirectoryManager`)
2. **Methods**: camelCase (e.g., `createDailyNote()`)
3. **Constants**: UPPER_SNAKE_CASE (e.g., `DEFAULT_SETTINGS`)
4. **Interfaces**: PascalCase with 'I' prefix (e.g., `IDailyNoteSettings`)
5. **Files**: camelCase (e.g., `dailyNotesManager.ts`)

### Code Organization

1. **Single Responsibility**: Each class has one clear purpose
2. **Dependency Injection**: Pass dependencies through constructors
3. **Error Handling**: Use try/catch blocks and error boundaries
4. **Documentation**: Include JSDoc comments for public methods
5. **Testing**: Write tests for all public methods

### Example Code Structure

```typescript
/**
 * Manages daily note creation and organization
 */
export class DailyNotesManager {
  private plugin: LinkPlugin;
  private errorHandler: ErrorHandler;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
    this.errorHandler = new ErrorHandler(plugin);
  }

  /**
   * Creates or opens a daily note for the specified date
   * @param date - The date for the daily note
   * @returns Promise<TFile> - The created or existing file
   */
  async createOrOpenDailyNote(date: Date): Promise<TFile> {
    try {
      // Implementation
    } catch (error) {
      this.errorHandler.handleError(error, 'Failed to create daily note');
      throw error;
    }
  }
}
```

## Testing Strategy

### Test Structure

```
tests/
├── unit/
│   ├── managers/
│   │   ├── directoryManager.test.ts
│   │   └── dailyNotesManager.test.ts
│   ├── services/
│   │   └── dateService.test.ts
│   ├── settings/
│   │   ├── settingsValidator.test.ts
│   │   └── dailyNotesSettings.test.ts
│   └── utils/
│       ├── errorHandler.test.ts
│       └── pathUtils.test.ts
├── integration/
│   ├── plugin.test.ts
│   └── dailyNotesManager.test.ts
└── e2e/
    └── userWorkflow.test.ts
```

### Unit Testing

```typescript
// tests/unit/managers/dailyNotesManager.test.ts
import { DailyNotesManager } from '../../src/managers/dailyNotesManager'
import { mockPlugin } from '../mocks/plugin'

describe('DailyNotesManager Unit Tests', () => {
  let dailyNotesManager: DailyNotesManager

  beforeEach(() => {
    dailyNotesManager = new DailyNotesManager(mockPlugin)
  })

  describe('createOrOpenDailyNote', () => {
    it('should create a new daily note when it does not exist', async () => {
      const date = new Date('2024-01-01')
      const file = await dailyNotesManager.createOrOpenDailyNote(date)
      
      expect(file).toBeDefined()
      expect(file.path).toContain('2024-01-01')
    })

    it('should return existing file when daily note already exists', async () => {
      // Test implementation
    })
  })
})
```

### Integration Testing

```typescript
// tests/integration/dailyNotesManager.test.ts
import { DailyNotesManager } from '../../src/managers/dailyNotesManager'

describe('DailyNotesManager Integration', () => {
  let dailyNotesManager: DailyNotesManager

  beforeEach(() => {
    dailyNotesManager = new DailyNotesManager(mockApp)
  })

  it('should create monthly folder structure when creating daily note', async () => {
    const date = new Date('2024-01-01')
    const file = await dailyNotesManager.createOrOpenDailyNote(date)
    
    // Verify folder structure was created
    const monthlyFolder = mockApp.vault.getFolderByPath('DailyNotes/2024/01 January')
    expect(monthlyFolder).toBeDefined()
  })
})
```

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- dailyNotesManager.test.ts

# Generate coverage report
npm run test:coverage
```

## Debugging

### Debug Mode

Enable debug mode in settings to get detailed logging:

```typescript
// In settings
debugMode: true

// In code
DebugUtils.log('Creating daily note for date:', date)
DebugUtils.error('Failed to create folder:', error)
```

### Debug Utilities

```typescript
// Debug information
DebugUtils.getDebugInfo()

// Performance timing
const start = performance.now()
// ... operation
const end = performance.now()
DebugUtils.log(`Operation took ${end - start}ms`)
```

### Common Debug Scenarios

1. **Settings Issues**: Check settings validation and defaults
2. **File System Errors**: Verify paths and permissions
3. **Date Formatting**: Check date format strings
4. **Plugin Integration**: Verify Daily Notes plugin settings
5. **UI Issues**: Check settings panel and ribbon buttons

## Contributing

### Development Workflow

1. **Fork**: Fork the repository
2. **Branch**: Create a feature branch
3. **Develop**: Implement your changes
4. **Test**: Write tests for your changes
5. **Document**: Update documentation
6. **Submit**: Create a pull request

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] Error handling is implemented
- [ ] Performance is considered
- [ ] Security is addressed

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes
```

## Release Process

### Version Management

1. **Semantic Versioning**: Follow semver (MAJOR.MINOR.PATCH)
2. **Changelog**: Maintain CHANGELOG.md
3. **Release Notes**: Document breaking changes
4. **Migration Guide**: Provide upgrade instructions

### Build Process

```bash
# Build for production
npm run build

# Build for development
npm run dev

# Run tests before release
npm test

# Check code quality
npm run lint
```

### Release Checklist

- [ ] All tests passing
- [ ] Code linting clean
- [ ] Documentation updated
- [ ] Version bumped
- [ ] Changelog updated
- [ ] Release notes written
- [ ] Build successful
- [ ] Manual testing completed

### Deployment

1. **Tag Release**: Create git tag
2. **Build Artifacts**: Generate distribution files
3. **Publish**: Release to appropriate channels
4. **Announce**: Notify users of new release

## Conclusion

This development guide provides the foundation for contributing to the DateFolders for DailyNotes plugin. Follow these guidelines to ensure code quality, maintainability, and reliability.

For more information, see:
- [Architecture Documentation](ARCHITECTURE.md)
- [Component Documentation](COMPONENT_DOCUMENTATION.md)
- [Application Documentation](APPLICATION_DOCUMENTATION.md)
- [User Guide](USER_GUIDE.md) 