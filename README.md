# Obsidian Link Plugin v2.2.0

A focused Obsidian plugin for **intelligent daily note organization** with automatic monthly folder management. No clutter, just the core functionality that matters.

## 🚀 What's New in v2.2.0

- **FIXED: July 1st Issue**: Daily notes now correctly create in July folder (was using invalid date format)
- **Simplified Focus**: File sorting features moved to quarantine - focus on core journal management
- **Streamlined Interface**: Just 2 essential ribbon buttons for daily note creation
- **Bulletproof Date Detection**: Fixed moment.js formatting issues causing wrong month folders
- **Professional Settings**: Clean interface focused on journal configuration only

## ✨ Core Feature (The Only Thing You Need)

### 🎯 Smart Daily Note Management
- **Automatic Monthly Folders**: Creates `2025/July/` folders automatically on July 1st
- **Correct Date Detection**: Fixed the MMmmmm format bug that caused July notes to go in wrong folder
- **Customizable Structure**: Configure year (`YYYY`) and month (`MMMM`) formats that actually work
- **Today's Note Button**: One-click access to today's journal entry
- **Future Note Creation**: Plan ahead with future daily notes

## 📁 Folder Structure (Simple & Working)

The plugin creates this organized structure:

```
LinkPlugin/
└── journal/
    ├── 2025/                    # Year folders
    │   ├── July/                # Month folders (FIXED: July 1st notes go here!)
    │   ├── August/
    │   └── ...
    └── [your daily notes]
```

**Key Benefits:**
- **Actually Works**: July 1st notes go in July folder (fixed the core bug)
- **No Complexity**: Just journal management, no file sorting distractions
- **Clean Organization**: One predictable structure
- **Reliable**: Uses valid moment.js formats

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
- **Month Format**: `MMMM` creates "July" (FIXED: was using invalid MMmmmm)

## ⚙️ Configuration

Access settings via the ribbon button:

### Journal Settings (The Only Settings That Matter)
- **Simple Journal Mode**: Single folder vs. organized year/month structure
- **Year Folder Format**: Configure year folder naming (default: `YYYY`)
- **Month Folder Format**: Configure month folder naming (default: `MMMM` - FIXED!)
- **Daily Note Format**: Customize daily note naming (default: `YYYY-MM-DD dddd`)

## 🗂️ What's Been Removed (Moved to Quarantine)

To fix the core July 1st issue and eliminate complexity:

- **File Sorting System**: Complex frontmatter-based organization (too distracting)
- **Auto-Sort Features**: Automatic file movement based on metadata
- **Bulk Sorting**: Preview and organize existing files
- **Multiple Ribbon Buttons**: Reduced from 6 to 2 essential buttons

## ✅ What Actually Works Now

### Fixed Issues
- ✅ **July 1st Bug**: Daily notes now correctly create in July folder
- ✅ **Date Format**: Fixed invalid `MMmmmm` format that caused wrong folders
- ✅ **Month Detection**: Proper moment.js formatting ensures correct month
- ✅ **Simplified UI**: No more confusing file sorting options

### Core Functionality
- ✅ **Daily Note Creation**: One-click today's note
- ✅ **Monthly Folders**: Automatic creation based on current date
- ✅ **Future Notes**: Plan ahead with any future date
- ✅ **Clean Settings**: Only journal-related options

## 🚧 Development

### Building the Plugin
```bash
npm install          # Install dependencies
npm run build       # Production build (now working!)
```

### Project Status
- **Current Version**: 2.2.0 (Journal-Focused Release)
- **Core Bug**: FIXED - July 1st notes now go in July folder
- **Architecture**: Simplified TypeScript focused on journal management
- **Complexity**: REMOVED - file sorting moved to quarantine

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 📊 Version History

### v2.2.0 (Current) - Journal-Focused Release
- ✅ **FIXED: July 1st Bug**: Daily notes now correctly create in July folder
- ✅ **Date Format Fix**: Changed invalid `MMmmmm` to proper `MMMM` format
- ✅ **Simplified Interface**: Reduced to 2 essential ribbon buttons
- ✅ **Quarantined File Sorting**: Moved complex features to quarantine folder
- ✅ **Clean Settings UI**: Focus only on journal management
- ❌ **Removed**: File sorting, auto-organization, bulk operations

### v2.1.0 - Foundation Release (Had the July Bug)
- ❌ Complex file sorting that distracted from core functionality
- ❌ Invalid date format causing July 1st notes to go in wrong folder

---

*The Obsidian Link Plugin now does one thing really well: intelligent daily note organization. The July 1st issue is fixed, file sorting complexity is gone, and you get a clean, focused tool for journal management.*