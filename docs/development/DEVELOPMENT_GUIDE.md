# Development Guide - Obsidian Link Plugin

**A beginner-friendly guide to developing and contributing to the Obsidian Link Plugin**

## Table of Contents
- [Getting Started](#getting-started)
- [Understanding the Project Structure](#understanding-the-project-structure)
- [Development Workflow](#development-workflow)
- [Code Organization](#code-organization)
- [Testing Strategy](#testing-strategy)
- [Best Practices](#best-practices)
- [Common Development Tasks](#common-development-tasks)

---

## Getting Started

### What You Need to Know

This is an **Obsidian plugin** written in **TypeScript**. Think of it as a small application that adds new features to Obsidian (a note-taking app). Here's what each technology does:

- **TypeScript**: Like JavaScript but with type checking (helps catch errors before they happen)
- **ESBuild**: A fast tool that bundles all your code into one file that Obsidian can use
- **Jest**: A testing framework to make sure your code works correctly
- **Node.js**: The runtime environment that lets you run JavaScript/TypeScript outside of a browser

### Before You Start Coding

1. **Install Prerequisites:**
   ```bash
   # Check if you have Node.js (should be version 16+)
   node --version
   
   # Install dependencies
   npm install
   ```

2. **Fix Current Issues First:**
   - The project currently has syntax errors that prevent building
   - See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for specific fixes needed
   - Don't start new features until the build works

3. **Understand the Goal:**
   - This plugin helps organize notes and create links between them
   - It adds new commands to Obsidian's command palette
   - It can automatically create folder structures and journal entries

---

## Understanding the Project Structure

### File Organization (Like a Filing Cabinet)

```
src/
├── main.ts              # The "front door" - where everything starts
├── constants.ts         # Settings and fixed values (like a config file)
├── types.ts            # TypeScript type definitions (rules for data)
├── settings.ts         # User preferences and configuration
├── managers/           # The "workers" that do specific jobs
│   ├── directoryManager.ts    # Creates and manages folders
│   ├── journalManager.ts      # Handles daily notes
│   └── linkManager.ts         # Creates links between notes
├── shortcodes/         # The "macro system" for quick text expansion
│   ├── parser.ts       # Understands shortcode syntax
│   ├── tokenizer.ts    # Breaks shortcodes into pieces
│   ├── transformer.ts  # Converts shortcodes to markdown
│   └── registry.ts     # Keeps track of available shortcodes
├── ui/                 # User interface components
│   └── settingsTab.ts  # The settings panel in Obsidian
└── utils/              # Helper functions (like a toolbox)
    ├── dateUtils.ts    # Date formatting and manipulation
    ├── errorHandler.ts # Deals with errors gracefully
    └── pathUtils.ts    # File path operations
```

### How the Pieces Work Together

1. **main.ts** is like the conductor of an orchestra - it coordinates everything
2. **Managers** are like specialized workers - each handles one type of task
3. **Utils** are like tools in a toolbox - small helpers used everywhere
4. **UI** components create the interface users see and interact with

---

## Development Workflow

### The Daily Development Process

#### 1. Start Your Development Session
```bash
# Make sure you're in the project directory
cd /path/to/obsidian-link

# Install any new dependencies
npm install

# Start the development build (watches for changes)
npm run dev
```

#### 2. Make Changes
- Edit files in the `src/` directory
- The build system automatically rebuilds when you save files
- Check the terminal for any build errors

#### 3. Test Your Changes
```bash
# Run tests to make sure nothing broke
npm test

# Or run tests in watch mode (runs automatically when files change)
npm run test:watch
```

#### 4. Debug in Obsidian
- Copy the built `main.js` file to your Obsidian plugins folder
- Reload the plugin in Obsidian
- Open Developer Tools (Ctrl+Shift+I) to see console messages

### The Git Workflow (Version Control)

```bash
# Check what files you've changed
git status

# Add your changes to staging
git add .

# Commit your changes with a descriptive message
git commit -m "Fix template literal syntax in constants.ts"

# Push to your branch
git push origin your-branch-name
```

---

## Code Organization

### Writing New Features

#### 1. Plan Before You Code
- **What does this feature do?** (Write it in one sentence)
- **Where does it fit?** (Which manager or component?)
- **What data does it need?** (Add types to `types.ts`)
- **How do users access it?** (Command? Settings? UI?)

#### 2. Follow the Pattern

**For a new command:**
```typescript
// 1. Add the command ID to constants.ts
export const COMMAND_IDS = {
  // ... existing commands
  YOUR_NEW_COMMAND: 'your-new-command'
} as const;

// 2. Register the command in main.ts
this.addCommand({
  id: COMMAND_IDS.YOUR_NEW_COMMAND,
  name: 'Your New Command',
  callback: () => this.yourNewCommandHandler()
});

// 3. Create the handler method
private async yourNewCommandHandler(): Promise<void> {
  try {
    // Your command logic here
  } catch (error) {
    this.errorHandler.handleError(error, 'Your New Command');
  }
}
```

**For a new manager:**
```typescript
// 1. Create the manager file
// src/managers/yourManager.ts
import { App } from 'obsidian';
import { ErrorHandler } from '../utils/errorHandler';

export class YourManager {
  constructor(
    private app: App,
    private errorHandler: ErrorHandler
  ) {}

  async doSomething(): Promise<void> {
    // Manager logic here
  }
}

// 2. Add it to main.ts
private yourManager: YourManager;

async onload() {
  // ... existing code
  this.yourManager = new YourManager(this.app, this.errorHandler);
}
```

#### 3. Error Handling Pattern

Always wrap risky operations in try-catch blocks:

```typescript
async someRiskyOperation(): Promise<void> {
  try {
    // Code that might fail
    await this.app.vault.create(path, content);
  } catch (error) {
    // Log the error for developers
    console.error('[ObsidianLink] Error in someRiskyOperation:', error);
    
    // Show a user-friendly message
    new Notice('Failed to create file. Please try again.');
    
    // Re-throw if the caller needs to handle it
    throw error;
  }
}
```

---

## Testing Strategy

### Types of Tests

#### 1. Unit Tests (Test Individual Functions)
```typescript
// test/utils/dateUtils.test.ts
import { formatDate } from '../../src/utils/dateUtils';

describe('dateUtils', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-12-25');
    const formatted = formatDate(date, 'YYYY-MM-DD');
    expect(formatted).toBe('2023-12-25');
  });
});
```

#### 2. Integration Tests (Test How Parts Work Together)
```typescript
// test/managers/directoryManager.test.ts
import { DirectoryManager } from '../../src/managers/directoryManager';

describe('DirectoryManager', () => {
  it('should create directory structure', async () => {
    const manager = new DirectoryManager(mockApp, mockErrorHandler);
    await manager.createDirectoryStructure();
    
    // Verify directories were created
    expect(mockApp.vault.adapter.exists).toHaveBeenCalledWith('Journal');
  });
});
```

### When to Write Tests

- **Before fixing a bug**: Write a test that reproduces the bug
- **Before adding a feature**: Write tests for the expected behavior
- **After changing code**: Make sure existing tests still pass

### Running Tests

```bash
# Run all tests once
npm test

# Run tests and watch for changes
npm run test:watch

# Run tests with coverage report
npm test -- --coverage
```

---

## Best Practices

### Code Quality

#### 1. Use Meaningful Names
```typescript
// Bad
const d = new Date();
const u = users.filter(x => x.a);

// Good
const currentDate = new Date();
const activeUsers = users.filter(user => user.isActive);
```

#### 2. Keep Functions Small
```typescript
// Bad - does too many things
async createNoteWithEverything(title: string) {
  // 50 lines of code doing multiple things
}

// Good - single responsibility
async createNote(title: string, content: string): Promise<TFile> {
  return await this.app.vault.create(title, content);
}

async addToJournal(note: TFile): Promise<void> {
  // Journal-specific logic
}
```

#### 3. Use TypeScript Features
```typescript
// Define interfaces for complex data
interface NoteMetadata {
  title: string;
  created: Date;
  tags: string[];
  source?: string; // Optional property
}

// Use union types for limited options
type NoteType = 'journal' | 'document' | 'template';

// Use const assertions for immutable objects
const CONFIG = {
  MAX_NOTES: 1000,
  DEFAULT_FOLDER: 'Documents'
} as const;
```

### Performance

#### 1. Use Async/Await for File Operations
```typescript
// File operations are slow - always use async
async createMultipleNotes(notes: NoteData[]): Promise<void> {
  // Process in parallel for better performance
  const promises = notes.map(note => this.createNote(note));
  await Promise.all(promises);
}
```

#### 2. Cache Expensive Operations
```typescript
class DirectoryManager {
  private directoryCache = new Map<string, boolean>();

  async directoryExists(path: string): Promise<boolean> {
    if (this.directoryCache.has(path)) {
      return this.directoryCache.get(path)!;
    }
    
    const exists = await this.app.vault.adapter.exists(path);
    this.directoryCache.set(path, exists);
    return exists;
  }
}
```

### User Experience

#### 1. Provide Feedback
```typescript
async longRunningOperation(): Promise<void> {
  // Show progress to user
  const notice = new Notice('Creating directory structure...', 0);
  
  try {
    await this.doWork();
    notice.setMessage('Directory structure created successfully!');
    setTimeout(() => notice.hide(), 2000);
  } catch (error) {
    notice.setMessage('Failed to create directories');
    setTimeout(() => notice.hide(), 3000);
  }
}
```

#### 2. Handle Edge Cases
```typescript
async createNote(title: string): Promise<TFile> {
  // Validate input
  if (!title || title.trim().length === 0) {
    throw new Error('Note title cannot be empty');
  }
  
  // Handle special characters
  const sanitizedTitle = title.replace(/[\\/:*?"<>|]/g, '-');
  
  // Handle duplicate names
  let finalTitle = sanitizedTitle;
  let counter = 1;
  while (await this.app.vault.adapter.exists(`${finalTitle}.md`)) {
    finalTitle = `${sanitizedTitle} ${counter}`;
    counter++;
  }
  
  return await this.app.vault.create(`${finalTitle}.md`, '');
}
```

---

## Common Development Tasks

### Adding a New Command

1. **Define the command ID** in `constants.ts`
2. **Register the command** in `main.ts`
3. **Create the handler method**
4. **Add error handling**
5. **Write tests**
6. **Update documentation**

### Adding a New Setting

1. **Define the setting interface** in `types.ts`
2. **Add default value** in `settings.ts`
3. **Create UI control** in `settingsTab.ts`
4. **Use the setting** in your feature code
5. **Add validation** if needed

### Debugging Issues

1. **Use console.log** liberally during development
2. **Check the Obsidian console** (Ctrl+Shift+I)
3. **Use TypeScript strict mode** to catch errors early
4. **Write tests** to isolate problems
5. **Use the debugger** in your browser's dev tools

### Working with Obsidian API

```typescript
// Common patterns for working with Obsidian

// Get all files in vault
const files = this.app.vault.getFiles();

// Get files in specific folder
const journalFiles = this.app.vault.getFiles()
  .filter(file => file.path.startsWith('Journal/'));

// Create a file
const file = await this.app.vault.create('path/to/file.md', 'content');

// Read file content
const content = await this.app.vault.read(file);

// Modify file content
await this.app.vault.modify(file, newContent);

// Get current active file
const activeFile = this.app.workspace.getActiveFile();

// Open a file
await this.app.workspace.openLinkText('file-name', '');
```

---

## Remember

1. **Start small** - Get basic functionality working before adding complexity
2. **Test frequently** - Don't write a lot of code without testing it
3. **Ask for help** - Check the troubleshooting guide or ask questions
4. **Document as you go** - Future you will thank present you
5. **Be patient** - Development is iterative; expect to refactor and improve

The goal is to create a plugin that makes Obsidian users more productive. Focus on solving real problems with clean, maintainable code. 