# Link Plugin Architecture

## Overview

The Link Plugin is built with a simple, modular architecture focusing on core note creation and linking functionality. It follows Obsidian's plugin architecture patterns and uses TypeScript for type safety.

## Core Components

### 1. Main Plugin Class (`main.ts`)

- Entry point for the plugin
- Handles plugin lifecycle (load/unload)
- Registers commands
- Manages plugin initialization

### 2. Commands

Located in `src/commands/`:

- `createLinkedNote.ts`: Core functionality for creating and linking notes
  - Modular functions for each operation
  - Strong type safety with TypeScript
  - Comprehensive error handling
  - Clear separation of concerns:
    - Note name acquisition
    - File name validation
    - File creation
    - Link insertion

### 3. Modals

Located in `src/modals/`:

- `helpModal.ts`: Displays plugin documentation and settings access
  - Shows core features
  - Provides quick access to settings
- `newNoteModal.ts`: Handles note name input
  - Simple input dialog for new note names
  - Basic validation
  - Promise-based result handling

### 4. Utilities

Located in `src/utils/`:

- `fileUtils.ts`: File system operations
  - File name sanitization
  - Path handling utilities
- `errorHandler.ts`: Centralized error handling
  - Custom `LinkPluginError` class
  - Typed error codes
  - Consistent error logging
  - User-friendly notifications
  - Error wrapping and context preservation

## Data Flow

1. Note Creation Flow

   ```
   User Action (Selection/Command)
   ↓
   Get Note Name (Selection/Modal)
   ↓
   Validate & Sanitize Filename
   ↓
   Create Note File
   ↓
   Insert Link
   ↓
   Show Success Notice
   ```

2. Error Handling Flow
   ```
   Error Occurs
   ↓
   Error Wrapped as LinkPluginError
   ↓
   Context Added
   ↓
   Error Logged
   ↓
   User Notified
   ↓
   Error Propagated
   ```

## File Structure

```
src/
├── main.ts                 # Plugin entry point
├── commands/
│   └── createLinkedNote.ts # Modular note creation logic
├── modals/
│   ├── helpModal.ts       # Help documentation
│   └── newNoteModal.ts    # Note name input
└── utils/
    ├── fileUtils.ts       # File operations
    └── errorHandler.ts    # Centralized error handling
```

## Dependencies

- **Obsidian API**: Core functionality for file operations and UI
- **TypeScript**: Type safety and modern JavaScript features
- **tslib**: TypeScript helper functions

## Error Handling

The plugin uses a sophisticated error handling system:

1. **Error Types**

   - `LinkPluginError`: Custom error class
   - Typed error codes for specific failures
   - Original error preservation

2. **Error Categories**

   - File operations (creation, existence checks)
   - Validation (filenames, note names)
   - UI operations (link insertion)
   - General operations

3. **Error Processing**
   - Centralized error handling
   - Consistent logging
   - User-friendly notifications
   - Context preservation

## Best Practices

1. **Code Organization**

   - Single responsibility functions
   - Clear error boundaries
   - Type-safe interfaces
   - Async operation handling

2. **Error Handling**

   - Always use `LinkPluginError`
   - Preserve error context
   - Provide user-friendly messages
   - Log for debugging

3. **File Operations**
   - Validate before operations
   - Handle existence checks
   - Proper error propagation
   - Clean error messages

## Future Considerations

1. **Extensibility**

   - New error types can be added
   - Additional file operations
   - Enhanced validation rules

2. **Performance**

   - Optimized file operations
   - Efficient error handling
   - Reduced redundancy

3. **User Experience**
   - Better error messages
   - Enhanced recovery options
   - More detailed logging
