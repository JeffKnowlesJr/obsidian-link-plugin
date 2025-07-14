import { TFolder, normalizePath } from 'obsidian'
import LinkPlugin from '../main'
import {
  DEFAULT_DIRECTORIES,
  DEFAULT_JOURNAL_STRUCTURE,
  DEFAULT_TEMPLATES_PATH,
  DAILY_NOTES_TEMPLATE_NAME
} from '../constants'
import { PathUtils } from '../utils/pathUtils'
import { DirectoryTemplate } from '../types'
import { DateService } from '../services/dateService'
import { DebugUtils } from '../utils/debugUtils'

/**
 * Algorithm for DirectoryManager:
 * 
 * - rebuildDirectoryStructure():
 *   1. Retrieve the vault and settings from the plugin.
 *   2. Normalize the baseFolder path; if not set, use the vault root.
 *   3. If basePath is not empty, create the base directory.
 *   4. For each directory in directoryStructure (except 'templates'):
 *      a. Join the basePath and directory name.
 *      b. Create the directory if it doesn't exist.
 *   5. Always call createJournalStructure(basePath).
 *   6. Catch and throw errors if any step fails.
 * 
 * - createJournalStructure(basePath):
 *   1. Join basePath and 'journal' to get journalPath.
 *   2. Create the journal directory.
 *   3. If simpleJournalMode is false:
 *      a. Get the current date.
 *      b. Format the year and month.
 *      c. Create year and month subdirectories under journalPath.
 * 
 * - setupTemplates():
 *   1. Get baseFolder from settings.
 *   2. Join baseFolder and DEFAULT_TEMPLATES_PATH to get templatesPath.
 *   3. Create the templates directory.
 *   4. Join templatesPath and DAILY_NOTES_TEMPLATE_NAME to get templateFilePath.
 *   5. If the template file does not exist:
 *      a. Get the template content.
 *      b. Create the template file.
 *   6. Otherwise, do nothing.
 * 
 * - getDailyNotesTemplateContent():
 *   1. Return a static string containing the daily notes template with Templater syntax.
 * 
 * - getJournalPath():
 *   1. Get baseFolder from settings.
 *   2. Return the joined path of baseFolder and 'journal', or just 'journal' if baseFolder is empty.
 * 
 * - getOrCreateDirectory(path):
 *   1. Normalize the input path.
 *   2. If the folder exists and is a TFolder, return it.
 *   3. Otherwise, split the path and iterate through each part:
 *      a. Build up the current path.
 *      b. If the folder does not exist, create it.
 *      c. If the path exists but is not a folder, throw an error.
 *   4. Return the created or found TFolder.
 */

export class DirectoryManager {
  plugin: LinkPlugin

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin
  }

  /**
   * Creates the base directory structure according to settings
   * All directories are created under the configured baseFolder to prevent collisions
   */
  async rebuildDirectoryStructure(): Promise<void> {
    const { vault } = this.plugin.app
    const { baseFolder, directoryStructure } = this.plugin.settings

    try {
      // Create the base folder first (if not root)
      const basePath = baseFolder ? normalizePath(baseFolder) : ''
      if (basePath) {
        await this.getOrCreateDirectory(basePath)
        DebugUtils.log(`Created base directory: ${basePath}`)
      } else {
        DebugUtils.log('Using vault root as base directory')
      }

      // Only create folders that are toggled on (in directoryStructure)
      for (const dirName of directoryStructure || ['journal']) {
        // Never create templates folder here
        if (dirName === 'templates') continue
        // Only create reference or workspace if toggled on
        const dirPath = basePath
          ? PathUtils.joinPath(basePath, dirName)
          : dirName
        await this.getOrCreateDirectory(dirPath)
        DebugUtils.log(`Created directory: ${dirPath}`)

      }

      // Always create journal structure (only journal folder needed)
      await this.createJournalStructure(basePath)
    } catch (error) {
      throw new Error(`Failed to rebuild directory structure: ${error}`)
    }
  }

  /**
   * Creates journal structure - simple or dynamic based on single setting
   */
  async createJournalStructure(basePath: string): Promise<void> {
    const journalPath = PathUtils.joinPath(basePath, 'journal')

    // Always create the basic journal directory
    await this.getOrCreateDirectory(journalPath)
    DebugUtils.log(`Created journal directory: ${journalPath}`)

    // Only create complex structure if simple mode is disabled
    if (!this.plugin.settings.simpleJournalMode) {
      // Create CURRENT YEAR/MONTH structure using proper format
      const currentDate = DateService.now()
      const currentYear = DateService.format(currentDate, 'YYYY')
      const currentMonth = DateService.format(currentDate, 'MM MMMM')

      // Create current year/month folder
      const currentYearPath = PathUtils.joinPath(journalPath, currentYear)
      const currentMonthPath = PathUtils.joinPath(currentYearPath, currentMonth)

      await this.getOrCreateDirectory(currentYearPath)
      await this.getOrCreateDirectory(currentMonthPath)

      DebugUtils.log(`Created current month directory: ${currentMonthPath}`)

      DebugUtils.log('Current month journal structure created')
    }
  }

  /**
   * Creates templates directory and copies the daily notes template when enabled
   * Templates are siblings to journal structure for proper organization
   */
  async setupTemplates(): Promise<void> {
    try {
      const { baseFolder } = this.plugin.settings
      const templatesPath = baseFolder
        ? PathUtils.joinPath(baseFolder, DEFAULT_TEMPLATES_PATH)
        : DEFAULT_TEMPLATES_PATH

      // Create templates directory as sibling to journal
      await this.getOrCreateDirectory(templatesPath)
      DebugUtils.log(`Created templates directory: ${templatesPath}`)

      // Copy daily notes template if it doesn't exist
      const templateFilePath = PathUtils.joinPath(
        templatesPath,
        DAILY_NOTES_TEMPLATE_NAME
      )
      const { vault } = this.plugin.app

      if (!vault.getAbstractFileByPath(templateFilePath)) {
        const templateContent = DirectoryManager.getDailyNotesTemplateContent()
        await vault.create(templateFilePath, templateContent)
        DebugUtils.log(`Created template file: ${templateFilePath}`)
      } else {
        DebugUtils.log(`Template already exists: ${templateFilePath}`)
      }
    } catch (error) {
      throw new Error(`Failed to setup templates: ${error}`)
    }
  }

  /**
   * Gets the daily notes template content from the plugin assets
   * Always returns the raw template with Templater syntax to avoid conflicts
   */
  public static getDailyNotesTemplateContent(): string {
    return `---
previous: '[[<% tp.date.now("YYYY-MM-DD dddd", -1) %>]]'
next: '[[<% tp.date.now("YYYY-MM-DD dddd", 1) %>]]'
tags:
  - ☀️
  - <% tp.date.now("MM-DD dddd") %>
resources: []
---
---
## Log

### Routine Checklist

- [ ] Open Daily Note
- [ ] **Morning Checks**
	- [ ] Bed and Clothes 🛏️🧺
  - [ ] Self Care🛀🧴
  - [ ] Make Breakfast 🍽✨
	- [ ] Pet Care 🐕🚶🏻‍♂️
	- [ ] Get Focused 🖥️💊
  - [ ] Check [Calendar](https://calendar.google.com) 📆
	- [ ] Check [Mail](https://mail.google.com) ✉️ 
  - [ ] Review [[Yearly List]] ✅
	- [ ] Review [July Log](Yearly%20Log.md#July) 🗓️

---`
  }

  /**
   * Returns the full path to the journal directory, respecting baseFolder and settings
   */
  public getJournalPath(): string {
    const { baseFolder } = this.plugin.settings
    // Always use 'journal' as the subfolder
    return baseFolder ? PathUtils.joinPath(baseFolder, 'journal') : 'journal'
  }

  /**
   * Gets a directory path, creating it if it doesn't exist
   * Handles both absolute paths and paths relative to the base folder
   */
  async getOrCreateDirectory(path: string): Promise<TFolder> {
    const { vault } = this.plugin.app
    const normalizedPath = normalizePath(path)
    const existingFolder = vault.getAbstractFileByPath(normalizedPath)

    if (existingFolder instanceof TFolder) {
      return existingFolder
    }

    // Create parent directories recursively
    const pathParts = normalizedPath.split('/')
    let currentPath = ''

    for (const part of pathParts) {
      if (!part) continue

      currentPath += (currentPath ? '/' : '') + part
      const folder = vault.getAbstractFileByPath(currentPath)

      if (!folder) {
        await vault.createFolder(currentPath)
      } else if (!(folder instanceof TFolder)) {
        throw new Error(`Path ${currentPath} exists but is not a folder`)
      }
    }

    return vault.getAbstractFileByPath(normalizedPath) as TFolder
  }
}
