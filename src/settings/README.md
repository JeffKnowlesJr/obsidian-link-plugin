# Settings Module

This directory contains the modularized settings system for the Obsidian Link Plugin.

## Structure

### Core Files
- **`index.ts`** - Main exports for the settings module
- **`defaultSettings.ts`** - Combines all default settings
- **`settingsValidator.ts`** - Main validation logic

### Setting Categories
- **`directorySettings.ts`** - Directory structure and base folder settings
- **`journalSettings.ts`** - Journal date formats and templates
- **`noteSettings.ts`** - Note creation and template settings
- **`shortcodeSettings.ts`** - Shortcode system configuration
- **`generalSettings.ts`** - Debug mode and other general settings

## Usage

### Basic Usage
```typescript
import { DEFAULT_SETTINGS, validateSettings } from '../settings';

// Use default settings
const settings = DEFAULT_SETTINGS;

// Validate user settings
const validatedSettings = validateSettings(userSettings);
```

### Advanced Usage
```typescript
import { 
  DirectorySettings, 
  JournalSettings,
  validateSettingsWithDetails 
} from '../settings';

// Get specific category defaults
const directoryDefaults = DirectorySettings.getDefaults();

// Validate with detailed feedback
const result = validateSettingsWithDetails(userSettings);
if (!result.isValid) {
  console.log('Errors:', result.errors);
  console.log('Warnings:', result.warnings);
}
```

### Individual Category Validation
```typescript
import { ShortcodeSettings } from '../settings';

// Validate shortcode pattern
const isValid = ShortcodeSettings.isValidShortcodePattern('h2+ul>li*3');

// Get builtin shortcodes
const builtins = ShortcodeSettings.getBuiltinShortcodes();
```

## Benefits

1. **Separation of Concerns** - Each category has its own validation logic
2. **Type Safety** - Individual interfaces for each setting category
3. **Maintainability** - Easy to add new settings or modify existing ones
4. **Testing** - Each module can be tested independently
5. **Documentation** - Clear structure makes the codebase more understandable

## Adding New Settings

### 1. Add to Interface
Update the appropriate interface in `types.ts` or create a new category interface.

### 2. Update Category Module
Add the setting to the appropriate category module (e.g., `directorySettings.ts`).

### 3. Add Validation
Implement validation logic in the category's `validate()` method.

### 4. Update Defaults
Add the default value to the category's `getDefaults()` method.

The main `validateSettings()` function will automatically include the new setting. 