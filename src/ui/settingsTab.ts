import { App, PluginSettingTab, Setting, TextComponent, DropdownComponent } from 'obsidian';
import LinkPlugin from '../main';
import { 
  DirectorySettings, 
  JournalSettings, 
  NoteSettings, 
  // ShortcodeSettings, // Deprecated - moved to quarantine
  GeneralSettings,
  validateSettingsWithDetails 
} from '../settings';
import { DateService } from '../services/dateService';

export class SettingsTab extends PluginSettingTab {
  plugin: LinkPlugin;
  
  constructor(app: App, plugin: LinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    
    // Main heading
    containerEl.createEl('h1', { text: 'Link Plugin Settings' });
    
    // Add description
    const description = containerEl.createEl('p');
    description.innerHTML = `
      Essential settings for the Link Plugin. <strong>Quality over quantity</strong> - only the most important options are shown.
    `;
    description.style.marginBottom = '2em';
    description.style.color = 'var(--text-muted)';

    // Core Settings - minimized and focused
    this.addCoreSettings(containerEl);
    
    // Journal Settings - simplified
    this.addSimplifiedJournalSettings(containerEl);
    
    // File Sorting Settings - new
    this.addFileSortingSettings(containerEl);
  }

  private addCoreSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '🏠 Core Settings' });
    
    // Base Folder Setting - most important
    new Setting(containerEl)
      .setName('Base Folder')
      .setDesc('Root folder for all plugin files (prevents vault collision)')
      .addText(text => text
        .setPlaceholder('LinkPlugin')
        .setValue(this.plugin.settings.baseFolder)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.baseFolder = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Open New Note Setting - clarified
    new Setting(containerEl)
      .setName('Open new notes in split pane')
      .setDesc('When creating linked notes from selected text, open them in a new pane instead of the current one')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openNewNote)
        .onChange(async (value) => {
          this.plugin.settings.openNewNote = value;
          await this.plugin.saveSettings();
        }));

    // Rebuild Directory Structure Button - moved to bottom and styled as warning
    new Setting(containerEl)
      .setName('⚠️ Rebuild Structure')
      .setDesc('Recreate folder structure with current settings. Use only if folders are missing or corrupted.')
      .addButton(button => {
        button.setButtonText('Rebuild')
          .setWarning()
          .onClick(async () => {
            try {
              await this.plugin.directoryManager.rebuildDirectoryStructure();
              this.showSuccessMessage(button.buttonEl, 'Structure rebuilt!');
            } catch (error) {
              this.plugin.errorHandler.handleError(error, 'Failed to rebuild structure');
            }
          });
        // Style the button as red/warning
        button.buttonEl.style.backgroundColor = 'var(--color-red)';
        button.buttonEl.style.color = 'white';
        return button;
      });
  }

  private addJournalSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📅 Journal Settings' });
    
    const journalDesc = containerEl.createEl('p');
    journalDesc.textContent = 'Configure date formats and templates for journal entries.';
    journalDesc.style.color = 'var(--text-muted)';
    journalDesc.style.marginBottom = '1em';

    // Journal Date Format Setting
    new Setting(containerEl)
      .setName('Journal Date Format')
      .setDesc('Format for journal entry filenames. Uses moment.js format tokens (e.g., YYYY-MM-DD dddd).')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD dddd')
        .setValue(this.plugin.settings.journalDateFormat)
        .onChange(async (value) => {
          if (value.trim()) {
            // Validate format
            if (JournalSettings.isValidDateFormat(value)) {
              this.plugin.settings.journalDateFormat = value.trim();
              await this.plugin.saveSettings();
              this.showValidationMessage(text.inputEl, '✅ Valid format', 'success');
            } else {
              this.showValidationMessage(text.inputEl, '❌ Invalid date format', 'error');
            }
          }
        }));

    // Journal Folder Format Setting
    new Setting(containerEl)
      .setName('Journal Folder Format')
      .setDesc('Format for organizing journal folders by date.')
      .addText(text => text
        .setPlaceholder('YYYY/MM')
        .setValue(this.plugin.settings.journalFolderFormat)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.journalFolderFormat = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Journal Template Setting
    new Setting(containerEl)
      .setName('Journal Template')
      .setDesc('Template for new journal entries. Use {{date}}, {{title}}, {{previous}}, {{next}} as placeholders.')
      .addTextArea(text => {
        text.inputEl.rows = 8;
        text.inputEl.style.width = '100%';
        text.inputEl.style.minHeight = '150px';
        text.setPlaceholder(`# {{date}}

## Daily Log

## Tasks
- [ ] 

## Notes

## Reflection

---
Previous: {{previous}}
Next: {{next}}`);
        text.setValue(this.plugin.settings.journalTemplate);
        text.onChange(async (value) => {
          this.plugin.settings.journalTemplate = value;
          await this.plugin.saveSettings();
        });
        return text;
      });

    // Create Monthly Folders Button
    new Setting(containerEl)
      .setName('Create Monthly Folders')
      .setDesc('Pre-create monthly folders for the current year.')
      .addButton(button => button
        .setButtonText('Create Folders')
        .setTooltip('Create all monthly folders for the current year')
        .onClick(async () => {
          try {
            const startOfYear = DateService.startOfYear();
            const endOfYear = DateService.endOfYear();
            await this.plugin.journalManager.createMonthlyFoldersForRange(startOfYear, endOfYear);
            
            const notice = document.createElement('div');
            notice.textContent = '✅ Monthly folders created successfully!';
            notice.style.color = 'var(--text-success)';
            notice.style.fontWeight = 'bold';
            button.buttonEl.parentElement?.appendChild(notice);
            setTimeout(() => notice.remove(), 3000);
          } catch (error) {
            this.plugin.errorHandler.handleError(error, 'Failed to create monthly folders');
          }
        }));
  }

  private addSimplifiedJournalSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📅 Journal Settings' });
    
    // Simple Journal Mode Toggle
    new Setting(containerEl)
      .setName('Simple Journal Mode')
      .setDesc('Use simple folder structure (all notes in journal folder)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.simpleJournalMode)
        .onChange(async (value) => {
          this.plugin.settings.simpleJournalMode = value;
          this.plugin.settings.enableDynamicFolders = !value;
          await this.plugin.saveSettings();
        }));

    // Journal Date Format - simplified
    new Setting(containerEl)
      .setName('Date Format')
      .setDesc('Format for journal filenames (YYYY-MM-DD recommended)')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD')
        .setValue(this.plugin.settings.journalDateFormat)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.journalDateFormat = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Note: Removed "Today's Journal" button as requested - use ribbon button instead
  }

  private addFileSortingSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📂 File Sorting' });
    
    // Auto Sorting Toggle - clarified
    new Setting(containerEl)
      .setName('Auto Sort Files')
      .setDesc('Automatically sort images, videos, PDFs, and audio files to reference/files/ folders. Markdown files sorted by frontmatter type/category.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.fileSorting.enableAutoSorting)
        .onChange(async (value) => {
          this.plugin.settings.fileSorting.enableAutoSorting = value;
          await this.plugin.saveSettings();
        }));

    // Sort on File Create - clarified with link example
    new Setting(containerEl)
      .setName('Sort on Create')
      .setDesc('Sort files immediately when created. Creates directory-relative links like [[/reference/files/image]] for cross-folder linking.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.fileSorting.sortOnFileCreate)
        .onChange(async (value) => {
          this.plugin.settings.fileSorting.sortOnFileCreate = value;
          await this.plugin.saveSettings();
        }));

    // Bulk Sort Button
    new Setting(containerEl)
      .setName('Sort All Files')
      .setDesc('Sort all existing files in vault (preview mode)')
      .addButton(button => button
        .setButtonText('Preview Sort')
        .onClick(async () => {
          try {
            // Create file sorting manager if it doesn't exist
            if (!this.plugin.fileSortingManager) {
              const { FileSortingManager } = await import('../managers/fileSortingManager');
              this.plugin.fileSortingManager = new FileSortingManager(
                this.plugin.app.vault,
                this.plugin.app.metadataCache,
                this.plugin.settings,
                this.plugin.directoryManager
              );
            }
            
            const result = await this.plugin.fileSortingManager.bulkSort(true); // dry run
            this.showSuccessMessage(button.buttonEl, `Preview: ${result.moved} files would be moved`);
          } catch (error) {
            this.plugin.errorHandler.handleError(error, 'Failed to preview sort');
          }
        }));
  }

  private addNoteSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📝 Note Creation' });
    
    const noteDesc = containerEl.createEl('p');
    noteDesc.textContent = 'Configure templates and behavior for new note creation.';
    noteDesc.style.color = 'var(--text-muted)';
    noteDesc.style.marginBottom = '1em';

    // Note Template Setting
    new Setting(containerEl)
      .setName('Note Template')
      .setDesc('Default template for new notes. Use {{title}}, {{date}}, {{source}} as placeholders.')
      .addTextArea(text => {
        text.inputEl.rows = 6;
        text.inputEl.style.width = '100%';
        text.inputEl.style.minHeight = '120px';
        text.setPlaceholder(`---
title: {{title}}
created: {{date}}
source: {{source}}
tags: []
---

# {{title}}

`);
        text.setValue(this.plugin.settings.noteTemplate);
        text.onChange(async (value) => {
          // Validate template
          const validation = NoteSettings.validateTemplate(value);
          if (validation.isValid) {
            this.plugin.settings.noteTemplate = value;
            await this.plugin.saveSettings();
            this.showValidationMessage(text.inputEl, '✅ Valid template', 'success');
          } else {
            this.showValidationMessage(text.inputEl, `❌ ${validation.errors.join(', ')}`, 'error');
          }
        });
        return text;
      });

    // Open New Note Setting
    new Setting(containerEl)
      .setName('Open New Notes')
      .setDesc('Automatically open newly created notes in the editor.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.openNewNote)
        .onChange(async (value) => {
          this.plugin.settings.openNewNote = value;
          await this.plugin.saveSettings();
        }));
  }

  // DEPRECATED: Shortcode functionality moved to quarantine
  // private addShortcodeSettings(containerEl: HTMLElement): void {
  //   containerEl.createEl('h2', { text: '⚡ Shortcodes' });
  //   
  //   const shortcodeDesc = containerEl.createEl('p');
  //   shortcodeDesc.innerHTML = `
  //     Configure the shortcode system for rapid content creation. 
  //     <br><small>Example: <code>h2+ul>li*3</code> creates a heading with a 3-item list.</small>
  //   `;
  //   shortcodeDesc.style.color = 'var(--text-muted)';
  //   shortcodeDesc.style.marginBottom = '1em';
  // }

  private addGeneralSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '⚙️ General Settings' });
    
    const generalDesc = containerEl.createEl('p');
    generalDesc.textContent = 'General plugin configuration and debugging options.';
    generalDesc.style.color = 'var(--text-muted)';
    generalDesc.style.marginBottom = '1em';

    // Debug Mode Setting
    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable detailed logging for troubleshooting. Check the developer console for debug messages.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
          
          if (value) {
            console.log('[LinkPlugin] Debug mode enabled');
            console.log('[LinkPlugin] Current settings:', this.plugin.settings);
            console.log('[LinkPlugin] DateService info:', DateService.getDebugInfo());
          }
        }));
  }

  private addAdvancedSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '🔧 Advanced' });
    
    const advancedDesc = containerEl.createEl('p');
    advancedDesc.textContent = 'Advanced settings and maintenance tools.';
    advancedDesc.style.color = 'var(--text-muted)';
    advancedDesc.style.marginBottom = '1em';

    // Validate Settings Button
    new Setting(containerEl)
      .setName('Validate Settings')
      .setDesc('Check current settings for any issues or conflicts.')
      .addButton(button => button
        .setButtonText('Validate')
        .onClick(() => {
          const validation = validateSettingsWithDetails(this.plugin.settings);
          
          const resultEl = document.createElement('div');
          resultEl.style.marginTop = '10px';
          resultEl.style.padding = '10px';
          resultEl.style.borderRadius = '4px';
          resultEl.style.border = '1px solid var(--background-modifier-border)';
          
          if (validation.isValid) {
            resultEl.style.backgroundColor = 'var(--background-modifier-success)';
            resultEl.innerHTML = '<strong>✅ All settings are valid!</strong>';
          } else {
            resultEl.style.backgroundColor = 'var(--background-modifier-error)';
            let content = '<strong>❌ Settings validation failed:</strong><ul>';
            validation.errors.forEach(error => {
              content += `<li>${error}</li>`;
            });
            content += '</ul>';
            
            if (validation.warnings.length > 0) {
              content += '<strong>⚠️ Warnings:</strong><ul>';
              validation.warnings.forEach(warning => {
                content += `<li>${warning}</li>`;
              });
              content += '</ul>';
            }
            resultEl.innerHTML = content;
          }
          
          // Remove any existing validation results
          const existing = button.buttonEl.parentElement?.querySelector('.validation-result');
          if (existing) existing.remove();
          
          resultEl.classList.add('validation-result');
          button.buttonEl.parentElement?.appendChild(resultEl);
          
          setTimeout(() => resultEl.remove(), 10000);
        }));

    // Reset Settings Button
    new Setting(containerEl)
      .setName('Reset to Defaults')
      .setDesc('⚠️ Reset all settings to their default values. This cannot be undone.')
      .addButton(button => button
        .setButtonText('Reset')
        .setWarning()
        .onClick(async () => {
          const confirmed = confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.');
          if (confirmed) {
            // Import default settings
            const { DEFAULT_SETTINGS } = await import('../settings');
            this.plugin.settings = { ...DEFAULT_SETTINGS };
            await this.plugin.saveSettings();
            
            // Refresh the settings display
            this.display();
            
            const notice = document.createElement('div');
            notice.textContent = '✅ Settings reset to defaults successfully!';
            notice.style.color = 'var(--text-success)';
            notice.style.fontWeight = 'bold';
            notice.style.marginTop = '10px';
            button.buttonEl.parentElement?.appendChild(notice);
            setTimeout(() => notice.remove(), 3000);
          }
        }));

    // Export/Import Settings
    new Setting(containerEl)
      .setName('Export Settings')
      .setDesc('Export current settings as JSON for backup or sharing.')
      .addButton(button => button
        .setButtonText('Export')
        .onClick(() => {
          const settingsJson = JSON.stringify(this.plugin.settings, null, 2);
          navigator.clipboard.writeText(settingsJson).then(() => {
            const notice = document.createElement('div');
            notice.textContent = '✅ Settings copied to clipboard!';
            notice.style.color = 'var(--text-success)';
            notice.style.fontWeight = 'bold';
            notice.style.marginTop = '10px';
            button.buttonEl.parentElement?.appendChild(notice);
            setTimeout(() => notice.remove(), 3000);
          });
        }));
  }

  private showSuccessMessage(buttonEl: HTMLElement, message: string): void {
    const notice = document.createElement('div');
    notice.textContent = `✅ ${message}`;
    notice.style.color = 'var(--text-success)';
    notice.style.fontWeight = 'bold';
    notice.style.marginTop = '0.5em';
    buttonEl.parentElement?.appendChild(notice);
    setTimeout(() => notice.remove(), 3000);
  }

  private showValidationMessage(inputEl: HTMLElement, message: string, type: 'success' | 'error'): void {
    // Remove any existing validation message
    const existing = inputEl.parentElement?.querySelector('.validation-message');
    if (existing) existing.remove();
    
    const messageEl = document.createElement('div');
    messageEl.classList.add('validation-message');
    messageEl.textContent = message;
    messageEl.style.fontSize = '0.8em';
    messageEl.style.marginTop = '4px';
    messageEl.style.color = type === 'success' ? 'var(--text-success)' : 'var(--text-error)';
    
    inputEl.parentElement?.appendChild(messageEl);
    setTimeout(() => messageEl.remove(), 3000);
  }

  // DEPRECATED: Shortcode functionality moved to quarantine
  // private displayCustomShortcodes(containerEl: HTMLElement): void {
  //   // Shortcode display logic moved to quarantine
  // }

  // private showCustomShortcodeDialog(): void {
  //   // Shortcode dialog logic moved to quarantine
  // }
}
