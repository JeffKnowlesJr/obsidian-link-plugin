# Monthly Folder Management - Obsidian Link Plugin

## Overview

The Obsidian Link Plugin now includes **automatic monthly folder management** that creates monthly folders based on the current date and when creating daily notes for future dates. This eliminates the need to manually create month folders.

## Key Features

### 1. **Automatic Current Month Folder Creation**
- Plugin automatically ensures the current month folder exists when it loads
- No manual intervention required for the current month

### 2. **Future Date Support**
- Creating a daily note for a future date automatically creates the required monthly folder
- Supports creating notes weeks or months in advance

### 3. **Intelligent Folder Structure**
- Uses the new base folder structure: `LinkPlugin/journal/y_YYYY/MonthName/`
- Full month names (January, February, etc.) for better readability
- Year prefix with `y_` for consistent sorting

## Folder Structure Created

### Monthly Structure
```
LinkPlugin/
└── journal/
    ├── y_2024/
    │   ├── December/
    │   └── ...
    └── y_2025/
        ├── January/     ← Created automatically when January starts
        ├── February/    ← Created automatically when creating Feb notes
        ├── March/       ← Created when needed
        └── ...
```

### Daily Notes Within Months
```
LinkPlugin/journal/y_2025/January/
├── 2025-01-01 Wednesday.md
├── 2025-01-02 Thursday.md
├── 2025-01-15 Wednesday.md
└── ...
```

## Implementation Details

### Core Methods Added

#### JournalManager Enhancements

```typescript
// Ensures monthly folder exists for any date
async ensureMonthlyFolderExists(date: moment.Moment): Promise<void>

// Gets the correct monthly folder path
private getMonthlyFolderPath(date: moment.Moment): string

// Creates today's note with automatic folder creation
async createTodayNote(): Promise<TFile>

// Creates future daily notes with automatic folder creation
async createFutureDailyNote(date: Date | string): Promise<TFile>

// Checks and creates current month folder (called on plugin load)
async checkAndCreateCurrentMonthFolder(): Promise<void>

// Creates monthly folders for a date range
async createMonthlyFoldersForRange(startDate: moment.Moment, endDate: moment.Moment): Promise<void>
```

### Updated Core Functionality

#### Enhanced Daily Note Creation
```typescript
async createOrOpenJournalEntry(date: moment.Moment): Promise<TFile> {
  // 1. Automatically create monthly folder for the date
  await this.ensureMonthlyFolderExists(date);
  
  // 2. Generate file path using new structure
  const monthlyFolderPath = this.getMonthlyFolderPath(date);
  const fileName = date.format('YYYY-MM-DD dddd');
  const filePath = `${monthlyFolderPath}/${fileName}.md`;
  
  // 3. Create or open the daily note
  // ...
}
```

#### Plugin Initialization
```typescript
async onload() {
  // ... existing initialization
  
  // Ensure current month folder exists when plugin loads
  await this.journalManager.checkAndCreateCurrentMonthFolder();
}
```

## New Commands Available

### 1. **Create Today's Daily Note**
- **Command ID**: `create-today-note`
- **Name**: "Create Today's Daily Note"
- **Function**: Creates today's daily note and opens it
- **Auto-creates**: Current month folder if needed

### 2. **Create Monthly Folders for Current Year**
- **Command ID**: `create-monthly-folders`
- **Name**: "Create Monthly Folders for Current Year"
- **Function**: Pre-creates all 12 monthly folders for the current year
- **Useful for**: Setting up the year structure in advance

## Usage Examples

### Automatic Behavior

#### When Plugin Loads (January 1st, 2025)
```
✅ Plugin detects current date: January 1st, 2025
✅ Automatically creates: LinkPlugin/journal/y_2025/January/
✅ Ready for daily note creation
```

#### Creating Today's Note
```
User: Runs "Create Today's Daily Note" command
✅ Creates: LinkPlugin/journal/y_2025/January/2025-01-01 Wednesday.md
✅ Opens the note for editing
```

#### Creating Future Note (March 15th from January)
```
User: Creates note for March 15th, 2025
✅ Automatically creates: LinkPlugin/journal/y_2025/March/
✅ Creates: LinkPlugin/journal/y_2025/March/2025-03-15 Saturday.md
```

### Manual Commands

#### Pre-create All Monthly Folders
```
User: Runs "Create Monthly Folders for Current Year"
✅ Creates all folders: y_2025/January/ through y_2025/December/
✅ Shows success notification
```

## Benefits

### 1. **Zero Manual Folder Management**
- No need to manually create month folders
- Works seamlessly with any date
- Handles year transitions automatically

### 2. **Future-Proof**
- Creating notes for any future date works immediately
- Supports planning weeks or months ahead
- No breaking when switching between months

### 3. **Consistent Structure**
- All monthly folders follow the same naming pattern
- Integrates perfectly with the base folder approach
- Maintains clean organization

### 4. **User-Friendly**
- Full month names are more readable than numbers
- Year prefix ensures proper sorting
- Clear folder hierarchy

## Configuration

### Current Settings
- **Base Folder**: `LinkPlugin` (configurable)
- **Journal Root**: `journal` (configurable)
- **Date Format**: `YYYY-MM-DD dddd` (configurable)
- **Monthly Structure**: `y_YYYY/MMMM` (automatic)

### Future Configuration Options
- Toggle between month numbers vs. month names
- Custom monthly folder naming patterns
- Option to disable automatic folder creation
- Batch folder creation for multiple years

## Integration with Existing Features

### Works With
- ✅ Base folder system (all folders created under `LinkPlugin/`)
- ✅ Daily note templates
- ✅ Journal linking system
- ✅ Directory rebuild functionality

### Enhanced Features
- **Directory Manager**: Now handles monthly folder creation
- **Date Utils**: Updated with monthly folder path utilities
- **Error Handling**: Includes success notifications for folder creation

## Testing Status

### ✅ Implemented and Working
- Monthly folder path generation
- Automatic folder creation on date-based operations
- Plugin initialization with current month check
- Command registration for manual operations
- Integration with existing daily note functionality

### 🔄 Development Status
- Development server: ✅ Working
- Monthly folder feature: ✅ Functional
- No new TypeScript errors introduced
- Existing moment.js errors remain (unrelated to monthly folders)

## Example Workflow

### Daily Usage
1. **Plugin starts** → Current month folder automatically created
2. **User creates daily note** → Note created in correct monthly folder
3. **User creates future note** → Future month folder automatically created
4. **Month changes** → New month folder automatically created when needed

### Planning Ahead
1. **User plans quarterly review** → Creates note for March 31st in January
2. **Plugin automatically creates** → `y_2025/March/` folder
3. **User creates multiple future notes** → All placed in correct monthly folders
4. **No manual folder management** → Everything happens automatically

## Conclusion

The monthly folder management feature provides **seamless, automatic organization** for daily notes while maintaining the clean base folder structure. Users can focus on content creation while the plugin handles all the folder organization automatically.

**Key Achievement**: Eliminated manual monthly folder management while supporting both current and future date planning. 