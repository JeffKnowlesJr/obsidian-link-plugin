import {
  App,
  Editor,
  MarkdownView,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFile,
  WorkspaceLeaf,
  moment
} from 'obsidian'
import { createLinkedNote } from './commands/createLinkedNote'
import { LinkPluginSettings, DEFAULT_SETTINGS } from './settings/settings'
import { HelpModal } from './modals/helpModal'
import {
  ensureFolderStructure,
  updateDailyNotesLocation,
  ROOT_FOLDER,
  createDailyNoteContent
} from './utils/folderUtils'

class ConfirmationModal extends Modal {
  private onConfirm: () => void

  constructor(app: App, onConfirm: () => void) {
    super(app)
    this.onConfirm = onConfirm
  }

  onOpen() {
    const { contentEl } = this
    contentEl.empty()

    contentEl.createEl('h2', { text: 'Regenerate Folder Structure?' })
    contentEl.createEl('p', {
      text: `The ${ROOT_FOLDER} folder has been deleted. Would you like to regenerate the folder structure?`
    })

    const buttonContainer = contentEl.createDiv('button-container')
    buttonContainer.style.display = 'flex'
    buttonContainer.style.justifyContent = 'flex-end'
    buttonContainer.style.gap = '10px'
    buttonContainer.style.marginTop = '20px'

    const confirmButton = buttonContainer.createEl('button', {
      text: 'Yes, regenerate',
      cls: 'mod-cta'
    })
    confirmButton.addEventListener('click', async () => {
      this.close()
      this.onConfirm()
    })

    const cancelButton = buttonContainer.createEl('button', {
      text: 'No, keep it deleted'
    })
    cancelButton.addEventListener('click', () => {
      this.close()
    })
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}

export default class LinkPlugin extends Plugin {
  settings: LinkPluginSettings
  private folderCheckInterval: number

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

      // Wait for daily notes plugin to be ready
      this.app.workspace.onLayoutReady(() => {
        this.patchDailyNotes()
      })

      // Register file creation events
      this.registerEvent(
        // @ts-ignore - The type definitions are incomplete
        this.app.vault.on('create', async (file: TFile) => {
          if (this.isDailyNote(file)) {
            await this.enhanceDailyNote(file)
          }
        })
      )

      // Register daily note creation interceptor
      this.registerEvent(
        this.app.workspace.on('file-create', async (file: TFile) => {
          if (this.isDailyNote(file)) {
            await this.enhanceDailyNote(file)
          }
        })
      )

      // Register file open handler for auto-reveal
      this.registerEvent(
        this.app.workspace.on('file-open', (file: TFile) => {
          if (this.settings.autoRevealFile && file) {
            this.revealFileInExplorer(file)
          }
        })
      )

      // Register interval to check root folder existence
      this.registerRootFolderCheck()

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

  private patchDailyNotes() {
    try {
      // Get the daily notes plugin
      const dailyNotesPlugin = (this.app as any).internalPlugins?.plugins[
        'daily-notes'
      ]
      if (!dailyNotesPlugin?.enabled) {
        console.debug('Daily notes plugin not enabled')
        return
      }

      const instance = dailyNotesPlugin.instance
      if (!instance?.createDailyNote) {
        console.debug('Daily notes createDailyNote function not found')
        return
      }

      // Store the original create daily note function
      const originalCreateDailyNote = instance.createDailyNote.bind(instance)

      // Replace with our enhanced version
      instance.createDailyNote = async (date?: Date) => {
        try {
          const file = await originalCreateDailyNote(date)
          if (file) {
            await this.enhanceDailyNote(file)
          }
          return file
        } catch (error) {
          console.error('Error in enhanced createDailyNote:', error)
          // Fall back to original function if our enhancement fails
          return originalCreateDailyNote(date)
        }
      }

      console.debug('Daily notes functionality patched successfully')
    } catch (error) {
      console.error('Error patching daily notes:', error)
    }
  }

  private registerRootFolderCheck() {
    // Check every 5 seconds for root folder existence
    this.registerInterval(
      window.setInterval(async () => {
        try {
          const rootExists = await this.app.vault.adapter.exists(ROOT_FOLDER)
          if (!rootExists) {
            console.debug(
              `${ROOT_FOLDER} folder not found, prompting for regeneration`
            )
            new ConfirmationModal(this.app, async () => {
              try {
                await ensureFolderStructure(this.app)
                const newLocation = await updateDailyNotesLocation(this.app)
                this.settings.dailyNotesLocation = newLocation
                await this.saveSettings()
                new Notice(
                  `${ROOT_FOLDER} folder structure has been regenerated`
                )
              } catch (error) {
                console.error('Error regenerating folder structure:', error)
                new Notice('Failed to regenerate folder structure')
              }
            }).open()
          }
        } catch (error) {
          console.error('Error checking root folder existence:', error)
        }
      }, 5000)
    )
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

  private async revealFileInExplorer(file: TFile) {
    try {
      // Get the file explorer leaf
      const fileExplorer =
        this.app.workspace.getLeavesOfType('file-explorer')[0]
      if (!fileExplorer) {
        return
      }

      // @ts-ignore - Access the file explorer view instance
      const fileExplorerView = fileExplorer.view
      if (!fileExplorerView) {
        return
      }

      // Reveal and highlight the file
      // @ts-ignore - Accessing internal API
      fileExplorerView.revealInFolder(file)
    } catch (error) {
      console.error('Error revealing file in explorer:', error)
    }
  }

  private isDailyNote(file: TFile): boolean {
    // Check if the file is in a daily notes folder
    const dailyNotesPath = this.settings.dailyNotesLocation
    return file.path.startsWith(dailyNotesPath) && file.extension === 'md'
  }

  private async enhanceDailyNote(file: TFile) {
    try {
      // Extract date from filename
      const match = file.basename.match(/^(\d{4}-\d{2}-\d{2})/)
      if (!match) return

      const date = moment(match[1])
      if (!date.isValid()) return

      // Get the current content
      const currentContent = await this.app.vault.read(file)

      // Only enhance if it doesn't already have previous/next links
      if (
        !currentContent.includes('previous:') &&
        !currentContent.includes('next:')
      ) {
        // Create enhanced content
        const enhancedContent = await createDailyNoteContent(
          this.app,
          file.basename,
          date
        )

        // Update the file
        await this.app.vault.modify(file, enhancedContent)
        console.debug(`Enhanced daily note: ${file.path}`)
      }
    } catch (error) {
      console.error('Error enhancing daily note:', error)
    }
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
      .setName('Auto-reveal files')
      .setDesc(
        'Automatically reveal and highlight files in the file explorer when opened'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoRevealFile)
          .onChange(async (value) => {
            this.plugin.settings.autoRevealFile = value
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
