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
  BASE_FOLDERS,
  createDailyNoteContent,
  migrateExistingDailyNotes
} from './utils/folderUtils'
import { parseDate } from './utils/momentHelper'
import {
  migrateFolderStructure,
  FolderStructureType,
  detectFolderStructureType,
  ensureArchiveFolder
} from './utils/migrationUtils'

// Fix moment import
const momentInstance = (window as any).moment || moment

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
      text: `Essential plugin folders are missing. Would you like to regenerate the folder structure?`
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

      // Detect current folder structure type if not explicitly set
      if (!this.settings.folderStructureType) {
        this.settings.folderStructureType = await detectFolderStructureType(
          this.app.vault
        )
        await this.saveSettings()
      }

      // Ensure folder structure is using VAULT_ROOT type
      console.log(`Ensuring folders use vault root structure...`)

      this.settings.folderStructureType = FolderStructureType.VAULT_ROOT
      await this.saveSettings()

      const migrationLog = await migrateFolderStructure(
        this.app,
        FolderStructureType.VAULT_ROOT,
        true, // preserve files
        this.settings.alwaysEnsureArchive
      )

      // Log migration results
      migrationLog.forEach((entry) => console.log(entry))

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
          // No active leaf, but we can still create a note without linking
          createLinkedNote(this, null)
          return
        }

        // Get editor from MarkdownView
        const view = activeLeaf.view
        if (!view) {
          // No active view, but we can still create a note without linking
          createLinkedNote(this, null)
          return
        }

        // Check if it's a markdown view with an editor
        const markdownView = view as any
        if (!markdownView.editor) {
          // No markdown editor, but we can still create a note without linking
          createLinkedNote(this, null)
          return
        }

        // Create linked note with the editor
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
    // Check every 5 seconds for essential folders
    this.registerInterval(
      window.setInterval(async () => {
        try {
          // Check for critical folders in the vault root
          const templatesExists = await this.app.vault.adapter.exists(
            BASE_FOLDERS.TEMPLATES
          )
          const journalExists = await this.app.vault.adapter.exists(
            BASE_FOLDERS.JOURNAL
          )

          // If both essential folders are missing, prompt for regeneration
          if (!templatesExists && !journalExists) {
            console.debug(
              `Essential plugin folders not found, prompting for regeneration`
            )
            new ConfirmationModal(this.app, async () => {
              try {
                await ensureFolderStructure(this.app, this.settings)
                const newLocation = await updateDailyNotesLocation(this.app)
                this.settings.dailyNotesLocation = newLocation
                await this.saveSettings()
                new Notice(`Essential folder structure has been regenerated`)
              } catch (error) {
                console.error('Error regenerating folder structure:', error)
                new Notice('Failed to regenerate folder structure')
              }
            }).open()
          }
        } catch (error) {
          console.error('Error checking essential folders:', error)
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
      callback: async () => {
        console.debug('Create linked note command triggered')
        // Get active editor if available
        const activeLeaf = this.app.workspace.activeLeaf
        if (activeLeaf?.view && (activeLeaf.view as any).editor) {
          const editor = (activeLeaf.view as any).editor
          await createLinkedNote(this, editor)
        } else {
          // Create note without linking
          await createLinkedNote(this, null)
        }
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

  async enhanceDailyNote(file: TFile) {
    try {
      // Check if the file already has previous/next links
      const content = await this.app.vault.read(file)
      if (content.includes("previous: ''") || content.includes("next: ''")) {
        return
      }

      // Parse the date from the file name
      const date = parseDate(file.basename.match(/^(\d{4}-\d{2}-\d{2})/)![1])
      if (!date.isValid()) {
        console.debug('Invalid date format in file name:', file.basename)
        return
      }

      // Create enhanced content with links
      const enhancedContent = await createDailyNoteContent(
        this.app,
        file.basename,
        date
      )

      // Update the file with enhanced content
      await this.app.vault.modify(file, enhancedContent)
    } catch (error) {
      console.error('Error enhancing daily note:', error)
    }
  }

  registerDailyNotesLocationCheck() {
    if (this.folderCheckInterval) {
      window.clearInterval(this.folderCheckInterval)
    }

    if (!this.settings.autoUpdateMonthlyFolders) {
      console.debug('Automatic monthly folder updates disabled in settings')
      return
    }

    let currentMonth = new Date().getMonth()

    const getNextCheckDelay = () => {
      const baseInterval = this.settings.checkIntervalMinutes * 60 * 1000
      const variance = this.settings.checkIntervalVariance * 60 * 1000
      const randomVariance = Math.floor(Math.random() * variance * 2) - variance
      return baseInterval + randomVariance
    }

    const scheduleNextCheck = async () => {
      try {
        if (!this.settings.autoUpdateMonthlyFolders) return

        const now = new Date()
        const nowMonth = now.getMonth()

        if (nowMonth !== currentMonth) {
          console.debug('Month changed, updating daily notes location')
          currentMonth = nowMonth

          const newLocation = await updateDailyNotesLocation(this.app)
          await this.saveSettings()

          new Notice(
            `Daily notes location updated for ${now.toLocaleString('default', {
              month: 'long'
            })}`
          )
        }

        // Schedule next check with random variance
        this.folderCheckInterval = window.setTimeout(
          scheduleNextCheck,
          getNextCheckDelay()
        )
        this.registerInterval(this.folderCheckInterval)
      } catch (error) {
        console.error('Error in daily notes location check:', error)
        // Retry on error after base interval
        this.folderCheckInterval = window.setTimeout(
          scheduleNextCheck,
          this.settings.checkIntervalMinutes * 60 * 1000
        )
        this.registerInterval(this.folderCheckInterval)
      }
    }

    // Start the first check
    scheduleNextCheck()
  }

  /**
   * Migrates to the specified folder structure type
   */
  async migrateToFolderStructure(
    targetType: FolderStructureType
  ): Promise<void> {
    // Update the setting
    this.settings.folderStructureType = targetType
    await this.saveSettings()

    // Perform the migration
    const migrationLog = await migrateFolderStructure(
      this.app,
      targetType,
      true, // preserve files
      this.settings.alwaysEnsureArchive
    )

    // Log migration results
    migrationLog.forEach((entry) => console.log(entry))

    // Show success notice
    new Notice(`Migration to ${targetType} folder structure complete`)
  }

  /**
   * Applies the selected template structure immediately
   */
  async applySelectedTemplate(): Promise<void> {
    console.log(
      `Applying template structure for template: ${this.settings.activeTemplateId}`
    )

    try {
      // Ensure folder structure is updated with the selected template
      await ensureFolderStructure(this.app, this.settings)

      // Show success notice
      new Notice(
        `Template "${this.settings.activeTemplateId}" applied successfully`
      )
    } catch (error) {
      console.error('Error applying template:', error)
      new Notice(`Error applying template: ${error.message}`)
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

    // Link Processing Section
    containerEl.createEl('h3', { text: 'Link Processing' })

    new Setting(containerEl)
      .setName('Hugo-compatible links')
      .setDesc(
        'Ensure links are processed in a way that works with Hugo and other static site generators'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.hugoCompatibleLinks)
          .onChange(async (value) => {
            this.plugin.settings.hugoCompatibleLinks = value
            await this.plugin.saveSettings()
          })
      )

    // Daily Notes Management Section
    containerEl.createEl('h3', { text: 'Daily Notes Management' })

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
      .setDesc(
        'Base interval for checking month changes (a random variance will be added to prevent system load spikes)'
      )
      .addSlider((slider) =>
        slider
          .setLimits(15, 240, 15)
          .setValue(this.plugin.settings.checkIntervalMinutes)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.checkIntervalMinutes = value
            await this.plugin.saveSettings()
            this.plugin.registerDailyNotesLocationCheck()
          })
      )

    new Setting(containerEl)
      .setName('Check interval variance (minutes)')
      .setDesc(
        'Random variance added to check interval (±minutes) to prevent system load spikes'
      )
      .addSlider((slider) =>
        slider
          .setLimits(1, 15, 1)
          .setValue(this.plugin.settings.checkIntervalVariance)
          .setDynamicTooltip()
          .onChange(async (value) => {
            this.plugin.settings.checkIntervalVariance = value
            await this.plugin.saveSettings()
            this.plugin.registerDailyNotesLocationCheck()
          })
      )

    // Folder Structure Templates Section
    containerEl.createEl('h3', { text: 'Folder Structure Templates' })
    containerEl.createEl('p', {
      text: 'Configure folder structure templates. These work independently of Templater and other template plugins.'
    })

    // Template selection
    new Setting(containerEl)
      .setName('Active Template')
      .setDesc('Choose which folder structure template to use')
      .addDropdown((dropdown) => {
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

    // Display each template with enable/disable toggle and preview button
    const templateContainer = containerEl.createDiv(
      'template-settings-container'
    )

    this.plugin.settings.folderTemplates.forEach((template) => {
      const templateDiv = templateContainer.createDiv('template-item')
      templateDiv.style.border = '1px solid var(--background-modifier-border)'
      templateDiv.style.borderRadius = '4px'
      templateDiv.style.padding = '10px'
      templateDiv.style.marginBottom = '10px'

      const header = templateDiv.createDiv('template-header')
      header.style.display = 'flex'
      header.style.justifyContent = 'space-between'
      header.style.alignItems = 'center'
      header.style.marginBottom = '8px'

      header.createEl('h4', { text: template.name })
      templateDiv.createEl('p', { text: template.description })

      // Preview button
      const previewBtn = templateDiv.createEl('button', {
        text: 'Preview Structure'
      })
      previewBtn.addEventListener('click', () => {
        try {
          const structure = JSON.parse(template.structure)
          new StructurePreviewModal(this.app, structure).open()
        } catch (e) {
          new Notice('Invalid structure format')
        }
      })
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
