import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting
} from 'obsidian'
import { createLinkedNote } from './commands/createLinkedNote'
import { LinkPluginSettings, DEFAULT_SETTINGS } from './settings/settings'

export default class LinkPlugin extends Plugin {
  settings: LinkPluginSettings

  async onload() {
    await this.loadSettings()

    // Add command to format links
    this.addCommand({
      id: 'format-link',
      name: 'Format selected link',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        // TODO: Implement format link command
        new Notice('Link formatting command triggered')
      }
    })

    // Add command to create new linked note
    this.addCommand({
      id: 'create-linked-note',
      name: 'Create new linked note',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        await createLinkedNote(this, editor)
      }
    })

    // Add settings tab
    this.addSettingTab(new LinkSettingTab(this.app, this))
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

class LinkSettingTab extends PluginSettingTab {
  plugin: LinkPlugin

  constructor(app: App, plugin: LinkPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this

    containerEl.empty()
    containerEl.createEl('h2', { text: 'Link Plugin Settings' })

    new Setting(containerEl)
      .setName('Default link style')
      .setDesc('Choose the default style for new links')
      .addDropdown((dropdown) =>
        dropdown
          .addOption('markdown', 'Markdown')
          .addOption('wiki', 'Wiki')
          .setValue(this.plugin.settings.defaultLinkStyle)
          .onChange(async (value) => {
            this.plugin.settings.defaultLinkStyle = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Auto-format links')
      .setDesc('Automatically format links when creating notes')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoFormatLinks)
          .onChange(async (value) => {
            this.plugin.settings.autoFormatLinks = value
            await this.plugin.saveSettings()
          })
      )
  }
}
