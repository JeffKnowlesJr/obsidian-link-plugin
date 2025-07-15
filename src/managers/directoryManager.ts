import { TFolder, normalizePath } from 'obsidian'
import LinkPlugin from '../main'
import {
  DEFAULT_DIRECTORIES,
  DEFAULT_JOURNAL_STRUCTURE
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
        // Only create journal folder for MVP
        if (dirName === 'journal') {
          const dirPath = basePath
            ? PathUtils.joinPath(basePath, dirName)
            : dirName
          await this.getOrCreateDirectory(dirPath)
          DebugUtils.log(`Created directory: ${dirPath}`)
        }
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
    if (!this.plugin.settings.simpleDailyNotesMode) {
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
