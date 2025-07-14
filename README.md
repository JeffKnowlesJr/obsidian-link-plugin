# Obsidian Link Plugin v1.0.0

A focused Obsidian plugin for **intelligent daily note organization** with automatic monthly folder management and seamless Daily Notes integration. Future notes creation as well. No clutter, just the core functionality that matters.

## ✨ Core Features

### 🎯 Smart Daily Note Management

- **Automatic Monthly Folders**: Creates `2025/July/` folders automatically.
- **Reliable Date Detection**: Ensures notes for any day, including the 1st of the month, are placed in the correct monthly folder.
- **Customizable Structure**: Configure year (`YYYY`) and month (`MMMM`) folder formats.
- **Future Note Creation**: Plan ahead with future daily notes

### 🔗 Daily Notes Integration

- **Seamless Integration**: Works alongside Obsidian's Daily Notes plugin without conflicts
- **Automatic Backup**: Backs up your original Daily Notes settings before making any changes
- **Granular Control**: Choose which settings to manage (folder location, date format, template)
- **Safe Restore**: One-click restore to your original by disabling the plugin
- **Template Support**: Integrated with Templater plugin for dynamic date navigation

## 📁 Folder Structure (Simple & Working)

The plugin creates this organized structure:

```
Link/
├── journal/
│   ├── 2025/                    # Year folders
│   │   ├── July/                # Month folders
│   │   ├── August/
│   │   └── ...
│   └── [your daily notes]
├── templates/
│   └── Daily Notes Template.md  # Created with Templater compatibility
└── reference/
    └── linkplugin/             # All reference files are generated inside this subfolder
        ├── Architecture Decisions.md
        ├── Development Patterns.md
        ├── Integration Guide.md
        ├── Troubleshooting Lessons.md
        └── ... (other subfolders/files as needed)
```

**Key Benefits:**

- **Reliable Organization**: Your notes are always placed in the correct year and month folders.
- **No Conflicts**: Everything contained within configurable base folder (default: "Link")
- **Clean Organization**: Sibling directories for different purposes
- **Reference Subfolders**: All reference files are organized inside a `linkplugin` subfolder, and the reference folder can contain additional subfolders for further organization
- **Self-Documenting**: Built-in reference documentation explains all design decisions

## 🛠️ Installation

1. Open Obsidian Settings → Community Plugins
2. Disable Safe Mode if enabled
3. Browse and search for "Link Plugin"
4. Install and enable the plugin

## 📖 Quick Start

### Basic Usage (All You Need)

1. **Create Today's Note**: Click the "📝" ribbon button
2. **Configure Monthly Structure**: Use Settings to set folder formats
3. **That's It**: The plugin handles the rest automatically

### Settings That Matter

- **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
- **Year Format**: `YYYY` creates "2025"
- **Month Format**: `MMMM` creates "July"
- **Daily Notes Integration**: Control how the plugin integrates with the Daily Notes plugin.
- **Template Setup**: One-click template creation with Templater compatibility

## ⚙️ Configuration

Access settings via the ribbon button:

### Journal Settings

- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM`)
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

### Daily Notes Integration Settings

- **Enable Integration**: Toggle integration with the Daily Notes plugin.
- **Granular Controls**: Individual checkboxes for folder, format, and template control.
- **Quick Controls**: Enable/disable all controls at once.
- **Backup & Restore**: Automatic backup with a one-click restore in the danger zone.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 📚 Documentation

For detailed information about the plugin:

- **[User Guide](docs/USER_GUIDE.md)** - Comprehensive usage instructions and troubleshooting
- **[Architecture Overview](docs/ARCHITECTURE.md)** - Technical system design and algorithms
- **[Component Documentation](docs/COMPONENT_DOCUMENTATION.md)** - Detailed component analysis
- **[Development Guide](docs/DEVELOPMENT.md)** - Setup and contribution guidelines

## 🤝 Contributing

We welcome contributions! Please see our [Development Guide](docs/DEVELOPMENT.md) for setup instructions and contribution guidelines.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

_The Obsidian Link Plugin does one thing really well: intelligent daily note organization with seamless Daily Notes integration. You get a clean, focused tool for journal management that works alongside your existing workflow._
