# Obsidian Link Plugin

A plugin for Obsidian that helps manage and enhance link functionality.

## Development Guide

### Prerequisites

-   NodeJS (v16+)
-   npm or yarn
-   Basic understanding of TypeScript and Obsidian API

### Project Structure

### Getting Started

1. Clone and Setup:

    ```bash
    git clone <repository-url>
    cd obsidian-link-plugin
    npm install
    ```

2. Development:

    ```bash
    npm run dev
    ```

3. Building:
    ```bash
    npm run build
    ```

### Development Best Practices

#### Code Organization

-   Follow the established folder structure for new features
-   Place business logic in services
-   Keep UI components in modals/components
-   Use TypeScript interfaces for type definitions

#### Resource Management

-   Use `this.app` instead of global `app`
-   Clean up resources in `onunload()`
-   Use `registerEvent()` for event listeners
-   Use `addCommand()` for commands

#### API Guidelines

-   Prefer Vault API (`app.vault`) over Adapter API
-   Use `normalizePath()` for file/folder paths
-   Use `getActiveViewOfType()` instead of `workspace.activeLeaf`
-   Use Editor API over `Vault.modify` for active file changes

#### Cross-Platform Compatibility

-   Avoid Node.js and Electron APIs
-   Test on both desktop and mobile
-   Be careful with lookbehind in regex (iOS compatibility)

#### UI Development

-   Use sentence case in UI text
-   Use `setHeading()` instead of HTML headings
-   Avoid setting default hotkeys
-   Use CSS classes instead of hardcoded styles

### Build System

-   ESBuild is configured for bundling
-   TypeScript compilation checks are run before build
-   Source maps are enabled in development

### Code Quality

-   ESLint is configured for code quality
-   Run `npm run lint` before committing
-   Follow TypeScript strict mode guidelines

### Version Control

-   Don't commit `main.js` (built file)
-   Don't commit `node_modules`
-   Update version numbers using `npm run version`
