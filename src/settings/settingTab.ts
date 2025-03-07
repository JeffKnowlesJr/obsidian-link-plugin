import { App, PluginSettingTab, Setting } from 'obsidian'
import LinkPlugin from '../main'
import { FolderTemplate } from './settings'
import { FolderStructureType } from '../utils/migrationUtils'

export class LinkPluginSettingTab extends PluginSettingTab {
  plugin: LinkPlugin

  constructor(app: App, plugin: LinkPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl('h2', { text: 'Link Plugin Settings' })

    // Daily Notes Management
    containerEl.createEl('h3', { text: 'Daily Notes Management' })
    new Setting(containerEl)
      .setName('Auto-update Monthly Folders')
      .setDesc(
        'Automatically update daily notes location based on current month'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoUpdateMonthlyFolders)
          .onChange(async (value) => {
            this.plugin.settings.autoUpdateMonthlyFolders = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Check Interval')
      .setDesc('How often to check for folder updates (in minutes)')
      .addSlider((slider) =>
        slider
          .setLimits(1, 120, 1)
          .setValue(this.plugin.settings.checkIntervalMinutes)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.checkIntervalMinutes = value
            await this.plugin.saveSettings()
          })
      )

    // Folder Structure Settings
    containerEl.createEl('h3', { text: 'Folder Structure' })

    new Setting(containerEl)
      .setName('Folder structure type')
      .setDesc('Choose the type of folder structure to use')
      .addDropdown((dropdown: any) => {
        dropdown
          .addOption(FolderStructureType.LEGACY, 'Legacy (with underscores)')
          .addOption(
            FolderStructureType.HUGO_COMPATIBLE,
            'Hugo compatible (no underscores)'
          )
          .setValue(this.plugin.settings.folderStructureType)
          .onChange(async (value: FolderStructureType) => {
            // If changing to a different structure, show confirmation dialog
            if (value !== this.plugin.settings.folderStructureType) {
              if (
                window.confirm(
                  'This will migrate your folder structure. Continue?'
                )
              ) {
                await this.plugin.migrateToFolderStructure(value)
              } else {
                // Reset dropdown if cancelled
                dropdown.setValue(this.plugin.settings.folderStructureType)
              }
            }
          })
      })

    new Setting(containerEl)
      .setName('Always ensure Archive folder')
      .setDesc('Always create and maintain the Archive folder')
      .addToggle((toggle: any) => {
        toggle
          .setValue(this.plugin.settings.alwaysEnsureArchive)
          .onChange(async (value: boolean) => {
            this.plugin.settings.alwaysEnsureArchive = value
            await this.plugin.saveSettings()
          })
      })

    // Link Processing
    containerEl.createEl('h3', { text: 'Link Processing' })
    new Setting(containerEl)
      .setName('Hugo Compatible Links')
      .setDesc('Ensure links are compatible with Hugo static site generator')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hugoCompatibleLinks)
          .onChange(async (value) => {
            this.plugin.settings.hugoCompatibleLinks = value
            await this.plugin.saveSettings()
          })
      )

    // Folder Templates
    containerEl.createEl('h3', { text: 'Folder Templates' })

    // Add an "Apply Selected Template" button
    new Setting(containerEl)
      .setName('Apply Selected Template')
      .setDesc(
        'Apply the currently selected template to create or update folder structure'
      )
      .addButton((button) => {
        button
          .setButtonText('Apply Template')
          .setCta()
          .onClick(async () => {
            if (
              window.confirm('This will apply the selected template. Continue?')
            ) {
              await this.plugin.applySelectedTemplate()
            }
          })
      })

    // Template list
    this.plugin.settings.folderTemplates.forEach((template: FolderTemplate) => {
      new Setting(containerEl)
        .setName(template.name)
        .setDesc(template.description)
        .addToggle((toggle) =>
          toggle.setValue(template.isEnabled).onChange(async (value) => {
            template.isEnabled = value
            if (
              value &&
              this.plugin.settings.activeTemplateId !== template.id
            ) {
              this.plugin.settings.activeTemplateId = template.id
              await this.plugin.saveSettings()

              // Ask if user wants to apply the template immediately
              if (
                window.confirm(`Apply the "${template.name}" template now?`)
              ) {
                await this.plugin.applySelectedTemplate()
              }
            } else {
              await this.plugin.saveSettings()
            }
          })
        )
    })
  }
}
