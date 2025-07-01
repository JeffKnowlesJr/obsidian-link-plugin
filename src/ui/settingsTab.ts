import { PluginSettingTab, App, Setting } from 'obsidian';
import LinkPlugin from '../main';
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

    containerEl.createEl('h1', { text: 'Link Plugin Settings' });
    containerEl.createEl('p', { 
      text: 'Simple journal management settings', 
      cls: 'setting-item-description' 
    });

    this.addCoreSettings(containerEl);
    this.addJournalSettings(containerEl);
  }

  private addCoreSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📁 Core Settings' });

    // Base Folder
    new Setting(containerEl)
      .setName('Base Folder')
      .setDesc('Root folder for journal content (empty = vault root)')
      .addText(text => text
        .setPlaceholder('Link')
        .setValue(this.plugin.settings.baseFolder)
        .onChange(async (value) => {
          // Allow empty string for root
          this.plugin.settings.baseFolder = value.trim();
          await this.plugin.saveSettings();
        }))
      .then(setting => {
        // Add "/" prefix to show it's a path
        const textComponent = setting.components[0] as any;
        if (textComponent && textComponent.inputEl) {
          const input = textComponent.inputEl;
          const wrapper = input.parentElement;
          if (wrapper) {
            const prefix = wrapper.createSpan({ text: '/', cls: 'path-prefix' });
            wrapper.insertBefore(prefix, input);
            prefix.style.marginRight = '2px';
            prefix.style.opacity = '0.6';
          }
        }
      });

          // Rebuild Directory Structure
      new Setting(containerEl)
        .setName('Rebuild Journal Structure')
        .setDesc('Recreate the journal folder structure')
        .addButton(button => button
          .setButtonText('Rebuild')
          .onClick(async () => {
            try {
              await this.plugin.directoryManager.rebuildDirectoryStructure();
              // Show results via alert as requested
              alert('✅ Journal structure rebuilt successfully!\n\nJournal folder structure has been recreated in: ' + this.plugin.settings.baseFolder);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert('❌ Failed to rebuild journal structure.\n\nError: ' + errorMessage);
              this.plugin.errorHandler.handleError(error, 'Failed to rebuild journal structure');
            }
          }));

      // Setup Templates
      new Setting(containerEl)
        .setName('Setup Templates')
        .setDesc('Create templates directory alongside journal and copy Daily Notes template (works with Templater plugin)')
        .addButton(button => button
          .setButtonText('Setup Templates')
          .onClick(async () => {
            try {
              await this.plugin.directoryManager.setupTemplates();
              const templatesPath = this.plugin.settings.baseFolder 
                ? `${this.plugin.settings.baseFolder}/templates`
                : 'templates';
              
              // Check if Templater is available for user feedback
              // @ts-ignore - Access Obsidian's plugin system
              const templaterPlugin = this.plugin.app.plugins?.plugins?.['templater-obsidian'];
              const hasTemplater = templaterPlugin && templaterPlugin._loaded;
              
              const templaterStatus = hasTemplater 
                ? '\n\n✅ Templater plugin detected - Template will work with dynamic dates'
                : '\n\n⚠️ Templater plugin not detected - Template contains Templater syntax that may not render';
              
              alert('✅ Templates setup successfully!\n\nTemplates directory created alongside journal at: ' + templatesPath + templaterStatus);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert('❌ Failed to setup templates.\n\nError: ' + errorMessage);
              this.plugin.errorHandler.handleError(error, 'Failed to setup templates');
            }
          }));

      // Daily Notes Integration Section
      this.addDailyNotesIntegrationSettings(containerEl);
  }

  private addJournalSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: '📅 Journal Settings' });

    // Single toggle: Simple OR Dynamic
    new Setting(containerEl)
      .setName('Simple Journal Mode')
      .setDesc('Enable: Single journal folder | Disable: Dynamic monthly folders (2025/January/)')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.simpleJournalMode)
        .onChange(async (value) => {
          this.plugin.settings.simpleJournalMode = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide format settings
        }));

    // Only show format settings if dynamic mode is enabled
    if (!this.plugin.settings.simpleJournalMode) {
      // Year Format
      new Setting(containerEl)
        .setName('Year Folder Format')
        .setDesc('Format for year folders (YYYY creates "2025")')
        .addText(text => text
          .setPlaceholder('YYYY')
          .setValue(this.plugin.settings.journalYearFormat)
          .onChange(async (value) => {
            if (value.trim()) {
              this.plugin.settings.journalYearFormat = value.trim();
              await this.plugin.saveSettings();
            }
          }));

      // Month Format
      new Setting(containerEl)
        .setName('Month Folder Format')
        .setDesc('Format for month folders (MM-MMMM creates "07-July")')
        .addText(text => text
          .setPlaceholder('MM-MMMM')
          .setValue(this.plugin.settings.journalMonthFormat)
          .onChange(async (value) => {
            if (value.trim()) {
              this.plugin.settings.journalMonthFormat = value.trim();
              await this.plugin.saveSettings();
            }
          }));
    }

    // Daily Note Format
    new Setting(containerEl)
      .setName('Daily Note Format')
      .setDesc('Format for daily note filenames')
      .addText(text => text
        .setPlaceholder('YYYY-MM-DD dddd')
        .setValue(this.plugin.settings.journalDateFormat)
        .onChange(async (value) => {
          if (value.trim()) {
            this.plugin.settings.journalDateFormat = value.trim();
            await this.plugin.saveSettings();
          }
        }));
  }

  /**
   * Adds Daily Notes integration settings with backup and restore functionality
   */
  private addDailyNotesIntegrationSettings(containerEl: HTMLElement): void {
    containerEl.createEl('h2', { text: 'Daily Notes Integration' });
    containerEl.createEl('p', { 
      text: 'Control how this plugin integrates with Obsidian\'s Daily Notes plugin. Your original settings will be backed up automatically.',
      cls: 'setting-item-description'
    });

    // Main enable/disable toggle
    new Setting(containerEl)
      .setName('Enable Daily Notes Integration')
      .setDesc('Allow this plugin to update Daily Notes plugin settings to use our folder structure')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.dailyNotesIntegration.enabled)
        .onChange(async (value) => {
          this.plugin.settings.dailyNotesIntegration.enabled = value;
          await this.plugin.saveSettings();
          this.display(); // Refresh to show/hide controls
        }));

    if (this.plugin.settings.dailyNotesIntegration.enabled) {
      // Enable All button
      new Setting(containerEl)
        .setName('Quick Controls')
        .setDesc('Enable or disable all integration controls at once')
        .addButton(button => button
          .setButtonText('Enable All Controls')
          .onClick(async () => {
            this.plugin.settings.dailyNotesIntegration.controls = {
              folder: true,
              format: true,
              template: true,
            };
            await this.plugin.saveSettings();
            this.display(); // Refresh to show updated checkboxes
          }))
        .addButton(button => button
          .setButtonText('Disable All Controls')
          .onClick(async () => {
            this.plugin.settings.dailyNotesIntegration.controls = {
              folder: false,
              format: false,
              template: false,
            };
            await this.plugin.saveSettings();
            this.display(); // Refresh to show updated checkboxes
          }));

      // Individual control checkboxes
      new Setting(containerEl)
        .setName('📁 Control Folder Location')
        .setDesc('Update Daily Notes folder to use our monthly folder structure')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.dailyNotesIntegration.controls.folder)
          .onChange(async (value) => {
            this.plugin.settings.dailyNotesIntegration.controls.folder = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('📅 Control Date Format')
        .setDesc('Update Daily Notes date format to match our journal format')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.dailyNotesIntegration.controls.format)
          .onChange(async (value) => {
            this.plugin.settings.dailyNotesIntegration.controls.format = value;
            await this.plugin.saveSettings();
          }));

      new Setting(containerEl)
        .setName('📝 Control Template')
        .setDesc('Update Daily Notes template to use our daily note template')
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.dailyNotesIntegration.controls.template)
          .onChange(async (value) => {
            this.plugin.settings.dailyNotesIntegration.controls.template = value;
            await this.plugin.saveSettings();
          }));

      // Apply settings button
      new Setting(containerEl)
        .setName('Apply Integration Settings')
        .setDesc('Apply the selected controls to Daily Notes plugin (creates backup automatically)')
        .addButton(button => button
          .setButtonText('Apply Now')
          .onClick(async () => {
            try {
              await this.plugin.updateDailyNotesSettings();
              alert('✅ Daily Notes integration settings applied successfully!\n\nYour original settings have been backed up and can be restored at any time.');
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert('❌ Failed to apply integration settings.\n\nError: ' + errorMessage);
              this.plugin.errorHandler.handleError(error, 'Failed to apply Daily Notes integration');
            }
          }));

      // Show backup info if exists
      const backup = this.plugin.settings.dailyNotesIntegration.backup;
      if (backup) {
        const backupDate = new Date(backup.timestamp).toLocaleString();
        new Setting(containerEl)
          .setName('📦 Backup Information')
          .setDesc(`Backup created: ${backupDate} (${backup.pluginType} plugin)`);
      }
    }

    // Danger zone - restore settings
    if (this.plugin.settings.dailyNotesIntegration.backup) {
      containerEl.createEl('h3', { text: '⚠️ Danger Zone', cls: 'danger-zone-header' });
      
      const dangerContainer = containerEl.createDiv({ cls: 'danger-zone' });
      dangerContainer.createEl('p', { 
        text: '⚠️ WARNING: This will restore your original Daily Notes settings and disable all integration. This action cannot be undone.',
        cls: 'danger-warning'
      });

      new Setting(dangerContainer)
        .setName('🔄 Restore Original Settings')
        .setDesc('Restore Daily Notes plugin to your original settings and disable integration')
        .addButton(button => button
          .setButtonText('Restore & Disable')
          .setClass('mod-warning')
          .onClick(async () => {
            const confirmed = confirm(
              '⚠️ CONFIRM RESTORE\n\n' +
              'This will:\n' +
              '• Restore your original Daily Notes settings\n' +
              '• Disable all integration controls\n' +
              '• Delete the backup\n\n' +
              'This action cannot be undone. Continue?'
            );
            
            if (confirmed) {
              try {
                await this.plugin.restoreDailyNotesSettings();
                this.display(); // Refresh settings UI
              } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                alert('❌ Failed to restore settings.\n\nError: ' + errorMessage);
              }
            }
          }));

      // Add danger zone styling
      const style = document.createElement('style');
      style.textContent = `
        .danger-zone-header {
          color: var(--text-error);
          margin-top: 2em;
        }
        .danger-zone {
          border: 1px solid var(--background-modifier-error);
          border-radius: 6px;
          padding: 16px;
          background: var(--background-modifier-error-hover);
        }
        .danger-warning {
          color: var(--text-error);
          font-weight: 500;
          margin-bottom: 16px;
        }
      `;
      containerEl.appendChild(style);
    }
  }
}
