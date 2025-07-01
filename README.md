# Obsidian Link Plugin

A powerful Obsidian plugin for streamlining note creation, organization, and directory management with smart linking capabilities.

## Overview

The Obsidian Link Plugin enhances your note-taking workflow by providing automated directory management, intelligent linking between notes, and powerful content creation tools. It's designed to maintain a clean, organized vault structure while making it faster to create and connect your notes.

## Features

### Core Features

- **Ribbon Interface**
  - 6 quick-access buttons for essential functions
  - One-click access to journal, note creation, and directory management
  - Visual feedback with success messages and error handling

- **Quick Note Creation and Linking**
  - Create new notes from selected text with automatic wiki-style links
  - Intelligent linking between related content
  - Contextual suggestions for connections

- **Automatic Folder Structure**
  - Creates an organized hierarchy within a dedicated plugin folder to prevent collisions
  - **Default Base Folder**: `LinkPlugin/` (configurable)
  - All plugin directories are created under this base folder
  - Configurable folder structure based on user preferences

**Default folder structure** (created under `LinkPlugin/`):
```
LinkPlugin/
├── journal/
│   ├── Misc/
│   ├── y_2025/
│   │   ├── January/
│   │   ├── February/
│   │   ├── March/
│   │   ├── April/
│   │   ├── May/
│   │   ├── June/
│   │   ├── Misc/
│   │   ├── Yearly List/
│   │   └── Yearly Log/
│   └── z_Archives/
│       ├── y_2022/
│       ├── y_2023/
│       └── y_2024/
├── templates/
├── workspace/
└── reference/
    └── files/
        ├── images/
        ├── pdfs/
        ├── videos/
        ├── audio/
        ├── docs/
        └── other/
```

**Optional complex structure** (can be enabled in settings):
```
LinkPlugin/
├── context/
├── schema/
└── Projects/
```

**Key Benefits:**
- **No Vault Collision**: All plugin folders are contained within `LinkPlugin/`
- **Easy Management**: Single folder to backup, move, or delete
- **Configurable Base**: Change the base folder name in settings
- **Clean Vault Root**: Keeps your main vault directory uncluttered

- **Daily Notes Management**
  - Automatically create and maintain year/month folders in the Journal section
  - Smart navigation between sequential daily notes
  - Automated date handling for journal entries

- **Error Handling**
  - Graceful handling of various errors with clear messages
  - Conflict resolution for duplicate notes or paths
  - Recovery options for common issues

### Technical Architecture

The plugin has a well-structured architecture with:

- Main Plugin Class as the entry point
- Modular commands for operations
- Modal interfaces for user interaction
- Utility functions for file operations and error handling

## Development Roadmap

### MVP (Current Focus)

- **Directory Structure Management**
  - Redesign plugin to handle complex directory structures
  - Implement configurable templates for folder organization
  - Add support for custom folder hierarchies

- **Journal Entry Date Management**
  - Automate date transitions for journal entries
  - Handle date formatting according to user preferences
  - Implement date-based navigation between notes

### Additional Planned Features

- **File Sorting Options**
  - Implement various sorting mechanisms for files
  - Add custom sorting rules based on metadata
  - Enable automatic sorting based on user activity

- **Emmet-like Shortcodes for Markdown**
  - Create a shortcode parser that detects special syntax patterns in the editor
  - Implement an expansion engine that converts shortcodes into full Markdown
  - Add a listener for key triggers (like Tab) after shortcodes
  - Build a nested syntax tree parser to handle chained and nested shortcodes

#### Shortcode Capabilities

- **Chaining & Nesting**
  - Use `>` for nesting elements (similar to Emmet)
  - Use `+` for sibling elements
  - Use `*` for multiplication/repetition
  - Use `{}` for content insertion
  - Use `()` for grouping elements
  - Use attributes with `[]` syntax

- **Example Shortcodes**
  - Simple: `table3x4` → Creates a 3×4 Markdown table skeleton
  - Chained: `h2{Project Overview}+h3{Goals}+ul>li*3` → Creates a heading structure with a 3-item list
  - Nested: `div>h3{Meeting Notes}+ul>li*5+blockquote` → Creates a section with heading, 5 list items, and a quote
  - Complex: `h2{Weekly Report}+(h3{Tasks}+ul>li*3)+(h3{Issues}+ul>li*2)` → Full report structure
  - With attributes: `link[https://example.com]{Visit Example}` → Creates `[Visit Example](https://example.com)`

- **Implementation Details**
  - Tokenizer to break the shortcode into components
  - Parser to build a tree structure from the tokens
  - Transformer to convert the tree into Markdown
  - Resolver to handle variables and custom snippets

- **Integration**
  - Add a new command category for shortcode expansion
  - Include a settings panel for customizing shortcodes
  - Create a help modal showing available shortcodes
  - Allow for snippet libraries/presets for common patterns

- **Benefits**
  - Dramatically speeds up creation of complex note structures
  - Single shortcode can generate entire note templates
  - Maintains consistent hierarchical structure across notes
  - Enables rapid creation of standardized sections
  - Reduces keystrokes for common patterns by 70-90%

## Installation

1. Open Obsidian Settings
2. Navigate to Community Plugins and disable Safe Mode
3. Click Browse and search for "Link Plugin"
4. Install the plugin and enable it

## Usage

### Ribbon Interface (Minimized)

The plugin provides a clean ribbon interface with 2 essential buttons:

- **📝 Create Future Note**: Smart button that creates linked notes from selected text or opens today's journal
- **⚙️ Plugin Settings**: Opens Link Plugin settings

*The ribbon has been simplified to reduce clutter and focus on the most essential functions.*

### Basic Usage

1. **Quick Method**: Select text and click the "📝 Create Linked Note" ribbon button
2. **Command Method**: Use the command palette (Ctrl/Cmd + P) and search for "Create Linked Note"
3. The plugin will create a new note with the selected text as the title and add a link in the original note

### Directory Management

1. **Quick Method**: Click the "🔄 Rebuild Directory Structure" ribbon button
2. **Settings Method**: Access plugin settings to configure your preferred directory structure
3. Notes will automatically be placed in the appropriate directories based on your settings

### Using Shortcodes (Coming Soon)

1. Type a shortcode in your note (e.g., `h2{Title}+ul>li*3`)
2. Press the trigger key (default: Tab)
3. The shortcode will expand into the corresponding Markdown structure

## Configuration

The plugin can be configured through the settings panel:

- **Directory Structure**: Customize the folder hierarchy for your vault
- **Date Formats**: Set your preferred date format for journal entries
- **Shortcode Settings**: Create and manage custom shortcodes (coming soon)
- **Key Bindings**: Customize keyboard shortcuts for plugin commands

## Documentation

Complete documentation is available in the [`docs/`](docs/) directory:

- **[📚 Documentation Index](docs/README.md)** - Overview of all documentation
- **[👥 User Guides](docs/user-guides/)** - How to use plugin features
- **[🔧 Development](docs/development/)** - Technical documentation for developers
- **[🏗️ Architecture](docs/architecture/)** - Implementation details and design decisions
- **[📊 Project Management](docs/project-management/)** - Progress tracking and summaries

## Development

### Setup Development Environment

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development build

### Building the Plugin

1. Run `npm run build` to create a production build
2. The built files will be available in the `dist` folder

### Documentation Organization

To reorganize documentation files, run:
```bash
npm run organize-docs
```

This script automatically organizes all documentation into the structured `docs/` directory.

## License

MIT

---

## Related Links

- [[The Data Well]] - Technical documentation and architecture details
- [[Goals]] - Development roadmap and milestones

## Recent Updates

### ✅ Completed Features

- **Dynamic Daily Notes Made Optional**: The complex year/month folder structure is now disabled by default. Enable "Simple Journal Mode" in settings for a clean, single-folder approach.
- **Simplified Settings UI**: Reduced settings to focus on quality over quantity. Only essential options are shown.
- **File Sorting System**: Automatically sort files by type and frontmatter metadata. Images, videos, PDFs go to `reference/files/`, markdown files sort by category/type.
- **Enhanced Linking**: Directory-relative links like `[[/reference/nesting]]` are now supported.
- **Minimized Ribbon**: Reduced from 6 buttons to 2 essential ones: "Create Future Note" (smart button) and "Plugin Settings".

### 🗃️ Quarantined Features

- **Shortcode System**: Complex Emmet-like shortcode expansion moved to `quarantine/` for MVP simplification.
- **Template System**: Avoided duplication with existing Obsidian templating solutions.

## TODO

- [x] ~~Make dynamic daily note folder structure optional~~ ✅ **COMPLETED**
- [x] ~~Make the plugin settings more user friendly~~ ✅ **COMPLETED** 
- [x] ~~Reduce ribbon button complexity~~ ✅ **COMPLETED**
- [x] ~~Add file sorting capabilities~~ ✅ **COMPLETED**