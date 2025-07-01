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
    const referencePath = basePath 
      ? PathUtils.joinPath(basePath, 'reference')
      : 'reference';

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
\`\`\`typescript
addRibbonIcon('calendar-days', 'Open Today\\'s Journal', () => {
  this.openTodayJournal();
});
\`\`\`

**Ribbon Best Practices:**
- Use only for most common actions
- Choose clear, recognizable icons
- Provide helpful tooltips
- Don't overcrowd the ribbon
- Consider user's workflow patterns
`;

      await vault.create(filePath, content);
      console.log(`Created integration documentation: ${filePath}`);
    }
  }

  /**
   * Creates troubleshooting lessons learned from development process
   */
  private async createTroubleshootingLessons(referencePath: string): Promise<void> {
    const { vault } = this.plugin.app;
    const filePath = PathUtils.joinPath(referencePath, 'Troubleshooting Lessons.md');

    if (!vault.getAbstractFileByPath(filePath)) {
      const content = `# Troubleshooting Lessons Learned

## Template System Issues

### Problem: Templates Not Syncing
**Symptoms**: Templates created but application can't find them
**Root Cause**: Template directory not properly integrated with base folder structure
**Solution**: Ensure templates are created as siblings to journal, not nested within

### Problem: Templater Conflicts  
**Symptoms**: Templates render incorrectly or cause errors
**Root Cause**: Plugin trying to process Templater syntax instead of leaving it alone
**Solution**: Always return raw template with original syntax - let Templater handle processing

**Key Insight**: **Don't compete with existing plugins - complement them**

## Directory Structure Issues

### Problem: File/Folder Collisions
**Symptoms**: Plugin creates directories that conflict with existing vault structure
**Root Cause**: Creating directories at vault root level
**Solution**: Base folder approach - contain all plugin content within configurable folder

### Problem: Inconsistent Directory Creation
**Symptoms**: Some directories created, others missing
**Root Cause**: Directory creation logic scattered across multiple methods
**Solution**: Centralize directory creation in single method with proper ordering

**Key Insight**: **Defensive programming - always check if directory exists before creating**

## Plugin Integration Issues

### Problem: Daily Notes Plugin Not Updated
**Symptoms**: Daily notes created in wrong location despite plugin folder structure
**Root Cause**: Incorrect API usage - wrong plugin reference path
**Solution**: 
- Core plugins: \`internalPlugins.plugins['plugin-name']\`
- Community plugins: \`plugins.plugins['plugin-name']\`

### Problem: Settings Not Persisting
**Symptoms**: Plugin settings reset after restart
**Root Cause**: Not calling \`saveSettings()\` after changes
**Solution**: Always call \`await this.plugin.saveSettings()\` after setting changes

**Key Insight**: **Obsidian has different APIs for core vs community plugins**

## Error Handling Lessons

### Problem: Silent Failures
**Symptoms**: Features don't work but no error messages
**Root Cause**: Try-catch blocks swallowing errors without logging
**Solution**: Always log errors, show user messages for actionable issues

### Problem: Modal Constructor Errors
**Symptoms**: \`this.plugin.app.Modal is not a constructor\`
**Root Cause**: Incorrect Modal import/usage
**Solution**: Import Modal from 'obsidian' and use \`new Modal(this.app)\`

**Key Insight**: **Make errors visible during development - silent failures waste time**

## Date Handling Lessons

### Problem: Date Format Inconsistencies
**Symptoms**: Files created with wrong date formats or in wrong folders
**Root Cause**: Using different date libraries/formats throughout codebase
**Solution**: Centralized DateService with consistent formatting

### Problem: Month Change Detection
**Symptoms**: Monthly folders not created when month changes
**Root Cause**: No monitoring for date changes
**Solution**: Interval-based monitoring with month comparison

**Key Insight**: **Date handling is complex - centralize it in a service class**

## Settings UI Lessons

### Problem: Settings Not User-Friendly
**Symptoms**: Users confused by settings options
**Root Cause**: Poor organization and lack of descriptions
**Solution**: Group settings logically, provide clear descriptions and examples

### Problem: No Immediate Feedback
**Symptoms**: Users don't know if settings saved or took effect
**Root Cause**: No visual feedback after changes
**Solution**: Show confirmations, update UI immediately after changes

**Key Insight**: **Good UX requires immediate feedback and clear organization**

## Build and Development Lessons

### Problem: Linter Errors After Refactoring
**Symptoms**: TypeScript errors about missing methods/properties
**Root Cause**: Method signatures changed but calls not updated
**Solution**: Use IDE refactoring tools, check all references when changing APIs

### Problem: Inconsistent Code Style
**Symptoms**: Mix of different patterns and conventions
**Root Cause**: Adding features without following established patterns
**Solution**: Document patterns, use consistent code organization

**Key Insight**: **Consistency is more important than perfection**

## Architecture Evolution Lessons

### What We Started With:
- Complex nested directory structures
- Multiple competing template systems
- Scattered error handling
- Plugin conflicts

### What We Learned:
1. **Simplicity wins** - Remove features that don't add clear value
2. **Separation of concerns** - Each directory serves one purpose
3. **Integration over replacement** - Work with existing plugins, don't compete
4. **Defensive programming** - Always handle edge cases and errors
5. **User feedback** - Make the system's behavior visible and understandable

### Final Architecture Principles:
- **Base folder containment** - All plugin content in configurable folder
- **Sibling directory structure** - Templates, journal, reference as equals
- **Graceful coexistence** - Detect and complement other plugins
- **Centralized services** - Date, error handling, settings in dedicated classes
- **Comprehensive documentation** - Document decisions and patterns for future

## Key Realizations

### Template Organization Logic:
**Question**: Should templates be nested inside journal or siblings?
**Answer**: Siblings - templates are **tools to create** content, not content themselves

### Plugin Integration Strategy:
**Question**: Should we override other plugin functionality?
**Answer**: No - detect, complement, provide fallbacks, but never replace

### Error Handling Philosophy:
**Question**: When should users see error messages?
**Answer**: Only for actionable errors - log everything, show only what users can fix

### Directory Structure Logic:
**Question**: How deep should directory nesting go?
**Answer**: Keep it shallow - complex nesting makes organization harder, not easier

## Development Process Insights

### Effective Debugging Approach:
1. **Reproduce the issue** consistently
2. **Isolate the root cause** - don't fix symptoms
3. **Understand the why** - learn from the problem
4. **Fix comprehensively** - address root cause and related issues
5. **Document the lesson** - prevent future similar issues

### Code Review Questions:
- Does this follow established patterns?
- Will this conflict with other plugins?
- Is the error handling comprehensive?
- Are the directory structures logical?
- Is the user experience clear and immediate?

### Architecture Review Questions:
- Does each component have a single responsibility?
- Are dependencies clearly defined and minimal?
- Is the code organized consistently?
- Are edge cases handled gracefully?
- Is the system extensible without breaking changes?

---

**Final Wisdom**: The best architecture emerges from understanding both the technical constraints and the user's mental model. Build systems that make sense to users while being maintainable for developers.
`;

      await vault.create(filePath, content);
      console.log(`Created troubleshooting lessons: ${filePath}`);
    }
  }

  /**
   * Checks if Templater plugin is available and enabled
   * Used only for user feedback, not for template processing
   */
  private isTemplaterAvailable(): boolean {
    // @ts-ignore - Access Obsidian's plugin system
    const templaterPlugin = this.plugin.app.plugins?.plugins?.['templater-obsidian'];
    return templaterPlugin && templaterPlugin._loaded;
  }

  /**
   * Gets a directory path, creating it if it doesn't exist
   * Handles both absolute paths and paths relative to the base folder
   */
  async getOrCreateDirectory(path: string): Promise<TFolder> {
    const { vault } = this.plugin.app;
    const normalizedPath = normalizePath(path);
    const existingFolder = vault.getAbstractFileByPath(normalizedPath);

    if (existingFolder instanceof TFolder) {
      return existingFolder;
    }

    // Create parent directories recursively
    const pathParts = normalizedPath.split('/');
    let currentPath = '';

    for (const part of pathParts) {
      if (!part) continue;

      currentPath += (currentPath ? '/' : '') + part;
      const folder = vault.getAbstractFileByPath(currentPath);

      if (!folder) {
        await vault.createFolder(currentPath);
      } else if (!(folder instanceof TFolder)) {
        throw new Error(`Path ${currentPath} exists but is not a folder`);
      }
    }

    return vault.getAbstractFileByPath(normalizedPath) as TFolder;
  }

  /**
   * Gets the full path for a directory within the plugin's base folder
   */
  getPluginDirectoryPath(relativePath: string): string {
    const { baseFolder } = this.plugin.settings;
    return baseFolder ? PathUtils.joinPath(baseFolder, relativePath) : relativePath;
  }

  /**
   * Gets the journal directory path
   */
  getJournalPath(): string {
    const { baseFolder, journalRootFolder } = this.plugin.settings;
    return baseFolder ? PathUtils.joinPath(baseFolder, journalRootFolder) : journalRootFolder;
  }



  /**
   * Applies a directory template to create structured folders
   */
  async applyDirectoryTemplate(basePath: string, template: DirectoryTemplate): Promise<void> {
    for (const [key, value] of Object.entries(template)) {
      const dirPath = PathUtils.joinPath(basePath, key);
      await this.getOrCreateDirectory(dirPath);

      if (value && typeof value === 'object') {
        await this.applyDirectoryTemplate(dirPath, value);
      }
    }
  }

  /**
   * Validates if a given path is within allowed directories
   */
  isValidPath(path: string): boolean {
    const normalizedPath = normalizePath(path);
    const { restrictedDirectories } = this.plugin.settings;

    if (!restrictedDirectories || restrictedDirectories.length === 0) {
      return true;
    }

    return !restrictedDirectories.some((dir: string) => {
      const normalizedDir = normalizePath(dir);
      return normalizedPath === normalizedDir || normalizedPath.startsWith(normalizedDir + '/');
    });
  }

  /**
   * Lists all directories in the vault
   */
  getAllDirectories(): TFolder[] {
    const { vault } = this.plugin.app;
    return vault.getAllLoadedFiles()
      .filter(file => file instanceof TFolder) as TFolder[];
  }


}