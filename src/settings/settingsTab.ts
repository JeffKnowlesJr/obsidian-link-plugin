import { App, PluginSettingTab, Setting } from 'obsidian'
import AIAssistantPlugin from '../main'
import { AIAssistantSettings } from './settings'

export class AIAssistantSettingTab extends PluginSettingTab {
  plugin: AIAssistantPlugin

  constructor(app: App, plugin: AIAssistantPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    containerEl.createEl('h2', { text: 'AI Assistant Settings' })

    // API Keys
    new Setting(containerEl)
      .setName('Claude API Key')
      .setDesc('Enter your Claude API key from Anthropic')
      .addText((text) =>
        text
          .setPlaceholder('Enter API key')
          .setValue(this.plugin.settings.claudeApiKey)
          .onChange(async (value) => {
            this.plugin.settings.claudeApiKey = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('OpenAI API Key')
      .setDesc('Enter your OpenAI API key')
      .addText((text) =>
        text
          .setPlaceholder('Enter API key')
          .setValue(this.plugin.settings.openAiApiKey)
          .onChange(async (value) => {
            this.plugin.settings.openAiApiKey = value
            await this.plugin.saveSettings()
          })
      )

    // Default Provider
    new Setting(containerEl)
      .setName('Default AI Provider')
      .setDesc('Choose the default AI provider for queries')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('claude', 'Claude')
          .addOption('chatgpt', 'ChatGPT')
          .setValue(this.plugin.settings.defaultProvider)
          .onChange(async (value: 'claude' | 'chatgpt') => {
            this.plugin.settings.defaultProvider = value
            await this.plugin.saveSettings()
          })
      )

    // Context Settings
    new Setting(containerEl)
      .setName('Enable Context Inclusion')
      .setDesc('Include relevant context from your notes in AI queries')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.contextInclusionEnabled)
          .onChange(async (value) => {
            this.plugin.settings.contextInclusionEnabled = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Max Context Length')
      .setDesc('Maximum number of characters to include as context')
      .addText((text) =>
        text
          .setPlaceholder('2000')
          .setValue(String(this.plugin.settings.maxContextLength))
          .onChange(async (value) => {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              this.plugin.settings.maxContextLength = numValue
              await this.plugin.saveSettings()
            }
          })
      )

    // Privacy Settings
    new Setting(containerEl)
      .setName('Data Retention Period (Days)')
      .setDesc('Number of days to retain conversation history')
      .addText((text) =>
        text
          .setPlaceholder('30')
          .setValue(String(this.plugin.settings.retentionPeriodDays))
          .onChange(async (value) => {
            const numValue = parseInt(value)
            if (!isNaN(numValue)) {
              this.plugin.settings.retentionPeriodDays = numValue
              await this.plugin.saveSettings()
            }
          })
      )

    new Setting(containerEl)
      .setName('Anonymize Data')
      .setDesc('Remove potentially sensitive information before sending to AI')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.anonymizeData)
          .onChange(async (value) => {
            this.plugin.settings.anonymizeData = value
            await this.plugin.saveSettings()
          })
      )

    // Hotkeys
    containerEl.createEl('h3', { text: 'Hotkeys' })

    new Setting(containerEl)
      .setName('Claude Hotkey')
      .setDesc('Hotkey to trigger Claude AI')
      .addText((text) =>
        text
          .setPlaceholder('Ctrl/Cmd + Shift + C')
          .setValue(this.plugin.settings.hotkeys.claude)
          .onChange(async (value) => {
            this.plugin.settings.hotkeys.claude = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('ChatGPT Hotkey')
      .setDesc('Hotkey to trigger ChatGPT')
      .addText((text) =>
        text
          .setPlaceholder('Ctrl/Cmd + Shift + G')
          .setValue(this.plugin.settings.hotkeys.chatgpt)
          .onChange(async (value) => {
            this.plugin.settings.hotkeys.chatgpt = value
            await this.plugin.saveSettings()
          })
      )
  }
}
