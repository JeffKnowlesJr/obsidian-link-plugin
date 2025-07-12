import { TFolder, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
import { 
  DEFAULT_DIRECTORIES, 
  DEFAULT_JOURNAL_STRUCTURE,
  DEFAULT_TEMPLATES_PATH,
  DAILY_NOTES_TEMPLATE_NAME
} from '../constants';
import { PathUtils } from '../utils/pathUtils';
import { DirectoryTemplate } from '../types';
import { DateService } from '../services/dateService';

export class DirectoryManager {
  plugin: LinkPlugin;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Creates the base directory structure according to settings
   * All directories are created under the configured baseFolder to prevent collisions
   */
  async rebuildDirectoryStructure(): Promise<void> {
    const { vault } = this.plugin.app;
    const { baseFolder, directoryStructure } = this.plugin.settings;

    try {
      // Create the base folder first (if not root)
      const basePath = baseFolder ? normalizePath(baseFolder) : '';
      if (basePath) {
        await this.getOrCreateDirectory(basePath);
        console.log(`Created base directory: ${basePath}`);
      } else {
        console.log('Using vault root as base directory');
      }

          // Create basic directory structure
    for (const dirName of directoryStructure || DEFAULT_DIRECTORIES) {
      const dirPath = basePath ? PathUtils.joinPath(basePath, dirName) : dirName;
      await this.getOrCreateDirectory(dirPath);
      console.log(`Created directory: ${dirPath}`);
    }

    // Create journal structure (only journal folder needed)
    await this.createJournalStructure(basePath);

    // Create reference knowledge base
    await this.createReferenceStructure(basePath);

    } catch (error) {
      throw new Error(`Failed to rebuild directory structure: ${error}`);
    }
  }

  /**
   * Creates journal structure - simple or dynamic based on single setting
   */
  async createJournalStructure(basePath: string): Promise<void> {
    const journalPath = PathUtils.joinPath(basePath, 'journal');
    
    // Always create the basic journal directory
    await this.getOrCreateDirectory(journalPath);
    console.log(`Created journal directory: ${journalPath}`);
    
    // Only create complex structure if simple mode is disabled
    if (!this.plugin.settings.simpleJournalMode) {
      // Create CURRENT YEAR/MONTH structure using proper format
      const currentDate = DateService.now();
      const currentYear = DateService.format(currentDate, 'YYYY');
      const currentMonth = DateService.format(currentDate, 'MM-MMMM');
      
      // Create current year/month folder
      const currentYearPath = PathUtils.joinPath(journalPath, currentYear);
      const currentMonthPath = PathUtils.joinPath(currentYearPath, currentMonth);
      
      await this.getOrCreateDirectory(currentYearPath);
      await this.getOrCreateDirectory(currentMonthPath);
      
      console.log(`Created current month directory: ${currentMonthPath}`);
      
      console.log('Current month journal structure created');
    }
  }

  /**
   * Creates templates directory and copies the daily notes template when enabled
   * Templates are siblings to journal structure for proper organization
   */
  async setupTemplates(): Promise<void> {
    try {
      const { baseFolder } = this.plugin.settings;
      const templatesPath = baseFolder 
        ? PathUtils.joinPath(baseFolder, DEFAULT_TEMPLATES_PATH)
        : DEFAULT_TEMPLATES_PATH;

      // Create templates directory as sibling to journal
      await this.getOrCreateDirectory(templatesPath);
      console.log(`Created templates directory: ${templatesPath}`);

      // Copy daily notes template if it doesn't exist
      const templateFilePath = PathUtils.joinPath(templatesPath, DAILY_NOTES_TEMPLATE_NAME);
      const { vault } = this.plugin.app;
      
      if (!vault.getAbstractFileByPath(templateFilePath)) {
        const templateContent = await this.getDailyNotesTemplateContent();
        await vault.create(templateFilePath, templateContent);
        console.log(`Created template file: ${templateFilePath}`);
      } else {
        console.log(`Template already exists: ${templateFilePath}`);
      }
    } catch (error) {
      throw new Error(`Failed to setup templates: ${error}`);
    }
  }

  /**
   * Gets the daily notes template content from the plugin assets
   * Always returns the raw template with Templater syntax to avoid conflicts
   */
  private async getDailyNotesTemplateContent(): Promise<string> {
    // Always return raw template with Templater syntax
    // Let Templater handle its own templating - don't interfere
    return `---
previous: '[[<% tp.date.now("YYYY-MM-DD dddd", -1) %>]]'
next: '[[<% tp.date.now("YYYY-MM-DD dddd", 1) %>]]'
tags:
  - ☀️
resources: []
stakeholders:
---
---
## Log

### Routine Checklist

- [ ] Open Daily Note
- [ ] **Daily Checks**
	- [ ] Bed and Clothes 🛏️🧺
		- [ ] Self Care🛀🧴
	- [ ] Clean Kitchen
		- [ ] Make Breakfast 🍽✨
	- [ ] Pet Care 🐕🚶🏻‍♂️
		- [ ] Wear Watch ⌚️
	- [ ] Get Focused 🖥️💊
		- [ ] Put [Calendar](https://calendar.google.com) 📆
	- [ ] Check [Mail](https://mail.google.com) ✉️ 
		- [ ] Reviews [[Yearly List]] ✅
	- [ ] Review [July Log](Yearly%20Log.md#July) 🗓️

---`;
  }

  /**
   * Creates reference directory structure and knowledge base documentation
   */
  async createReferenceStructure(basePath: string): Promise<void> {
    // Create reference/linkplugin subfolder for all reference files
    const referencePath = basePath 
      ? PathUtils.joinPath(basePath, 'reference', 'linkplugin')
      : 'reference/linkplugin';

    // Create main reference directory
    await this.getOrCreateDirectory(referencePath);
    console.log(`Created reference directory: ${referencePath}`);

    // Create architecture documentation
    await this.createArchitectureDocumentation(referencePath);
    
    // Create patterns documentation  
    await this.createPatternsDocumentation(referencePath);
    
    // Create integration guides
    await this.createIntegrationDocumentation(referencePath);
    
    // Create troubleshooting lessons
    await this.createTroubleshootingLessons(referencePath);

    console.log('Reference knowledge base created');
  }

  /**
   * Creates architecture documentation explaining key design decisions
   */
  private async createArchitectureDocumentation(referencePath: string): Promise<void> {
    const { vault } = this.plugin.app;
    const filePath = PathUtils.joinPath(referencePath, 'Architecture Decisions.md');

    if (!vault.getAbstractFileByPath(filePath)) {
      const content = `# Architecture Decisions

## Directory Structure Logic

### Core Principle: Siblings vs Nested
**Decision**: Templates, Journal, and Reference are siblings under Link/
**Reasoning**: 
- Templates are **tools to create** content, not content themselves
- Each serves different purposes and should be logically separated
- Prevents deep nesting that makes navigation difficult
- Follows standard file organization principles

### Structure:
\`\`\`
Link/
├── journal/           # Time-based content
│   └── YYYY/MM-Month/ # Organized by date
├── templates/         # Content creation tools
│   └── *.md          # Template files
└── reference/         # Knowledge base & documentation
    └── *.md          # Reference materials
\`\`\`

## Collision Avoidance Strategy

### Problem
Plugin needs to create directories without conflicting with existing vault structure.

### Solution: Base Folder Approach
- All plugin content contained within configurable base folder (default: "Link")
- User can change base folder to avoid conflicts
- Plugin never creates directories at vault root level

### Benefits
- ✅ No conflicts with existing user structure
- ✅ Easy to relocate entire plugin structure
- ✅ Clear separation of plugin vs user content
- ✅ Easy to backup/sync plugin content separately

## Template System Design

### Problem
Need to provide templates without interfering with existing template systems (Templater).

### Solution: Coexistence Pattern
1. **No Interference**: Always provide raw template with original syntax
2. **Detection Only**: Check for Templater presence for user feedback only
3. **No Overrides**: Never replace or modify Templater functionality
4. **Standard Location**: Place templates in predictable, discoverable location

### Benefits  
- ✅ Works with or without Templater
- ✅ No plugin conflicts
- ✅ User can modify templates freely
- ✅ Templater handles its own syntax processing

## Error Handling Philosophy

### Principle: Graceful Degradation
- Plugin should work even if some features fail
- Non-critical features fail silently with logging
- Critical features show user-friendly error messages
- Always provide fallback functionality

### Implementation
- Try-catch blocks around all major operations
- Detailed logging for debugging
- User notifications for actionable errors only
- Fallback behaviors when integrations fail
`;

      await vault.create(filePath, content);
      console.log(`Created architecture documentation: ${filePath}`);
    }
  }

  /**
   * Creates patterns documentation for common plugin development patterns
   */
  private async createPatternsDocumentation(referencePath: string): Promise<void> {
    const { vault } = this.plugin.app;
    const filePath = PathUtils.joinPath(referencePath, 'Development Patterns.md');

    if (!vault.getAbstractFileByPath(filePath)) {
      const content = `# Development Patterns

## Directory Management Pattern

### Pattern: Defensive Directory Creation
\`\`\`typescript
async getOrCreateDirectory(path: string): Promise<TFolder> {
  const existingFolder = vault.getAbstractFileByPath(path);
  if (existingFolder instanceof TFolder) {
    return existingFolder; // Already exists
  }
  
  // Create parent directories recursively
  const pathParts = path.split('/');
  for (const part of pathParts) {
    // Incremental path building and validation
  }
  
  return vault.getAbstractFileByPath(path) as TFolder;
}
\`\`\`

**Why This Works:**
- Handles existing directories gracefully
- Creates parent directories as needed
- Validates each step of path creation
- Returns consistent TFolder interface

## Settings Management Pattern

### Pattern: Layered Configuration
1. **Default Settings**: Hard-coded fallbacks
2. **User Settings**: Persisted overrides  
3. **Runtime Settings**: Temporary modifications

### Implementation Strategy
\`\`\`typescript
class SettingsManager {
  defaults = DEFAULT_SETTINGS;
  user = loadUserSettings();
  
  get(key: string) {
    return this.user[key] ?? this.defaults[key];
  }
}
\`\`\`

**Benefits:**
- Always has working configuration
- User can override any setting
- Runtime changes don't affect persistence
- Easy to reset to defaults

## Plugin Integration Pattern

### Pattern: Detection and Graceful Coexistence

**Problem**: Need to work with other plugins without conflicts

**Solution**: 
1. **Detect**: Check if other plugin exists and is enabled
2. **Respect**: Don't override other plugin functionality
3. **Complement**: Provide value alongside, not instead of
4. **Fallback**: Work independently if other plugin not available

### Example: Templater Integration
\`\`\`typescript
private isTemplaterAvailable(): boolean {
  const templaterPlugin = this.app.plugins?.plugins?.['templater-obsidian'];
  return templaterPlugin && templaterPlugin._loaded;
}

private getTemplateContent(): string {
  // Always return raw template - let Templater handle processing
  return rawTemplateWithTemplaterSyntax;
}
\`\`\`

**Key Principles:**
- ✅ Check availability for user feedback only
- ✅ Never modify other plugin's functionality  
- ✅ Provide complementary, not competing features
- ✅ Maintain functionality without dependencies

## Error Boundaries Pattern

### Pattern: Contextual Error Handling
\`\`\`typescript
class ErrorHandler {
  handleError(error: Error, context: string, userFacing = false) {
    console.error(\`[\${context}]\`, error);
    
    if (userFacing) {
      this.showNotice(\`\${context}: \${error.message}\`);
    }
    
    // Log to file for debugging
    this.logError(context, error);
  }
}
\`\`\`

**Benefits:**
- Contextual information for debugging
- User sees only actionable errors
- Complete error history preserved
- Consistent error handling across plugin

## Date Service Pattern

### Pattern: Centralized Date Logic
Instead of using Date() directly throughout codebase:

\`\`\`typescript
class DateService {
  static now() { return moment(); }
  static format(date, format) { return moment(date).format(format); }
  static add(date, amount, unit) { return moment(date).add(amount, unit); }
}
\`\`\`

**Benefits:**
- Consistent date handling
- Easy to mock for testing
- Single place to change date library
- Handles timezone/locale consistently

## Command Registration Pattern

### Pattern: Centralized Command Management
\`\`\`typescript
registerCommands() {
  const commands = [
    { id: 'create-note', name: 'Create Note', handler: this.createNote },
    { id: 'open-journal', name: 'Open Journal', handler: this.openJournal }
  ];
  
  commands.forEach(cmd => this.addCommand(cmd));
}
\`\`\`

**Benefits:**
- Easy to see all available commands
- Consistent command structure
- Easy to add/remove commands
- Centralized command logic
`;

      await vault.create(filePath, content);
      console.log(`Created patterns documentation: ${filePath}`);
    }
  }

  /**
   * Creates integration documentation for working with Obsidian ecosystem
   */
  private async createIntegrationDocumentation(referencePath: string): Promise<void> {
    const { vault } = this.plugin.app;
    const filePath = PathUtils.joinPath(referencePath, 'Integration Guide.md');

    if (!vault.getAbstractFileByPath(filePath)) {
      const content = `# Integration Guide

## Working with Obsidian Ecosystem

### Core Principle: Be a Good Citizen
- Complement existing functionality, don't replace it
- Follow Obsidian's conventions and patterns
- Integrate with popular community plugins
- Provide value without causing conflicts

## Daily Notes Integration

### Challenge
Update Obsidian's Daily Notes plugin to use our folder structure.

### Solution: Settings Synchronization
\`\`\`typescript
async updateDailyNotesSettings(): Promise<void> {
  // Try core plugin first
  const corePlugin = this.app.internalPlugins?.plugins?.['daily-notes'];
  if (corePlugin?.enabled) {
    corePlugin.instance.options.folder = ourFolderPath;
    return;
  }
  
  // Fallback to community plugin
  const communityPlugin = this.app.plugins?.plugins?.['daily-notes'];
  if (communityPlugin) {
    communityPlugin.settings.folder = ourFolderPath;
    await communityPlugin.saveSettings();
  }
}
\`\`\`

**Key Insights:**
- Core plugins accessed via \`internalPlugins\`
- Community plugins via \`plugins.plugins\`
- Always check if plugin exists and is enabled
- Settings structures may differ between core/community versions

## Templater Integration

### Challenge
Provide templates without breaking Templater functionality.

### Solution: Raw Template Strategy
1. **Always provide raw template** with Templater syntax
2. **Never process Templater syntax** ourselves
3. **Let Templater handle its own processing**
4. **Detect Templater only for user feedback**

### Anti-Pattern (Don't Do This)
\`\`\`typescript
// ❌ BAD: Processing Templater syntax ourselves
if (this.isTemplaterAvailable()) {
  return rawTemplate;
} else {
  return this.processTemplaterSyntax(rawTemplate); // DON'T DO THIS
}
\`\`\`

### Correct Pattern
\`\`\`typescript  
// ✅ GOOD: Always return raw template
private getTemplateContent(): string {
  return rawTemplateWithTemplaterSyntax; // Let Templater handle it
}
\`\`\`

**Why This Works:**
- No conflicts with Templater processing
- Template works with or without Templater
- User can modify template syntax freely
- Templater maintains full control of its features

## File System Integration

### Challenge
Create files and folders without conflicts.

### Solution: Vault API + Path Normalization
\`\`\`typescript
// Always normalize paths
const normalizedPath = normalizePath(userPath);

// Check if exists before creating
const existing = vault.getAbstractFileByPath(normalizedPath);
if (!existing) {
  await vault.create(normalizedPath, content);
}

// Handle both files and folders
if (existing instanceof TFolder) {
  // It's a folder
} else if (existing instanceof TFile) {
  // It's a file
}
\`\`\`

**Best Practices:**
- Always use \`normalizePath()\` for cross-platform compatibility
- Check existence before creating
- Use appropriate Vault API methods
- Handle edge cases (file vs folder conflicts)

## Settings Integration

### Challenge
Provide settings UI that integrates with Obsidian's settings.

### Solution: PluginSettingTab Extension
\`\`\`typescript
export class SettingsTab extends PluginSettingTab {
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    // Group related settings
    this.addGeneralSettings(containerEl);
    this.addJournalSettings(containerEl);
    this.addAdvancedSettings(containerEl);
  }
  
  private addGeneralSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: 'General Settings' });
    
    new Setting(containerEl)
      .setName('Setting Name')
      .setDesc('Clear description of what this does')
      .addText(text => text
        .setValue(this.plugin.settings.value)
        .onChange(async (value) => {
          this.plugin.settings.value = value;
          await this.plugin.saveSettings();
        }));
  }
}
\`\`\`

**UI Best Practices:**
- Group related settings with headers
- Provide clear names and descriptions
- Auto-save changes immediately
- Use appropriate input types
- Provide validation feedback

## Command Palette Integration

### Challenge
Make plugin features discoverable and accessible.

### Solution: Comprehensive Command Registration
\`\`\`typescript
registerCommands() {
  this.addCommand({
    id: 'action-id',
    name: 'User-Friendly Action Name',
    icon: 'calendar', // Lucide icon name
    callback: () => this.performAction(),
    hotkeys: [{ modifiers: ['Mod'], key: 'j' }] // Optional
  });
}
\`\`\`

**Command Design Principles:**
- Use clear, action-oriented names
- Provide appropriate icons
- Consider default hotkeys for common actions
- Group related commands with similar naming
- Make commands context-aware when possible

## Ribbon Integration

### Challenge
Provide quick access to common features.

### Solution: Contextual Ribbon Buttons
\`\`\`