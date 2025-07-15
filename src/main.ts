import { Plugin, TFile, Notice, Modal } from 'obsidian'
import { DEFAULT_SETTINGS, validateSettings } from './settings'
import { LinkPluginSettings } from './types'
import { DirectoryManager } from './managers/directoryManager'
import { DailyNotesManager } from './managers/dailyNotesManager'
import { ErrorHandler } from './utils/errorHandler'
import { RibbonManager } from './ui/ribbonManager'
import { SettingsTab } from './ui/settingsTab'
import { DateService } from './services/dateService'
import { DebugUtils } from './utils/debugUtils'
import { COMMAND_IDS } from './constants'

/**
 * Algorithms used in this plugin:
 * 
 * 1. Initialization Sequence (onload):
 *    - Sequentially initializes services, managers, settings, UI, and event handlers.
 *    - Ensures correct order: DateService → Settings → ErrorHandler → Managers → UI → Commands → Events → Directory Structure → Journal Folders → Daily Notes Integration → Date Monitoring.
 * 
 * 2. Settings Validation and Persistence:
 *    - Loads settings from disk, validates and merges with defaults.
 *    - Saves settings and updates UI state accordingly.
 * 
 * 3. Command Registration:
 *    - Registers a set of commands, each with a callback.
 *    - Each command encapsulates a specific journal management action (e.g., create note, open journal, rebuild structure).
 *    - Error handling is wrapped around each command.
 * 
 * 4. Event Handling:
 *    - Listens for file creation and modification events.
 *    - On creation, checks if the file is a journal file and updates links.
 *    - On modification, logs debug info if enabled.
 * 
 * 5. Date Input Modal (promptForDate):
 *    - Presents a modal dialog for date input.
 *    - Handles user input, keyboard shortcuts, and resolves with the selected date or null.
 * 
 * 6. Date Change Monitoring:
 *    - Periodically (hourly) checks if the month has changed.
 *    - If so, creates the new monthly folder, updates Daily Notes settings, and notifies the user.
 * 
 * 7. Daily Notes Plugin Integration:
 *    - Detects and updates settings for either the core or community Daily Notes plugin.
 *    - Backs up original settings before overwriting.
 *    - Restores settings from backup if requested.
 * 
 * 8. Backup/Restore Algorithm:
 *    - On first integration, saves a backup of the current Daily Notes settings.
 *    - On restore, applies the backup and disables integration.
 * 
 * 9. Cleanup (onunload):
 *    - Cleans up managers and UI elements on plugin unload.
 */

export default class LinkPlugin extends Plugin {
  settings!: LinkPluginSettings
  directoryManager!: DirectoryManager
  dailyNotesManager!: DailyNotesManager
  errorHandler!: ErrorHandler
  ribbonManager!: RibbonManager

  async onload() {
    // Algorithm 1: Initialization Sequence
    DebugUtils.initialize(this)
    DebugUtils.log('Loading DateFolders for DailyNotes v2.2.0 - Pure Date-Based Organization...')

    try {
      DateService.initialize()
      await this.loadSettings()
      this.errorHandler = new ErrorHandler(this)
      this.directoryManager = new DirectoryManager(this)
      this.dailyNotesManager = new DailyNotesManager(this)
      this.ribbonManager = new RibbonManager(this)
      this.addSettingTab(new SettingsTab(this.app, this))
      this.ribbonManager.initializeRibbon()
      this.registerCommands()
      this.registerEventHandlers()
      
      // Only perform directory structure and integration operations if plugin is enabled
      if (this.settings.enabled) {
        await this.directoryManager.rebuildDirectoryStructure()
        await this.dailyNotesManager.checkAndCreateCurrentMonthFolder()
        
        // Update Daily Notes settings
        if (this.settings.dailyNotesIntegration.enabled) {
          await this.updateDailyNotesSettings()
        }
        
        this.startDateChangeMonitoring()
        const debugInfo = DateService.getDebugInfo()
        DebugUtils.log('DateService initialized:', debugInfo)
        DebugUtils.log('Today:', DateService.today())
        DebugUtils.log('Current month:', DateService.currentMonth())
        this.errorHandler.showNotice(
          'Obsidian Link Journal loaded - Pure journal management ready!'
        )
        DebugUtils.log('Obsidian Link Journal loaded successfully - Core journal functionality enabled')
      } else {
        DebugUtils.log('Obsidian Link Journal loaded - Plugin disabled, no operations performed')
        this.errorHandler.showNotice(
          'Obsidian Link Journal loaded - Plugin is disabled. Enable it in settings to start using journal management features.'
        )
      }
    } catch (error) {
      DebugUtils.error('Failed to load Link Plugin:', error)
      if (this.errorHandler) {
        this.errorHandler.handleError(error, 'Plugin initialization failed')
      }
    }
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    if (!loadedData || Object.keys(loadedData).length === 0) {
      // First run: use defaults and save them
      this.settings = { ...DEFAULT_SETTINGS };
      await this.saveSettings();
    } else {
      // Merge loaded settings with defaults for any missing values
      this.settings = validateSettings({ ...DEFAULT_SETTINGS, ...loadedData });
    }
  }

  async saveSettings() {
    // Algorithm 2: Settings Validation and Persistence (save)
    await this.saveData(this.settings)
    if (this.ribbonManager) {
      this.ribbonManager.updateButtonStates()
    }
  }

  registerCommands() {
    // Algorithm 3: Command Registration

    // Rebuild directory structure command
    this.addCommand({
      id: COMMAND_IDS.REBUILD_DIRECTORY,
      name: 'Rebuild Directory Structure',
      callback: () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          this.directoryManager.rebuildDirectoryStructure()
        } catch (error) {
          this.errorHandler.handleError(
            error,
            'Failed to rebuild directory structure'
          )
        }
      }
    })

    // Open today's journal command
    this.addCommand({
      id: COMMAND_IDS.OPEN_TODAY_JOURNAL,
      name: "Open Today's Journal",
      callback: () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          this.dailyNotesManager.openTodayDailyNote()
        } catch (error) {
          this.errorHandler.handleError(error, "Failed to open today's journal")
        }
      }
    })

    // Create today's note command
    this.addCommand({
      id: COMMAND_IDS.CREATE_TODAY_NOTE,
      name: "Create Today's Daily Note",
      callback: async () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          const file = await this.dailyNotesManager.createTodayNote()
          const leaf = this.app.workspace.getLeaf()
          await leaf.openFile(file)
        } catch (error) {
          this.errorHandler.handleError(error, "Failed to create today's note")
        }
      }
    })

    // Create future note command
    this.addCommand({
      id: COMMAND_IDS.CREATE_FUTURE_NOTE,
      name: 'Create Future Daily Note',
      callback: async () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          const dateInput = await this.promptForDate()
          if (dateInput) {
            const file = await this.dailyNotesManager.createFutureDailyNote(
              dateInput
            )
            const leaf = this.app.workspace.getLeaf()
            await leaf.openFile(file)
            this.errorHandler.showNotice(
              `Created future note for ${DateService.format(
                DateService.from(dateInput),
                'YYYY-MM-DD'
              )}`
            )
          }
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create future note')
        }
      }
    })

    // Create monthly folders command
    this.addCommand({
      id: COMMAND_IDS.CREATE_MONTHLY_FOLDERS,
      name: 'Create Monthly Folders for Current Year',
      callback: async () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          const startOfYear = DateService.startOfYear()
          const endOfYear = DateService.endOfYear()
          await this.dailyNotesManager.createMonthlyFoldersForRange(
            startOfYear,
            endOfYear
          )
          this.errorHandler.showNotice(
            'Monthly folders created for current year'
          )
        } catch (error) {
          this.errorHandler.handleError(
            error,
            'Failed to create monthly folders'
          )
        }
      }
    })

    // Show ribbon quick actions (new command)
    this.addCommand({
      id: 'show-ribbon-actions',
      name: 'Show Ribbon Quick Actions',
      callback: () => {
        if (!this.settings.enabled) {
          this.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this command.')
          return
        }
        try {
          this.ribbonManager.showQuickActionsMenu()
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to show ribbon actions')
        }
      }
    })
  }

  registerEventHandlers() {
    // Algorithm 4: Event Handling

    // Listen for journal file creation to update links
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (
          this.settings.enabled &&
          'stat' in file &&
          'basename' in file &&
          'extension' in file &&
          file.path.includes(this.settings.dailyNotesRootFolder)
        ) {
          this.dailyNotesManager.updateDailyNoteLinks(file as TFile)
        }
      })
    )

    // Debug logging for journal-related file modifications
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (
          this.settings.enabled &&
          this.settings.debugMode &&
          file.path.includes(this.settings.dailyNotesRootFolder)
        ) {
          DebugUtils.log('Journal file modified:', file.path)
        }
      })
    )
    // File sorting event handlers removed (focus on core journal management)
  }

  /**
   * Algorithm 5: Date Input Modal
   * Presents a modal dialog for date input, handles user input and keyboard shortcuts.
   */
  private async promptForDate(): Promise<string | null> {
    return new Promise((resolve) => {
      const modal = new Modal(this.app)
      modal.setTitle('Create Future Daily Note')

      const { contentEl } = modal

      contentEl.createEl('p', {
        text: 'Select a date to create a daily note. This will automatically create the required monthly folders.',
        cls: 'modal-description'
      })

      const inputContainer = contentEl.createDiv({
        cls: 'date-input-container'
      })

      const input = inputContainer.createEl('input', {
        type: 'date',
        value: DateService.today(),
        cls: 'date-input'
      })

      contentEl.createDiv({ cls: 'date-picker-spacer' })

      const buttonContainer = contentEl.createDiv({
        cls: 'modal-button-container'
      })

      const createButton = buttonContainer.createEl('button', {
        text: 'Create Note',
        cls: 'mod-cta'
      })

      const cancelButton = buttonContainer.createEl('button', {
        text: 'Cancel'
      })

      const style = document.createElement('style')
      style.textContent = `
        .date-input-container {
          margin: 16px 0;
          position: relative;
          z-index: 1;
        }
        .date-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 4px;
          background: var(--background-primary);
          color: var(--text-normal);
          font-size: 14px;
        }
        .date-picker-spacer {
          height: 40px;
        }
        .modal-button-container {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .modal-description {
          margin-bottom: 16px;
          color: var(--text-muted);
        }
      `
      contentEl.appendChild(style)

      setTimeout(() => input.focus(), 100)

      createButton.onclick = () => {
        const dateValue = input.value
        if (dateValue) {
          modal.close()
          resolve(dateValue)
        }
      }

      cancelButton.onclick = () => {
        modal.close()
        resolve(null)
      }

      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          createButton.click()
        } else if (e.key === 'Escape') {
          cancelButton.click()
        }
      })

      modal.open()
    })
  }

  /**
   * Algorithm 6: Date Change Monitoring
   * Periodically checks if the month has changed and creates new monthly folders as needed.
   */
  private startDateChangeMonitoring(): void {
    let lastCheckedMonth = DateService.format(DateService.now(), 'YYYY-MM')

    this.registerInterval(
      window.setInterval(async () => {
        try {
          // Only perform date monitoring if plugin is enabled
          if (!this.settings.enabled) {
            return
          }
          
          const currentMonth = DateService.format(DateService.now(), 'YYYY-MM')
          if (currentMonth !== lastCheckedMonth) {
            DebugUtils.log(
              `Month changed from ${lastCheckedMonth} to ${currentMonth} - creating new monthly folder`
            )
            await this.dailyNotesManager.checkAndCreateCurrentMonthFolder()
            await this.updateDailyNotesSettings()
            lastCheckedMonth = currentMonth
            const monthName = DateService.format(DateService.now(), 'MMMM YYYY')
            this.errorHandler.showNotice(
              `📅 New month detected: ${monthName} folder created`
            )
          }
        } catch (error) {
          DebugUtils.error('Error in date change monitoring:', error)
        }
      }, 60 * 60 * 1000)
    )

    DebugUtils.log(
      'Date change monitoring started - will auto-create monthly folders'
    )
  }

  /**
   * Algorithm 7: Daily Notes Plugin Integration
   * Updates Obsidian's Daily Notes plugin settings to use our folder structure.
   */
  async updateDailyNotesSettings(): Promise<void> {
    if (!this.settings.dailyNotesIntegration.enabled) {
      return
    }

    try {
      const dailyNotesPlugin = (this.app as any).internalPlugins?.plugins?.[
        'daily-notes'
      ]

      if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        await this.updateCorePluginSettings(dailyNotesPlugin)
      } else {
        const communityDailyNotes = (this.app as any).plugins?.plugins?.[
          'daily-notes'
        ]
        if (communityDailyNotes) {
          await this.updateCommunityPluginSettings(communityDailyNotes)
        } else {
          DebugUtils.log(
            'Daily Notes plugin not found or not enabled - using plugin folder structure only'
          )
        }
      }
    } catch (error) {
      DebugUtils.log(
        'Daily Notes integration skipped:',
        error instanceof Error ? error.message : String(error)
      )
    }
  }

  /**
   * Algorithm 7: Daily Notes Plugin Integration (Core)
   * Updates core Daily Notes plugin settings with backup.
   */
  private async updateCorePluginSettings(dailyNotesPlugin: any): Promise<void> {
    const dailyNotesSettings = dailyNotesPlugin.instance.options

    if (!this.settings.dailyNotesIntegration.backup) {
      await this.createDailyNotesBackup('core', dailyNotesSettings)
    }

    const currentDate = DateService.now()
    const monthlyFolderPath =
      this.dailyNotesManager.getMonthlyFolderPath(currentDate)

    dailyNotesSettings.folder = monthlyFolderPath
    dailyNotesSettings.format = this.settings.dailyNoteDateFormat

    DebugUtils.log(`Updated Core Daily Notes plugin settings`)
    this.errorHandler.showNotice(`✅ Daily Notes settings updated`)
  }

  /**
   * Algorithm 7: Daily Notes Plugin Integration (Community)
   * Updates community Daily Notes plugin settings with backup.
   */
  private async updateCommunityPluginSettings(
    communityDailyNotes: any
  ): Promise<void> {
    if (!this.settings.dailyNotesIntegration.backup) {
      await this.createDailyNotesBackup(
        'community',
        communityDailyNotes.settings
      )
    }

    const currentDate = DateService.now()
    const monthlyFolderPath =
      this.dailyNotesManager.getMonthlyFolderPath(currentDate)

    communityDailyNotes.settings.folder = monthlyFolderPath
    communityDailyNotes.settings.format = this.settings.dailyNoteDateFormat

    await communityDailyNotes.saveSettings()
    DebugUtils.log(`Updated Community Daily Notes plugin settings`)
    this.errorHandler.showNotice(`✅ Daily Notes settings updated`)
  }

  /**
   * Algorithm 8: Backup/Restore Algorithm (Backup)
   * Creates a backup of current Daily Notes settings.
   */
  private async createDailyNotesBackup(
    pluginType: 'core' | 'community',
    currentSettings: any
  ): Promise<void> {
    this.settings.dailyNotesIntegration.backup = {
      timestamp: new Date().toISOString(),
      pluginType,
      originalSettings: { ...currentSettings }
    }

    await this.saveSettings()
    DebugUtils.log(`Created Daily Notes backup for ${pluginType} plugin`)
  }

  /**
   * Algorithm 8: Backup/Restore Algorithm (Restore)
   * Restores Daily Notes settings from backup.
   */
  async restoreDailyNotesSettings(): Promise<void> {
    const backup = this.settings.dailyNotesIntegration.backup
    if (!backup) {
      this.errorHandler.showNotice('❌ No backup found to restore')
      return
    }

    try {
      if (backup.pluginType === 'core') {
        const dailyNotesPlugin = (this.app as any).internalPlugins?.plugins?.[
          'daily-notes'
        ]
        if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
          Object.assign(
            dailyNotesPlugin.instance.options,
            backup.originalSettings
          )
          DebugUtils.log('Restored Core Daily Notes settings from backup')
        }
      } else {
        const communityDailyNotes = (this.app as any).plugins?.plugins?.[
          'daily-notes'
        ]
        if (communityDailyNotes) {
          Object.assign(communityDailyNotes.settings, backup.originalSettings)
          await communityDailyNotes.saveSettings()
          DebugUtils.log('Restored Community Daily Notes settings from backup')
        }
      }

      this.settings.dailyNotesIntegration.enabled = false
      this.settings.dailyNotesIntegration.backup = null

      await this.saveSettings()
      this.errorHandler.showNotice(
        '✅ Daily Notes settings restored from backup'
      )
    } catch (error) {
      this.errorHandler.handleError(
        error,
        'Failed to restore Daily Notes settings'
      )
    }
  }

  /**
   * Algorithm 9: Cleanup
   * Cleans up managers and UI elements on plugin unload.
   */
  onunload() {
    DebugUtils.log('Obsidian Link Journal unloaded')

    if (this.ribbonManager) {
      this.ribbonManager.cleanup()
    }
  }
}
