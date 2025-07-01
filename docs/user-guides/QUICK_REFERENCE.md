# Quick Reference - Obsidian Link Plugin

## 🚀 Essential Commands

```bash
# Development
npm run dev          # Start development build (watch mode)
npm run build        # Production build
npm test             # Run tests

# Documentation
npm run organize-docs # Organize documentation files

# Project Structure
npm run version      # Bump version numbers
```

## 📁 Key Directories

```
├── src/                    # Source code (TypeScript)
│   ├── main.ts            # Plugin entry point
│   ├── managers/          # Business logic
│   ├── ui/               # User interface
│   ├── services/         # Centralized services
│   └── settings/         # Modular settings
├── docs/                  # Documentation (organized)
│   ├── user-guides/      # User documentation
│   ├── development/      # Developer docs
│   ├── architecture/     # Technical specs
│   └── project-management/ # Progress tracking
└── scripts/              # Automation scripts
```

## 🎀 Ribbon Buttons

| Icon | Function | Tooltip |
|------|----------|---------|
| 📅 | Today's Journal | Open/create today's journal entry |
| 📝 | Create Linked Note | Create note from selected text |
| 📁 | Create Monthly Folders | Create yearly folder structure |
| ⚡ | Shortcode Help | Show shortcode documentation |
| 🔄 | Rebuild Structure | Rebuild directory structure |
| ⚙️ | Settings | Open plugin settings |

## ⚙️ Settings Categories

- **📁 Directory**: Base folder, workspace, journal directories
- **📅 Journal**: Date formats, templates, monthly folders
- **📝 Notes**: Templates, auto-open settings
- **⚡ Shortcodes**: Enable/disable, trigger keys, custom codes
- **🔧 General**: Debug mode, validation
- **🔧 Advanced**: Reset, export, validation tools

## 🔧 Development Patterns

### Error Handling
```typescript
try {
  await this.performOperation();
  this.showSuccess('Operation completed');
} catch (error) {
  this.errorHandler.handleError(error, 'Operation failed');
}
```

### Manager Pattern
```typescript
class SomeManager {
  constructor(private plugin: LinkPlugin) {}
  
  async doSomething(): Promise<void> {
    // Business logic here
  }
}
```

### Service Pattern
```typescript
class SomeService {
  static initialize(): void { /* setup */ }
  static doSomething(): any { /* operation */ }
}
```

## 📝 Documentation Standards

### File Naming
- Use `SCREAMING_SNAKE_CASE.md`
- Descriptive, clear names
- Category prefixes when helpful

### Structure
```markdown
# Title
Brief description

## 📋 Table of Contents
## 🎯 Overview
## 📋 Main Content
## ✅ Summary

---
*Last updated: YYYY-MM-DD*
```

### Status Indicators
- ✅ Complete/Working
- ❌ Failed/Broken
- ⚠️ Warning/Caution
- 🔄 In Progress
- 📋 Information

## 🔍 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | `npm run build` - check TypeScript errors |
| Plugin not loading | Check `manifest.json` and `main.js` |
| Commands missing | Verify command registration in `main.ts` |
| Settings not saving | Check settings validation |
| Ribbon not appearing | Enable plugin, restart Obsidian |

## 📚 Documentation Navigation

- **Main**: [README.md](README.md)
- **Docs Index**: [docs/README.md](docs/README.md)
- **Architecture**: [docs/REPOSITORY_ARCHITECTURE.md](docs/REPOSITORY_ARCHITECTURE.md)
- **User Guide**: [docs/user-guides/](docs/user-guides/)
- **Development**: [docs/development/](docs/development/)

## 🎯 Current Status

- ✅ **Build**: Passing (TypeScript + ESBuild)
- ✅ **Features**: Ribbon interface, settings UI, modular architecture
- ✅ **Documentation**: Organized and comprehensive
- ✅ **Quality**: Type-safe, error handling, debugging support

---

*For detailed information, see the [complete documentation](docs/README.md)* 