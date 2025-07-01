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
        .setDesc('Create templates directory and copy Daily Notes template')
        .addButton(button => button
          .setButtonText('Setup Templates')
          .onClick(async () => {
            try {
              await this.plugin.directoryManager.setupTemplates();
              const templatesPath = this.plugin.settings.baseFolder 
                ? `${this.plugin.settings.baseFolder}/templates`
                : 'templates';
              alert('✅ Templates setup successfully!\n\nTemplates directory and Daily Notes template created in: ' + templatesPath);
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              alert('❌ Failed to setup templates.\n\nError: ' + errorMessage);
              this.plugin.errorHandler.handleError(error, 'Failed to setup templates');
            }
          }));
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
}
