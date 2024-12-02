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
import { HelpModal } from './modals/helpModal'
import {
  ensureFolderStructure,
  updateDailyNotesLocation
} from './utils/folderUtils'

export default class LinkPlugin extends Plugin {
  settings: LinkPluginSettings

  async onload() {
    try {
      console.group('Link Plugin Loading')
      console.debug('Starting plugin initialization...')
      console.time('Plugin Load Time')

      // Load settings
      console.debug('Loading plugin settings...')
      await this.loadSettings()
      console.debug('Settings loaded successfully:', this.settings)

      // Ensure folder structure and update daily notes location
      console.debug('Ensuring folder structure...')
      try {
        await ensureFolderStructure(this.app)
        const newLocation = await updateDailyNotesLocation(this.app)
        this.settings.dailyNotesLocation = newLocation
        await this.saveSettings()
        console.debug('Folder structure verified/created successfully')
      } catch (error) {
        console.error('Error ensuring folder structure:', error)
        new Notice(
          'Error creating folder structure. Check console for details.'
        )
      }

      // Register interval to check and update daily notes location
      this.registerInterval(
        window.setInterval(async () => {
          try {
            const currentLocation = this.settings.dailyNotesLocation
            const newLocation = await updateDailyNotesLocation(this.app)

            if (currentLocation !== newLocation) {
              this.settings.dailyNotesLocation = newLocation
              await this.saveSettings()
              console.debug('Daily notes location updated:', newLocation)
            }
          } catch (error) {
            console.error('Error updating daily notes location:', error)
          }
        }, 1000 * 60 * 60) // Check every hour
      )

      // Register commands
      console.group('Registering Commands')
      try {
        this.registerCommands()
        console.debug('Commands registered successfully')
      } catch (error) {
        console.error('Error registering commands:', error)
        throw error
      } finally {
        console.groupEnd()
      }

      // Add settings tab
      console.debug('Adding settings tab...')
      this.addSettingTab(new LinkSettingTab(this.app, this))
      console.debug('Settings tab added successfully')

      // Add ribbon icons
      console.debug('Adding ribbon icons...')
      try {
        // Help ribbon icon
        const helpRibbonIconEl = this.addRibbonIcon(
          'help-circle',
          'Link Plugin Help',
          (evt: MouseEvent) => {
            console.debug('Help ribbon icon clicked', evt)
            new HelpModal(this.app).open()
          }
        )
        helpRibbonIconEl.addClass('link-plugin-help-ribbon-icon')

        // Create linked note ribbon icon
        const createNoteRibbonIconEl = this.addRibbonIcon(
          'link',
          'Create Linked Note',
          async (evt: MouseEvent) => {
            console.debug('Create note ribbon icon clicked', evt)
            const activeView =
              this.app.workspace.getActiveViewOfType(MarkdownView)
            if (activeView) {
              await createLinkedNote(this, activeView.editor)
            } else {
              new Notice('Please open a markdown file first')
            }
          }
        )
        createNoteRibbonIconEl.addClass('link-plugin-create-note-ribbon-icon')

        console.debug('Ribbon icons added successfully')
      } catch (error) {
        console.error('Error adding ribbon icons:', error)
        throw error
      }

      console.timeEnd('Plugin Load Time')
      console.debug('Plugin loaded successfully')
    } catch (error) {
      console.error('Error during plugin initialization:', error)
      console.groupEnd()
      throw error
    }
  }

  private registerCommands() {
    console.debug('Registering format link command...')
    this.addCommand({
      id: 'format-link',
      name: 'Format selected link',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        console.debug('Format link command triggered')
        console.debug('Current selection:', editor.getSelection())
        new Notice('Link formatting command triggered')
      }
    })

    console.debug('Registering create linked note command...')
    this.addCommand({
      id: 'create-linked-note',
      name: 'Create new linked note',
      editorCallback: async (editor: Editor, view: MarkdownView) => {
        console.debug('Create linked note command triggered')
        await createLinkedNote(this, editor)
      }
    })
  }

  async onunload() {
    console.group('Link Plugin Unloading')
    console.debug('Starting plugin cleanup...')
    console.time('Plugin Unload Time')

    try {
      // Add cleanup code here
      console.debug('Plugin cleanup completed')
    } catch (error) {
      console.error('Error during plugin cleanup:', error)
    } finally {
      console.timeEnd('Plugin Unload Time')
      console.groupEnd()
    }
  }

  async loadSettings() {
    console.debug('Loading settings...')
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    console.debug('Settings loaded:', this.settings)
  }

  async saveSettings() {
    console.debug('Saving settings...')
    await this.saveData(this.settings)
    console.debug('Settings saved')
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

    new Setting(containerEl)
      .setName('Help')
      .setDesc('Open the help documentation')
      .addButton((btn) =>
        btn
          .setButtonText('Open Help')
          .setCta()
          .onClick(() => {
            new HelpModal(this.app).open()
          })
      )
  }
}
