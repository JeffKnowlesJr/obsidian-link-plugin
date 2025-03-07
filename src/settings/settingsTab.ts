import { App, PluginSettingTab, Setting } from 'obsidian'
import LinkPlugin from '../main'
import { FolderTemplate } from './settings'

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
            }
            await this.plugin.saveSettings()
          })
        )
    })
  }
}
