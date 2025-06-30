import { App, PluginSettingTab, Setting, TextComponent, DropdownComponent } from 'obsidian';
import LinkPlugin from '../main';
import { 
  DirectorySettings, 
  JournalSettings, 
  NoteSettings, 
  ShortcodeSettings, 
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
    containerEl.createEl('h1', { text: 'Obsidian Link Plugin Settings' });
    
    // Add description
    const description = containerEl.createEl('p');
    description.innerHTML = `
      Configure your Link Plugin settings below. Settings are organized into categories for easy management.
      <br><strong>Tip:</strong> Hover over setting names for detailed descriptions.
    `;
    description.style.marginBottom = '2em';
    description.style.color = 'var(--text-muted)';

    // Directory Settings Section
    this.addDirectorySettings(containerEl);
    
    // Journal Settings Section
    this.addJournalSettings(containerEl);
    
    // Note Settings Section
    this.addNoteSettings(containerEl);
    
    // Shortcode Settings Section
    this.addShortcodeSettings(containerEl);
    
    // General Settings Section
    this.addGeneralSettings(containerEl);
    
    // Advanced Section
    this.addAdvancedSettings(containerEl);
  }

  private addDirectorySettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📁 Directory Structure' });
    
    const directoryDesc = containerEl.createEl('p');
    directoryDesc.textContent = 'Configure how the plugin organizes your files and folders.';
    directoryDesc.style.color = 'var(--text-muted)';
    directoryDesc.style.marginBottom = '1em';

    // Base Folder Setting
    new Setting(containerEl)
      .setName('Base Folder')
      .setDesc('Root folder for all plugin-created directories. Prevents collision with existing vault structure.')
      .addText(text => text
        .setPlaceholder('LinkPlugin')
        .setValue(this.plugin.settings.baseFolder)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.baseFolder = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Document Directory Setting
    new Setting(containerEl)
      .setName('Workspace Directory')
      .setDesc('Directory name for general notes and documents within the base folder.')
      .addText(text => text
        .setPlaceholder('workspace')
        .setValue(this.plugin.settings.documentDirectory)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.documentDirectory = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Journal Root Folder Setting
    new Setting(containerEl)
      .setName('Journal Directory')
      .setDesc('Directory name for journal entries within the base folder.')
      .addText(text => text
        .setPlaceholder('journal')
        .setValue(this.plugin.settings.journalRootFolder)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.journalRootFolder = value.trim();
            await this.plugin.saveSettings();
          }
        }));

    // Rebuild Directory Structure Button
    new Setting(containerEl)
      .setName('Rebuild Directory Structure')
      .setDesc('Recreate the directory structure based on current settings.')
      .addButton(button => button
        .setButtonText('Rebuild')
        .setTooltip('Click to rebuild the directory structure')
        .onClick(async () => {
          try {
            await this.plugin.directoryManager.rebuildDirectoryStructure();
            // Show success message
            const notice = document.createElement('div');
            notice.textContent = '✅ Directory structure rebuilt successfully!';
            notice.style.color = 'var(--text-success)';
            notice.style.fontWeight = 'bold';
            button.buttonEl.parentElement?.appendChild(notice);
            setTimeout(() => notice.remove(), 3000);
          } catch (error) {
            this.plugin.errorHandler.handleError(error, 'Failed to rebuild directory structure');
          }
        }));
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

  private addShortcodeSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '⚡ Shortcodes' });
    
    const shortcodeDesc = containerEl.createEl('p');
    shortcodeDesc.innerHTML = `
      Configure the shortcode system for rapid content creation. 
      <br><small>Example: <code>h2+ul>li*3</code> creates a heading with a 3-item list.</small>
    `;
    shortcodeDesc.style.color = 'var(--text-muted)';
    shortcodeDesc.style.marginBottom = '1em';

    // Shortcode Enabled Setting
    new Setting(containerEl)
      .setName('Enable Shortcodes')
      .setDesc('Enable the shortcode expansion system.')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.shortcodeEnabled)
        .onChange(async (value) => {
          this.plugin.settings.shortcodeEnabled = value;
          await this.plugin.saveSettings();
        }));

    // Shortcode Trigger Key Setting
    new Setting(containerEl)
      .setName('Trigger Key')
      .setDesc('Key to trigger shortcode expansion.')
      .addDropdown(dropdown => dropdown
        .addOption('Tab', 'Tab')
        .addOption('Enter', 'Enter')
        .addOption('Space', 'Space')
        .setValue(this.plugin.settings.shortcodeTriggerKey)
        .onChange(async (value) => {
          this.plugin.settings.shortcodeTriggerKey = value;
          await this.plugin.saveSettings();
        }));

    // Built-in Shortcodes Display
    const builtinContainer = containerEl.createDiv();
    builtinContainer.createEl('h4', { text: 'Built-in Shortcodes' });
    
    const builtinShortcodes = ShortcodeSettings.getBuiltinShortcodes();
    const shortcodeList = builtinContainer.createEl('ul');
    shortcodeList.style.fontSize = '0.9em';
    shortcodeList.style.color = 'var(--text-muted)';
    
    Object.entries(builtinShortcodes).forEach(([pattern, description]) => {
      const item = shortcodeList.createEl('li');
      item.innerHTML = `<code>${pattern}</code> - ${description}`;
    });

    // Custom Shortcodes Section
    containerEl.createEl('h4', { text: 'Custom Shortcodes' });
    containerEl.createEl('p', { 
      text: 'Add your own shortcode patterns. Format: pattern → expansion',
      attr: { style: 'color: var(--text-muted); font-size: 0.9em; margin-bottom: 1em;' }
    });

    // Add Custom Shortcode Button
    new Setting(containerEl)
      .setName('Add Custom Shortcode')
      .setDesc('Create a new custom shortcode pattern.')
      .addButton(button => button
        .setButtonText('Add Shortcode')
        .onClick(() => {
          this.showCustomShortcodeDialog();
        }));

    // Display existing custom shortcodes
    this.displayCustomShortcodes(containerEl);
  }

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

  private displayCustomShortcodes(containerEl: HTMLElement): void {
    const customShortcodes = this.plugin.settings.customShortcodes;
    
    if (Object.keys(customShortcodes).length === 0) {
      const emptyEl = containerEl.createEl('p');
      emptyEl.textContent = 'No custom shortcodes defined.';
      emptyEl.style.color = 'var(--text-muted)';
      emptyEl.style.fontStyle = 'italic';
      return;
    }

    Object.entries(customShortcodes).forEach(([pattern, expansion]) => {
      new Setting(containerEl)
        .setName(pattern)
        .setDesc(expansion.length > 50 ? expansion.substring(0, 50) + '...' : expansion)
        .addButton(button => button
          .setButtonText('Delete')
          .setTooltip('Delete this custom shortcode')
          .onClick(async () => {
            delete this.plugin.settings.customShortcodes[pattern];
            await this.plugin.saveSettings();
            this.display(); // Refresh the display
          }));
    });
  }

  private showCustomShortcodeDialog(): void {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;
    `;
    
    const dialog = document.createElement('div');
    dialog.style.cssText = `
      background: var(--background-primary); padding: 20px; border-radius: 8px; max-width: 500px; width: 90%;
      border: 1px solid var(--background-modifier-border);
    `;
    
    dialog.innerHTML = `
      <h3>Add Custom Shortcode</h3>
      <div style="margin: 15px 0;">
        <label>Pattern:</label>
        <input type="text" id="shortcode-pattern" placeholder="e.g., mylist" style="width: 100%; margin-top: 5px; padding: 8px;">
      </div>
      <div style="margin: 15px 0;">
        <label>Expansion:</label>
        <textarea id="shortcode-expansion" placeholder="e.g., - [ ] Item 1&#10;- [ ] Item 2" style="width: 100%; height: 100px; margin-top: 5px; padding: 8px;"></textarea>
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
        <button id="cancel-btn">Cancel</button>
        <button id="save-btn" style="background: var(--interactive-accent); color: var(--text-on-accent);">Save</button>
      </div>
    `;
    
    modal.appendChild(dialog);
    document.body.appendChild(modal);
    
    const patternInput = dialog.querySelector('#shortcode-pattern') as HTMLInputElement;
    const expansionInput = dialog.querySelector('#shortcode-expansion') as HTMLTextAreaElement;
    const cancelBtn = dialog.querySelector('#cancel-btn') as HTMLButtonElement;
    const saveBtn = dialog.querySelector('#save-btn') as HTMLButtonElement;
    
    const closeModal = () => document.body.removeChild(modal);
    
    cancelBtn.onclick = closeModal;
    modal.onclick = (e) => e.target === modal && closeModal();
    
    saveBtn.onclick = async () => {
      const pattern = patternInput.value.trim();
      const expansion = expansionInput.value.trim();
      
      if (!pattern || !expansion) {
        alert('Both pattern and expansion are required.');
        return;
      }
      
      if (!ShortcodeSettings.isValidShortcodePattern(pattern)) {
        alert('Invalid shortcode pattern. Use alphanumeric characters and shortcode operators (+, >, *, {}, [], ()).');
        return;
      }
      
      this.plugin.settings.customShortcodes[pattern] = expansion;
      await this.plugin.saveSettings();
      closeModal();
      this.display(); // Refresh the display
    };
    
    patternInput.focus();
  }
}
