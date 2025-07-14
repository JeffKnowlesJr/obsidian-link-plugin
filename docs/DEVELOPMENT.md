# Development Guide - Obsidian Link Plugin

A comprehensive guide for developers and contributors to the Obsidian Link Plugin.

## 📖 Table of Contents

- [Overview](#overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Building](#building)
- [Contributing](#contributing)
- [Code Style](#code-style)
- [Debugging](#debugging)
- [Release Process](#release-process)

## Overview

This guide helps developers set up the development environment, understand the codebase, and contribute to the Obsidian Link Plugin. The project uses TypeScript, follows modern development practices, and includes comprehensive testing.

### Prerequisites

- **Node.js** v16 or later
- **Git** for version control
- **Obsidian** for testing the plugin
- **VS Code** (recommended) with TypeScript support

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/jkjrdev/obsidian-link-plugin.git
cd obsidian-link-plugin
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Development Scripts

The project includes several npm scripts for development:

```bash
# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Organize documentation
npm run organize-docs
```

### 4. Development Workflow

1. **Start Development Server**:
   ```bash
   npm run dev
   ```

2. **Open Obsidian** and enable developer mode
3. **Load the plugin** from the `main.js` file in the project root
4. **Make changes** to the TypeScript files
5. **Test changes** in Obsidian
6. **Run tests** to ensure functionality
7. **Build for production** when ready

## Project Structure

```
obsidian-link-plugin/
├── src/                          # Source code
│   ├── main.ts                   # Main plugin class
│   ├── types.ts                  # Type definitions
│   ├── constants.ts              # Constants and configuration
│   ├── settings.ts               # Settings management
│   ├── managers/                 # Domain-specific managers
│   │   ├── directoryManager.ts
│   │   ├── fileSortingManager.ts
│   │   └── journalManager.ts
│   ├── services/                 # Shared services
│   │   └── dateService.ts
│   ├── settings/                 # Modular settings
│   │   ├── index.ts
│   │   ├── defaultSettings.ts
│   │   ├── settingsValidator.ts
│   │   ├── directorySettings.ts
│   │   ├── journalSettings.ts
│   │   ├── generalSettings.ts
│   │   └── dailyNotesSettings.ts
│   ├── ui/                       # User interface components
│   │   ├── ribbonManager.ts
│   │   └── settingsTab.ts
│   └── utils/                    # Utility functions
│       ├── errorHandler.ts
│       ├── pathUtils.ts
│       └── dateUtils.ts
├── docs/                         # Documentation
│   ├── README.md                 # Documentation index
│   ├── USER_GUIDE.md            # User documentation
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── COMPONENT_DOCUMENTATION.md # Component analysis
│   └── DEVELOPMENT.md           # This file
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── esbuild.config.mjs           # Build configuration
├── jest.config.js               # Test configuration
└── manifest.json                # Plugin manifest
```

### Key Files Explained

#### `src/main.ts`
The main plugin class that orchestrates the entire application. Contains:
- Plugin lifecycle management
- Settings loading/saving
- Command registration
- Event handling
- Integration with Obsidian APIs

#### `src/managers/`
Domain-specific managers that handle specific functionality:
- **DirectoryManager**: Folder structure creation and management
- **JournalManager**: Journal entry creation and management
- **FileSortingManager**: File organization and sorting

#### `src/services/`
Shared services used across the application:
- **DateService**: Centralized date handling and formatting

#### `src/settings/`
Modular settings system:
- **defaultSettings.ts**: Default configuration values
- **settingsValidator.ts**: Settings validation logic
- **index.ts**: Settings module exports

#### `src/ui/`
User interface components:
- **SettingsTab**: Settings panel UI
- **RibbonManager**: Ribbon button management

## Testing

### Test Structure

The project uses Jest for testing with the following structure:

```
tests/
├── unit/                         # Unit tests
│   ├── managers/
│   ├── services/
│   └── utils/
├── integration/                  # Integration tests
└── fixtures/                    # Test data and fixtures
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- path/to/test.ts

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests

#### Unit Test Example

```typescript
// tests/unit/services/dateService.test.ts
import { DateService } from '../../../src/services/dateService'

describe('DateService', () => {
  beforeEach(() => {
    DateService.initialize()
  })

  describe('format', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-01-15')
      const result = DateService.format(date, 'YYYY-MM-DD')
      expect(result).toBe('2025-01-15')
    })
  })

  describe('getJournalFilename', () => {
    it('should generate correct filename', () => {
      const date = new Date('2025-01-15')
      const result = DateService.getJournalFilename(date, 'YYYY-MM-DD dddd')
      expect(result).toBe('2025-01-15 Wednesday')
    })
  })
})
```

#### Integration Test Example

```typescript
// tests/integration/journalManager.test.ts
import { JournalManager } from '../../src/managers/journalManager'
import { MockApp } from '../fixtures/mockApp'

describe('JournalManager Integration', () => {
  let journalManager: JournalManager
  let mockApp: MockApp

  beforeEach(() => {
    mockApp = new MockApp()
    journalManager = new JournalManager(mockApp)
  })

  it('should create journal entry with correct path', async () => {
    const date = new Date('2025-01-15')
    const file = await journalManager.createOrOpenJournalEntry(date)
    
    expect(file.path).toContain('journal/2025/January')
    expect(file.name).toMatch(/2025-01-15/)
  })
})
```

### Test Fixtures

Create reusable test data in `tests/fixtures/`:

```typescript
// tests/fixtures/mockApp.ts
export class MockApp {
  vault = {
    create: jest.fn(),
    getAbstractFileByPath: jest.fn(),
    adapter: {
      exists: jest.fn()
    }
  }
  
  workspace = {
    getLeaf: jest.fn()
  }
  
  settings = {
    journalDateFormat: 'YYYY-MM-DD dddd',
    journalYearFormat: 'YYYY',
    journalMonthFormat: 'MMMM',
    simpleJournalMode: false
  }
}
```

## Building

### Development Build

```bash
npm run dev
```

This command:
1. Watches for file changes
2. Compiles TypeScript to JavaScript
3. Bundles the code using esbuild
4. Outputs to `main.js` in the project root

### Production Build

```bash
npm run build
```

This command:
1. Runs TypeScript type checking
2. Compiles and bundles for production
3. Minifies the output
4. Creates optimized `main.js`

### Build Configuration

The build process is configured in `esbuild.config.mjs`:

```javascript
// esbuild.config.mjs
import esbuild from 'esbuild'

const production = process.argv[2] === 'production'

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  format: 'cjs',
  platform: 'node',
  target: 'node14',
  minify: production,
  sourcemap: !production,
  watch: !production
})
```

## Contributing

### Contribution Guidelines

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes** following the code style guidelines
4. **Write tests** for new functionality
5. **Update documentation** if needed
6. **Run tests** to ensure everything works
7. **Submit a pull request**

### Pull Request Process

1. **Describe the changes** clearly in the PR description
2. **Include tests** for new functionality
3. **Update documentation** if the API changes
4. **Ensure all tests pass**
5. **Request review** from maintainers

### Code Review Checklist

- [ ] Code follows the style guide
- [ ] Tests are included and pass
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly documented)
- [ ] Error handling is appropriate
- [ ] Performance impact is considered

## Code Style

### TypeScript Guidelines

1. **Use TypeScript strictly**: Enable strict mode in `tsconfig.json`
2. **Define interfaces**: Create interfaces for all data structures
3. **Use type annotations**: Explicitly type function parameters and return values
4. **Avoid `any`**: Use proper types instead of `any`

```typescript
// Good
interface JournalEntry {
  date: string
  path: string
  title: string
}

function createJournalEntry(date: Date): JournalEntry {
  return {
    date: DateService.format(date, 'YYYY-MM-DD'),
    path: generatePath(date),
    title: generateTitle(date)
  }
}

// Avoid
function createJournalEntry(date: any): any {
  return {
    date: date.toString(),
    path: 'some/path',
    title: 'some title'
  }
}
```

### Naming Conventions

1. **Files**: Use kebab-case for file names (`directory-manager.ts`)
2. **Classes**: Use PascalCase (`DirectoryManager`)
3. **Functions**: Use camelCase (`createJournalEntry`)
4. **Constants**: Use UPPER_SNAKE_CASE (`DEFAULT_SETTINGS`)
5. **Interfaces**: Use PascalCase with `I` prefix for interfaces (`IJournalEntry`)

### Code Organization

1. **Single Responsibility**: Each class/function has one clear purpose
2. **Dependency Injection**: Pass dependencies through constructors
3. **Error Handling**: Use try-catch blocks and proper error types
4. **Comments**: Use JSDoc comments for public APIs

```typescript
/**
 * Creates a journal entry for the specified date
 * @param date - The date for the journal entry
 * @returns Promise resolving to the created file
 * @throws Error if the file cannot be created
 */
async createJournalEntry(date: Date): Promise<TFile> {
  try {
    const path = this.generatePath(date)
    const file = await this.app.vault.create(path, '')
    return file
  } catch (error) {
    throw new Error(`Failed to create journal entry: ${error.message}`)
  }
}
```

## Debugging

### Development Debugging

1. **Enable Debug Mode**: Set `debugMode: true` in settings
2. **Check Console**: Open browser console (Ctrl+Shift+I)
3. **Use Console Logs**: Add `console.log()` statements for debugging
4. **Check Network Tab**: Monitor API calls and file operations

### Debug Configuration

Add debug configuration to VS Code:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Plugin",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/main.ts",
      "outFiles": ["${workspaceFolder}/main.js"],
      "sourceMaps": true
    }
  ]
}
```

### Common Debugging Scenarios

#### Plugin Not Loading
1. Check browser console for errors
2. Verify `main.js` exists and is valid
3. Check Obsidian plugin settings
4. Ensure all dependencies are installed

#### Settings Not Saving
1. Check file permissions
2. Verify settings validation
3. Check for circular references in settings
4. Enable debug mode for detailed logging

#### File Operations Failing
1. Check vault permissions
2. Verify file paths are valid
3. Check for file system errors
4. Test with simple file operations first

## Release Process

### Version Management

The project uses semantic versioning:

- **Patch** (1.0.1): Bug fixes and minor improvements
- **Minor** (1.1.0): New features, backward compatible
- **Major** (2.0.0): Breaking changes

### Release Steps

1. **Update Version**:
   ```bash
   npm version patch|minor|major
   ```

2. **Update Documentation**:
   - Update README.md with new features
   - Update version numbers in documentation
   - Update changelog

3. **Build for Production**:
   ```bash
   npm run build
   ```

4. **Test the Build**:
   - Load the plugin in Obsidian
   - Test all functionality
   - Verify settings work correctly

5. **Create Release**:
   - Tag the release in Git
   - Create GitHub release
   - Upload built files

### Release Checklist

- [ ] All tests pass
- [ ] Documentation is updated
- [ ] Version numbers are correct
- [ ] Build is tested in Obsidian
- [ ] Release notes are written
- [ ] GitHub release is created

## Advanced Development

### Plugin Architecture

The plugin follows a modular architecture:

```
Main Plugin Class
├── Managers (Domain Logic)
│   ├── DirectoryManager
│   ├── JournalManager
│   └── FileSortingManager
├── Services (Shared Logic)
│   └── DateService
├── UI Components
│   ├── SettingsTab
│   └── RibbonManager
└── Utilities
    ├── ErrorHandler
    ├── PathUtils
    └── DateUtils
```

### Adding New Features

1. **Identify the Domain**: Which manager should handle this?
2. **Create the Interface**: Define types and interfaces
3. **Implement the Logic**: Add to appropriate manager
4. **Add UI Components**: Create settings or UI elements
5. **Write Tests**: Ensure functionality is tested
6. **Update Documentation**: Document the new feature

### Performance Optimization

1. **Lazy Loading**: Initialize components only when needed
2. **Caching**: Cache frequently accessed data
3. **Efficient Algorithms**: Use optimized algorithms
4. **Memory Management**: Clean up resources properly
5. **Minimal File Operations**: Batch operations when possible

### Security Considerations

1. **Input Validation**: Validate all user inputs
2. **Path Sanitization**: Sanitize file paths
3. **Error Handling**: Don't expose sensitive information
4. **Permission Checks**: Verify file system permissions
5. **Safe Defaults**: Use safe default values

## Conclusion

This development guide provides the foundation for contributing to the Obsidian Link Plugin. Follow the guidelines, write tests, and maintain code quality to ensure the plugin remains robust and maintainable.

For more information:
- **[User Guide](USER_GUIDE.md)** - User documentation
- **[Architecture Overview](ARCHITECTURE.md)** - Technical architecture
- **[Component Documentation](COMPONENT_DOCUMENTATION.md)** - Detailed component analysis

---

**Need help?** Open an issue on GitHub or ask questions in the development discussions. 