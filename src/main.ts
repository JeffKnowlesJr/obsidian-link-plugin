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
import {
  LinkPluginSettings,
  DEFAULT_SETTINGS,
  FolderTemplate
} from './settings/settings'
import { HelpModal } from './modals/helpModal'
import {
  StructurePreviewModal,
  TemplateEditModal
} from './modals/templateModals'
import {
  ensureFolderStructure,
  updateDailyNotesLocation,
  ROOT_FOLDER,
  createDailyNoteContent,
  migrateExistingDailyNotes
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
  folderCheckInterval: number

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
        await ensureFolderStructure(this.app, this.settings)

        // Migrate existing daily notes to new folder structure
        console.debug('Migrating existing daily notes...')
        await migrateExistingDailyNotes(this.app)

        // Update daily notes location
        const newLocation = await updateDailyNotesLocation(this.app)
        this.settings.dailyNotesLocation = newLocation
        await this.saveSettings()
      } catch (error) {
        console.error('Error ensuring folder structure:', error)
        new Notice('Error initializing folder structure')
      }

      // Register commands
      console.debug('Registering commands...')
      this.registerCommands()

      // Patch daily notes plugin
      console.debug('Patching daily notes functionality...')
      this.patchDailyNotes()

      // Register root folder check
      console.debug('Registering root folder check...')
      this.registerRootFolderCheck()

      // Register monthly daily notes location update check
      console.debug('Registering monthly daily notes location update check...')
      this.registerDailyNotesLocationCheck()

      // Register settings tab
      console.debug('Registering settings tab...')
      this.addSettingTab(new LinkSettingTab(this.app, this))

      // Wait for daily notes plugin to be ready
      setTimeout(() => {
        this.patchDailyNotes()
      }, 1000)

      // Add ribbon icons
      this.addRibbonIcon('link', 'Create Linked Note', () => {
        // Get active leaf
        const activeLeaf = this.app.workspace.activeLeaf
        if (!activeLeaf) {
          new Notice('No active editor')
          return
        }

        // Get editor from MarkdownView
        const view = activeLeaf.view
        if (!view) {
          new Notice('No active view')
          return
        }

        // Check if it's a markdown view with an editor
        const markdownView = view as any
        if (!markdownView.editor) {
          new Notice('No markdown editor active')
          return
        }

        // Create linked note
        createLinkedNote(this, markdownView.editor)
      })

      // Register file:create event to auto-enhance daily notes
      this.registerEvent(
        this.app.vault.on('create', (file) => {
          if (file instanceof TFile && this.isDailyNote(file)) {
            // Enhance the daily note if it's newly created
            this.enhanceDailyNote(file)
          }
        })
      )

      console.timeEnd('Plugin Load Time')
      console.debug('Plugin initialization complete')
      console.groupEnd()
    } catch (error) {
      console.error('Error loading Link Plugin:', error)
      new Notice('Error loading Link Plugin')
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
                await ensureFolderStructure(this.app, this.settings)
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

  protected async enhanceDailyNote(file: TFile): Promise<void> {
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

  registerDailyNotesLocationCheck() {
    // Clear any existing interval
    if (this.folderCheckInterval) {
      window.clearInterval(this.folderCheckInterval)
    }

    // Only set up the interval if auto-update is enabled
    if (!this.settings.autoUpdateMonthlyFolders) {
      console.debug('Automatic monthly folder updates disabled in settings')
      return
    }

    // Store previous month to detect month changes
    let currentMonth = new Date().getMonth()

    // Convert minutes to milliseconds
    const checkInterval = this.settings.checkIntervalMinutes * 60 * 1000

    // Check at the specified interval if the month has changed
    this.folderCheckInterval = window.setInterval(async () => {
      try {
        // Skip if auto-update got disabled
        if (!this.settings.autoUpdateMonthlyFolders) return

        const now = new Date()
        const nowMonth = now.getMonth()

        // Update daily notes location if the month has changed
        if (nowMonth !== currentMonth) {
          console.debug('Month changed, updating daily notes location')
          currentMonth = nowMonth

          const newLocation = await updateDailyNotesLocation(this.app)
          this.settings.dailyNotesLocation = newLocation
          await this.saveSettings()

          new Notice(`Daily notes location updated to: ${newLocation}`)
        }
      } catch (error) {
        console.error('Error checking for month change:', error)
      }
    }, checkInterval)

    this.registerInterval(this.folderCheckInterval)
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

    containerEl.createEl('h3', { text: 'Daily Notes Settings' })

    new Setting(containerEl)
      .setName('Auto-update monthly folders')
      .setDesc('Automatically update daily notes location when month changes')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.autoUpdateMonthlyFolders)
          .onChange(async (value) => {
            this.plugin.settings.autoUpdateMonthlyFolders = value
            await this.plugin.saveSettings()
          })
      )

    new Setting(containerEl)
      .setName('Check interval (minutes)')
      .setDesc('How often to check for month changes (in minutes)')
      .addSlider((slider) =>
        slider
          .setLimits(15, 240, 15)
          .setValue(this.plugin.settings.checkIntervalMinutes)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.checkIntervalMinutes = value
            await this.plugin.saveSettings()

            // Restart the interval with the new timing
            if (this.plugin.folderCheckInterval) {
              window.clearInterval(this.plugin.folderCheckInterval)
              this.plugin.registerDailyNotesLocationCheck()
            }
          })
      )

    containerEl.createEl('h3', { text: 'Folder Structure Templates' })
    containerEl.createEl('p', {
      text: 'Select and configure folder structure templates. Changes take effect the next time the folder structure is created or updated.'
    })

    // Template selection
    new Setting(containerEl)
      .setName('Active Template')
      .setDesc('Choose which folder structure template to use')
      .addDropdown((dropdown) => {
        // Add all enabled templates to the dropdown
        const enabledTemplates = this.plugin.settings.folderTemplates.filter(
          (t) => t.isEnabled
        )
        enabledTemplates.forEach((template) => {
          dropdown.addOption(template.id, template.name)
        })

        return dropdown
          .setValue(this.plugin.settings.activeTemplateId)
          .onChange(async (value) => {
            this.plugin.settings.activeTemplateId = value
            await this.plugin.saveSettings()
          })
      })

    // Button to create folders using the selected template
    new Setting(containerEl)
      .setName('Apply Template')
      .setDesc('Create the folder structure using the selected template')
      .addButton((button) =>
        button.setButtonText('Create Folders').onClick(async () => {
          try {
            new Notice('Creating folder structure...')
            await ensureFolderStructure(this.app, this.plugin.settings)
            new Notice('Folder structure created successfully!')
          } catch (e) {
            console.error('Error creating folder structure:', e)
            new Notice(
              'Error creating folder structure. Check console for details.'
            )
          }
        })
      )

    // Container for template settings
    const templateContainer = containerEl.createDiv(
      'template-settings-container'
    )

    // Display each template with enable/disable toggle and edit button
    this.plugin.settings.folderTemplates.forEach((template, index) => {
      const templateDiv = templateContainer.createDiv('template-item')
      templateDiv.style.border = '1px solid var(--background-modifier-border)'
      templateDiv.style.borderRadius = '4px'
      templateDiv.style.padding = '10px'
      templateDiv.style.marginBottom = '10px'

      // Template header
      const header = templateDiv.createDiv('template-header')
      header.style.display = 'flex'
      header.style.justifyContent = 'space-between'
      header.style.alignItems = 'center'
      header.style.marginBottom = '8px'

      const titleEl = header.createEl('h4', { text: template.name })
      titleEl.style.margin = '0'

      // Toggle to enable/disable template
      const toggleContainer = header.createDiv()

      new Setting(toggleContainer)
        .setName('')
        .setDesc('')
        .addToggle((toggle) =>
          toggle.setValue(template.isEnabled).onChange(async (value) => {
            this.plugin.settings.folderTemplates[index].isEnabled = value
            await this.plugin.saveSettings()

            // Refresh the UI to update the dropdown
            this.display()
          })
        )

      // Template description
      templateDiv.createEl('p', { text: template.description })

      // Preview button
      const previewBtn = templateDiv.createEl('button', {
        text: 'Preview Structure'
      })
      previewBtn.style.marginRight = '8px'
      previewBtn.addEventListener('click', () => {
        try {
          const structure = JSON.parse(template.structure)
          new StructurePreviewModal(this.app, structure).open()
        } catch (e) {
          new Notice('Invalid structure format')
        }
      })

      // Edit button (for non-default templates)
      if (template.id !== 'default') {
        const editBtn = templateDiv.createEl('button', {
          text: 'Edit Template'
        })
        editBtn.addEventListener('click', () => {
          new TemplateEditModal(
            this.app,
            template,
            async (updatedTemplate: FolderTemplate) => {
              // Save the updated template
              const templateIndex =
                this.plugin.settings.folderTemplates.findIndex(
                  (t) => t.id === updatedTemplate.id
                )

              if (templateIndex >= 0) {
                this.plugin.settings.folderTemplates[templateIndex] =
                  updatedTemplate
                await this.plugin.saveSettings()
                this.display()
              }
            }
          ).open()
        })
      }
    })

    // Button to add a new template
    const addTemplateBtn = containerEl.createEl('button', {
      text: '+ Add New Template',
      cls: 'mod-cta'
    })
    addTemplateBtn.style.marginBottom = '20px'
    addTemplateBtn.addEventListener('click', () => {
      // Generate unique ID
      const newId = 'template_' + Date.now()

      // Create basic template
      const newTemplate = {
        id: newId,
        name: 'New Template',
        description: 'A custom folder structure',
        isEnabled: true,
        structure: JSON.stringify({
          _Journal: {
            y_$YEAR$: {
              $MONTH$: {}
            }
          },
          Templates: {}
        })
      }

      // Open edit modal immediately
      new TemplateEditModal(
        this.app,
        newTemplate,
        async (template: FolderTemplate) => {
          // Add the new template
          this.plugin.settings.folderTemplates.push(template)
          await this.plugin.saveSettings()
          this.display()
        }
      ).open()
    })

    new Setting(containerEl)
      .setName('Help')
      .setDesc('Open the help documentation')
      .addButton((btn) =>
        btn.setButtonText('Open Help').onClick(() => {
          new HelpModal(this.app).open()
        })
      )
  }
}
