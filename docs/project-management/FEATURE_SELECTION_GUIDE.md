# Feature Selection Guide

This guide explains how to use the feature configuration system to select which features you want implemented in the Obsidian Link Plugin.

## Quick Start

### 1. View Available Features
```bash
node scripts/feature-config-helper.js list
```

### 2. Apply a Preset Configuration
```bash
# For minimal MVP fixes only
node scripts/feature-config-helper.js preset minimal_mvp

# For file organization focus
node scripts/feature-config-helper.js preset file_organization_focus

# For full-featured implementation
node scripts/feature-config-helper.js preset full_featured
```

### 3. Check What's Enabled
```bash
node scripts/feature-config-helper.js enabled
```

### 4. Enable Individual Features
```bash
node scripts/feature-config-helper.js enable file_sorting_system
```

## Configuration File: `FEATURE_CONFIG.json`

The main configuration file contains all available features organized by:

- **Priority**: 1 (Critical) to 4 (Low priority)
- **Category**: Core Functionality, User Experience, etc.
- **Estimated Effort**: Development time estimates
- **Dependencies**: What other systems each feature relies on

### Feature Categories

#### 🔧 Core Functionality
- **file_sorting_system**: Comprehensive file sorting based on metadata
- **dynamic_daily_notes_optional**: Make folder structure optional

#### 👤 User Experience  
- **settings_ui_improvements**: Better, more user-friendly settings
- **enhanced_ribbon_interface**: Improved ribbon buttons

#### 📝 Content Creation
- **template_based_note_creation**: Create notes from templates

#### 🔗 Content Management
- **advanced_linking_features**: Smart linking and backlink analysis

#### 🧠 Intelligence
- **content_analysis_engine**: AI-powered content analysis

#### 🛠️ Technical
- **performance_optimizations**: Speed and memory improvements

## Available Presets

### `minimal_mvp`
- Just fixes critical MVP issues
- Enables: dynamic_daily_notes_optional, settings_ui_improvements
- Estimated effort: 2-3 days

### `file_organization_focus`
- Focus on file sorting and organization
- Enables: file_sorting_system, template_based_note_creation, dynamic_daily_notes_optional
- Estimated effort: 5-7 days

### `full_featured`
- Most features except low priority ones
- Enables: All priority 1-3 features
- Estimated effort: 10-15 days

## Manual Configuration

You can also manually edit `FEATURE_CONFIG.json`:

```json
{
  "features": {
    "file_sorting_system": {
      "enabled": true,  // ← Change this to enable/disable
      "components": {
        "metadata_extraction": {
          "enabled": true  // ← Enable individual components
        }
      }
    }
  }
}
```

## Implementation Phases

The configuration includes suggested implementation phases:

1. **Phase 1 - MVP Fixes** (2-3 days)
   - Critical stability fixes
   - Settings improvements

2. **Phase 2 - Core Features** (4-6 days)
   - File sorting system
   - Template-based notes

3. **Phase 3 - Enhancements** (4-6 days)
   - UI improvements
   - Advanced linking

4. **Phase 4 - Intelligence** (7-9 days)
   - Content analysis
   - Performance optimization

## Feature Details

### File Sorting System
The most requested feature - automatically sorts files based on:
- **File type**: Images, videos, PDFs → `reference/files/`
- **Frontmatter**: Category, type, tags in markdown files
- **Custom rules**: User-defined sorting criteria

Components:
- Metadata extraction from frontmatter
- File type detection and sorting
- Custom sorting rules engine
- Auto-sort on file creation
- Bulk sorting commands
- Dry-run preview mode

### Template-Based Note Creation
Create notes from templates with:
- Template management system
- Variable substitution (dates, titles)
- Future daily note creation
- Template selection UI

## Usage Examples

```bash
# See all features with priorities and status
node scripts/feature-config-helper.js list

# Apply the file organization preset
node scripts/feature-config-helper.js preset file_organization_focus

# Check what's now enabled and total effort
node scripts/feature-config-helper.js enabled

# Enable just the file sorting system
node scripts/feature-config-helper.js enable file_sorting_system

# Disable a feature you don't want
node scripts/feature-config-helper.js disable content_analysis_engine
```

## Next Steps

1. **Choose your approach**:
   - Use a preset for quick selection
   - Or manually enable specific features

2. **Review the selection**:
   - Check enabled features and total effort
   - Ensure dependencies are met

3. **Communicate your choice**:
   - Tell me which features are enabled
   - I'll implement them in priority order

4. **Implementation**:
   - Features will be built incrementally
   - Each feature integrates with existing architecture
   - Regular testing and validation

## Notes

- All features integrate with existing managers (directoryManager, linkManager, etc.)
- Deprecated features are safely stored in `quarantine/` with restoration instructions
- The shortcode system has already been deprecated to reduce complexity
- Features are designed to be modular and can be implemented independently 