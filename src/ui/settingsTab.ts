/**
 * Algorithms for SettingsTab:
 *
 * - display():
 *   1. Clear the settings container.
 *   2. Add a header and description.
 *   3. Add the Daily Notes Integration section by calling addDailyNotesIntegrationSettings.
 *   4. Add the Core Settings section by calling addCoreSettings.
 *   5. Add the Journal Template Settings section by calling addJournalTemplateSettings.
 *
 * - addCoreSettings(containerEl):
 *   1. Add a setting for the base folder, with a text input and a "/" prefix.
 *   2. For each optional folder (Workspace, Reference), add a toggle to include/exclude it in the directory structure.
 *   3. Add a button to rebuild the journal directory structure, showing an alert on success or error.
 *   4. Add journal settings (year/month/daily note formats) by calling addJournalSettings.
 *
 * - addJournalSettings(containerEl):
 *   1. Add a text input for year folder format.
 *   2. Add a text input for month folder format.
 *   3. Add a text input for daily note filename format.
 *
 * - addJournalTemplateSettings(containerEl):
 *   1. Add a header for template settings.
 *   2. Add a text input for the daily note template location.
 *   3. Add a button to set up templates, showing an alert on success or error, and checking for the Templater plugin.
 *
 * - addDailyNotesIntegrationSettings(containerEl):
 *   1. Add a header and description for Daily Notes integration.
 *   2. Add a toggle to enable/disable integration, which backs up or restores settings and shows status.
 *   3. Add a button to reapply integration settings, showing status on success or error.
 *   4. If a backup exists, display backup information.
 *
 * - showStatus(containerEl, message, success):
 *   1. Create a div to display a status message, styled according to success or error.
 */

import { PluginSettingTab, App, Setting } from 'obsidian'
import LinkPlugin from '../main'

export class SettingsTab extends PluginSettingTab {
  plugin: LinkPlugin

  constructor(app: App, plugin: LinkPlugin) {
    super(app, plugin)
    this.plugin = plugin
  }

  display(): void {
    const { containerEl } = this
    containerEl.empty()

    // Add description without heading
    containerEl.createEl('p', {
      text: 'Simple journal management settings',
      cls: 'setting-item-description'
    })

    // Plugin Enable/Disable section
    new Setting(containerEl)
      .setName('Plugin Status')
      .setHeading();
    this.addPluginStatusSettings(containerEl)

    // Daily Notes Integration section
    new Setting(containerEl)
      .setName('Daily Notes Integration')
      .setHeading();
    this.addDailyNotesIntegrationSettings(containerEl)

    // Core Settings section
    new Setting(containerEl)
      .setName('Core Settings')
      .setHeading();
    this.addCoreSettings(containerEl)

    // Journal Template Settings section
    new Setting(containerEl)
      .setName('Journal Template Settings')
      .setHeading();
    this.addJournalTemplateSettings(containerEl)
  }

  private addPluginStatusSettings(containerEl: HTMLElement): void {
    // Plugin Enable/Disable Toggle
    new Setting(containerEl)
      .setName('Enable Plugin')
      .setDesc('Enable or disable the journal management plugin. When disabled, no folder structure or integration operations will be performed.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enabled)
          .onChange(async (value) => {
            this.plugin.settings.enabled = value
            await this.plugin.saveSettings()
            
            if (value) {
              // If enabling, perform the operations that would normally happen on load
              try {
                await this.plugin.directoryManager.rebuildDirectoryStructure()
                await this.plugin.journalManager.checkAndCreateCurrentMonthFolder()
                await this.plugin.updateDailyNotesSettings()
                this.plugin.errorHandler.showNotice(
                  '✅ Plugin enabled - Journal management features are now active!'
                )
              } catch (error) {
                this.plugin.errorHandler.handleError(
                  error,
                  'Failed to initialize plugin after enabling'
                )
              }
            } else {
              this.plugin.errorHandler.showNotice(
                '⚠️ Plugin disabled - Journal management features are now inactive'
              )
            }
          })
      )

    // Ribbon Button Toggle
    new Setting(containerEl)
      .setName('Show Ribbon Button')
      .setDesc('Show or hide the Link settings button in the ribbon. When hidden, you can still access settings through the Community Plugins menu.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.showRibbonButton)
          .onChange(async (value) => {
            this.plugin.settings.showRibbonButton = value
            await this.plugin.saveSettings()
            
            // Update ribbon to reflect the change
            this.plugin.ribbonManager.updateButtonStates()
            
            if (value) {
              this.plugin.errorHandler.showNotice(
                '✅ Ribbon button is now visible'
              )
            } else {
              this.plugin.errorHandler.showNotice(
                '⚠️ Ribbon button is now hidden. Access settings via Community Plugins menu.'
              )
            }
          })
      )
  }

  private addCoreSettings(containerEl: HTMLElement): void {
    // Base Folder
    new Setting(containerEl)
      .setName('Base Folder')
      .setDesc('Root folder for journal content (empty = vault root)')
      .addText((text) =>
        text
          .setPlaceholder('Link')
          .setValue(this.plugin.settings.baseFolder)
          .onChange(async (value) => {
            // Allow empty string for root
            this.plugin.settings.baseFolder = value.trim()
            await this.plugin.saveSettings()
            this.display() // Refresh the UI to reflect the new value
          })
      )
      .then((setting) => {
        // Add "/" prefix to show it's a path
        const textComponent = setting.components[0] as any
        if (textComponent && textComponent.inputEl) {
          const input = textComponent.inputEl
          const wrapper = input.parentElement
          if (wrapper) {
            const prefix = wrapper.createSpan({ text: '/', cls: 'path-prefix' })
            wrapper.insertBefore(prefix, input)
            prefix.style.marginRight = '2px'
            prefix.style.opacity = '0.6'
          }
        }
      })

    // Optional Folders (except templates)
    const optionalFolders = [
      { name: 'Workspace', key: 'workspace' },
      { name: 'Reference', key: 'reference' }
    ]
    optionalFolders.forEach((folder) => {
      new Setting(containerEl)
        .setName(`${folder.name} Folder`)
        .setDesc(
          `Create a ${folder.name.toLowerCase()} folder alongside journal`
        )
        .addToggle((toggle) => {
          const enabled = this.plugin.settings.directoryStructure.includes(
            folder.key
          )
          toggle.setValue(enabled).onChange(async (value) => {
            const dirs = this.plugin.settings.directoryStructure.filter(
              (d: string) => d !== folder.key
            )
            if (value) dirs.push(folder.key)
            this.plugin.settings.directoryStructure = dirs
            await this.plugin.saveSettings()
          })
        })
    })

    // Rebuild Directory Structure
    new Setting(containerEl)
      .setName('Rebuild Journal Structure')
      .setDesc('Recreate the journal folder structure')
      .addButton((button) =>
        button.setButtonText('Rebuild').onClick(async () => {
          try {
            await this.plugin.directoryManager.rebuildDirectoryStructure()
            // Show results via alert as requested
            alert(
              '✅ Journal structure rebuilt successfully!\n\nJournal folder structure has been recreated in: ' +
                this.plugin.settings.baseFolder
            )
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error)
            alert(
              '❌ Failed to rebuild journal structure.\n\nError: ' +
                errorMessage
            )
            this.plugin.errorHandler.handleError(
              error,
              'Failed to rebuild journal structure'
            )
          }
        })
      )

    // Journal Settings (without Simple Journal Mode toggle)
    this.addJournalSettings(containerEl)

    // Debug Mode Setting
    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable debug logging to console (for troubleshooting)')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.debugMode)
          .onChange(async (value) => {
            this.plugin.settings.debugMode = value
            await this.plugin.saveSettings()
          })
      )
  }

  private addJournalSettings(containerEl: HTMLElement): void {
    // Year Format (always show since Simple Journal Mode is removed)
    new Setting(containerEl)
      .setName('Year Folder Format')
      .setDesc('Format for year folders (YYYY creates "2025")')
      .addText((text) =>
        text
          .setPlaceholder('YYYY')
          .setValue(this.plugin.settings.journalYearFormat)
          .onChange(async (value) => {
            if (value.trim()) {
              this.plugin.settings.journalYearFormat = value.trim()
              await this.plugin.saveSettings()
            }
          })
      )

    // Month Format (always show since Simple Journal Mode is removed)
    new Setting(containerEl)
      .setName('Month Folder Format')
      .setDesc('Format for month folders (MM MMMM creates "07-July")')
      .addText((text) =>
        text
          .setPlaceholder('MM MMMM')
          .setValue(this.plugin.settings.journalMonthFormat)
          .onChange(async (value) => {
            if (value.trim()) {
              this.plugin.settings.journalMonthFormat = value.trim()
              await this.plugin.saveSettings()
            }
          })
      )

    // Daily Note Format
    new Setting(containerEl)
      .setName('Daily Note Format')
      .setDesc('Format for daily note filenames')
      .addText((text) =>
        text
          .setPlaceholder('YYYY-MM-DD dddd')
          .setValue(this.plugin.settings.journalDateFormat)
          .onChange(async (value) => {
            if (value.trim()) {
              this.plugin.settings.journalDateFormat = value.trim()
              await this.plugin.saveSettings()
            }
          })
      )
  }

  private addJournalTemplateSettings(containerEl: HTMLElement): void {

    // Daily Note Template Location
    new Setting(containerEl)
      .setName('Daily Note Template Location')
      .setDesc(
        'Override the default template path (e.g. "templates/Daily Notes Template.md")'
      )
      .addText((text) =>
        text
          .setPlaceholder('templates/Daily Notes Template.md')
          .setValue(this.plugin.settings.customTemplateLocation || '')
          .onChange(async (value) => {
            this.plugin.settings.customTemplateLocation = value.trim()
            await this.plugin.saveSettings()
          })
      )

    // Setup Templates
    new Setting(containerEl)
      .setName('Setup Templates')
      .setDesc(
        'Create templates directory alongside journal and copy Daily Notes template (works with Templater plugin)'
      )
      .addButton((button) =>
        button.setButtonText('Setup Templates').onClick(async () => {
          try {
            await this.plugin.directoryManager.setupTemplates()
            const templatesPath = this.plugin.settings.baseFolder
              ? `${this.plugin.settings.baseFolder}/templates`
              : 'templates'
            // Check if Templater is available for user feedback
            // @ts-ignore - Access Obsidian's plugin system
            const templaterPlugin = (this.plugin.app as any).plugins?.plugins?.[
              'templater-obsidian'
            ]
            const hasTemplater = templaterPlugin && templaterPlugin._loaded
            const templaterStatus = hasTemplater
              ? '\n\n✅ Templater plugin detected - Template will work with dynamic dates'
              : '\n\n⚠️ Templater plugin not detected - Template contains Templater syntax that may not render'
            alert(
              '✅ Templates setup successfully!\n\nTemplates directory created alongside journal at: ' +
                templatesPath +
                templaterStatus
            )
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error)
            alert('❌ Failed to setup templates.\n\nError: ' + errorMessage)
            this.plugin.errorHandler.handleError(
              error,
              'Failed to setup templates'
            )
          }
        })
      )
  }

  /**
   * Adds Daily Notes integration settings with backup and restore functionality
   */
  private addDailyNotesIntegrationSettings(containerEl: HTMLElement): void {
    containerEl.createEl('p', {
      text: "Control how this plugin integrates with Obsidian's Daily Notes plugin. Your original settings will be backed up automatically.",
      cls: 'setting-item-description'
    })

    // Single toggle that handles backup/restore automatically
    new Setting(containerEl)
      .setDesc(
        'Automatically backup and apply Daily Notes plugin settings to use our folder structure'
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.dailyNotesIntegration.enabled)
          .onChange(async (value) => {
            try {
              if (value) {
                // Enable: Create backup and apply settings
                await this.plugin.updateDailyNotesSettings()
                this.plugin.settings.dailyNotesIntegration.enabled = true
                // this.showStatus(
                //   containerEl,
                //   '✅ Daily Notes integration enabled! Your original settings have been backed up.',
                //   true
                // )
                this.plugin.errorHandler.showSuccess('✅ Daily Notes integration enabled! Your original settings have been backed up.')
              } else {
                // Disable: Restore from backup
                await this.plugin.restoreDailyNotesSettings()
                this.plugin.settings.dailyNotesIntegration.enabled = false
                // this.showStatus(
                //   containerEl,
                //   '✅ Daily Notes integration disabled! Your original settings have been restored.',
                //   true
                // )
                this.plugin.errorHandler.showSuccess('✅ Daily Notes integration disabled! Your original settings have been restored.')
              }
              await this.plugin.saveSettings()
            } catch (error) {
              const errorMessage =
                error instanceof Error ? error.message : String(error)
              this.showStatus(
                containerEl,
                '❌ Failed to ' +
                  (value ? 'enable' : 'disable') +
                  ' integration. ' +
                  errorMessage,
                false
              )
              this.plugin.errorHandler.handleError(
                error,
                'Failed to ' +
                  (value ? 'enable' : 'disable') +
                  ' Daily Notes integration'
              )
              // Revert toggle state on error
              toggle.setValue(!value)
            }
          })
      )

    // Remove <hr> from here (was: containerEl.createEl('hr'))
    new Setting(containerEl)
      .setName('Reapply Integration Settings')
      .setDesc('Reapply the integration settings to Daily Notes plugin')
      .addButton((button) =>
        button.setButtonText('Reapply').onClick(async () => {
          try {
            await this.plugin.updateDailyNotesSettings()
            // this.showStatus(
            //   containerEl,
            //   '✅ Daily Notes integration settings reapplied successfully!',
            //   true
            // )
            this.plugin.errorHandler.showSuccess('✅ Daily Notes integration settings reapplied successfully!')
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error)
            this.showStatus(
              containerEl,
              '❌ Failed to reapply integration settings. ' + errorMessage,
              false
            )
            this.plugin.errorHandler.handleError(
              error,
              'Failed to reapply Daily Notes integration'
            )
          }
        })
      )

    // Backup info (always visible if backup exists, but NO <hr> before it)
    const backup = this.plugin.settings.dailyNotesIntegration.backup
    if (backup) {
      const backupDate = new Date(backup.timestamp).toLocaleString()
      new Setting(containerEl)
        .setName('📦 Backup Information')
        .setDesc(`Backup created: ${backupDate} (${backup.pluginType} plugin)`)
    }
  }

  // Helper to show status/feedback message
  private showStatus(
    containerEl: HTMLElement,
    message: string,
    success: boolean
  ) {
    const status = containerEl.createDiv({ cls: 'setting-item-info' })
    status.style.marginTop = '12px'
    status.style.marginBottom = '12px'
    status.style.color = success ? 'var(--text-success)' : 'var(--text-error)'
    status.style.fontWeight = 'bold'
    status.innerText = message
  }
}
