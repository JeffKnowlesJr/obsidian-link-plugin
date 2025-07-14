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

### 🎛️ Smart Plugin Control

- **Enable/Disable Plugin**: Control when the plugin performs operations
- **Ribbon Button Management**: Show or hide the settings ribbon button
- **No Automatic Operations**: Plugin starts disabled by default - no folder creation until you're ready
- **Template Auto-Setup**: Templates are automatically created when the plugin is enabled

## 📁 Folder Structure (Simple & Working)

The plugin creates this organized structure:

```
Link/
├── journal/                        # Daily notes organized by year and month
│   ├── 2025/
│   │   ├── July/
│   │   │   ├── 2025-07-01 Tuesday.md
│   │   │   ├── 2025-07-02 Wednesday.md
│   │   │   └── ...
│   │   ├── August/
│   │   │   └── ...
│   │   └── ...
│   └── [other daily notes]
├── workspace/                      # (Optional) Project/workspace notes
│   └── Client Name/
│       └── Project Name/
│           └── [project notes]
├── reference/                      # (Optional) Reference notes
│   └── Reference Topic/
│       └── [reference notes]
├── templates/                      # (Optional) Templates for notes
│   └── Daily Notes Template.md     # Templater-compatible template

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

1. **Enable the Plugin**: Go to Settings → Plugin Status → Enable Plugin
2. **Create Today's Note**: Click the "📝" ribbon button (appears when plugin is enabled)
3. **Configure Monthly Structure**: Use Settings to set folder formats
4. **That's It**: The plugin handles the rest automatically

### Plugin Control

- **Plugin Status**: Enable/disable the plugin to control when operations are performed
- **Ribbon Button**: Show/hide the settings ribbon button for easy access
- **Safe Default**: Plugin starts disabled - no automatic folder creation until you're ready

### Settings That Matter

- **Daily Note Format**: `YYYY-MM-DD dddd` creates "2025-07-01 Tuesday"
- **Year Format**: `YYYY` creates "2025"
- **Month Format**: `MMMM` creates "July"
- **Daily Notes Integration**: Control how the plugin integrates with the Daily Notes plugin.
- **Template Setup**: One-click template creation with Templater compatibility

## ⚙️ Configuration

Access settings via the ribbon button or Community Plugins menu:

### Plugin Status Settings

- **Enable Plugin**: Turn the plugin on/off to control when operations are performed
- **Show Ribbon Button**: Control visibility of the settings ribbon button

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
