/**
 * Algorithms for DailyNotesManager:
 * 
 * - createOrOpenDailyNote(date):
 *   1. Get the vault and dailyNoteDateFormat from plugin.
 *   2. Ensure the monthly folder for the date exists (ensureMonthlyFolderExists).
 *   3. Get the monthly folder path and file name for the date.
 *   4. Build the file path.
 *   5. If the file exists, return it.
 *   6. Otherwise, create the file (empty content) and return it.
 * 
 * - ensureMonthlyFolderExists(date):
 *   1. Get the monthly folder path for the date.
 *   2. Format the month name for logging.
 *   3. Check if the folder exists.
 *   4. If not, create the folder and log creation.
 *   5. If it exists, log that it already exists.
 * 
 * - getMonthlyFolderPath(date):
 *   1. Get the journal base path from directoryManager.
 *   2. If simpleDailyNotesMode is enabled, return the base path.
 *   3. Otherwise, use DateService to get the year/month folder path.
 * 
 * - createTodayNote():
 *   1. Get today's date.
 *   2. Call createOrOpenDailyNote for today.
 * 
 * - createFutureDailyNote(date):
 *   1. Convert input to a date.
 *   2. Log the target date.
 *   3. Create or open the daily note for the date.
 *   4. Log the created folder structure.
 *   5. Return the file.
 * 
 * - openTodayDailyNote():
 *   1. Get today's date.
 *   2. Create or open the daily note for today.
 *   3. Open the file in a new workspace leaf.
 * 
 * - checkAndCreateCurrentMonthFolder():
 *   1. Get the current date.
 *   2. Ensure the current month's folder exists.
 *   3. If near the end of the month (<=2 days), pre-create next month's folder.
 * 
 * - createMonthlyFoldersForRange(startDate, endDate):
 *   1. Set current to the start of the month for startDate.
 *   2. Set end to the end of the month for endDate.
 *   3. While current <= end:
 *      a. Ensure the monthly folder exists for current.
 *      b. Increment current by 1 month.
 * 
 * - openDailyNoteForDate(date):
 *   1. Convert input to a date.
 *   2. Create or open the daily note for the date.
 *   3. Open the file in a new workspace leaf.
 * 
 * - updateDailyNoteLinks(file):
 *   1. Get vault and dailyNoteDateFormat from plugin.
 *   2. Extract the date from the file name.
 *   3. If no date, return.
 *   4. Read the file content.
 *   5. Compute previous and next day.
 *   6. Format previous and next file names.
 *   7. Replace previous/next frontmatter links in the content.
 *   8. If content changed, modify the file.
 * 
 * - getDailyNoteEntries(startDate, endDate):
 *   1. Get vault and dailyNoteDateFormat from plugin.
 *   2. Initialize entries array.
 *   3. Set current to startDate.
 *   4. While current <= endDate:
 *      a. Get the file path for current.
 *      b. If the file exists, push its info to entries.
 *      c. Increment current by 1 day.
 *   5. Return entries.
 */

import { TFile, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
import { DateService } from '../services/dateService';

import { JournalEntry } from '../types';
import { DebugUtils } from '../utils/debugUtils';
import { DirectoryManager } from '../managers/directoryManager';

export class DailyNotesManager {
  plugin: LinkPlugin;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Creates or opens a daily note for the specified date
   * Automatically creates monthly folders as needed
   */
  async createOrOpenDailyNote(date: any): Promise<TFile> {
    const { vault } = this.plugin.app;
        const { dailyNoteDateFormat } = this.plugin.settings;
    
    // Create the monthly folder structure for this date
    await this.ensureMonthlyFolderExists(date);

    // Generate the file name and path using the new base folder structure
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    const fileName = DateService.getJournalFilename(date, dailyNoteDateFormat);
    const filePath = normalizePath(`${monthlyFolderPath}/${fileName}.md`);

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(filePath) as TFile;

    if (!file) {
      // Create the file with empty content
      file = await vault.create(filePath, '');
      DebugUtils.log(`Created daily note: ${filePath}`);
    } else {
      // File already exists, no need to populate
      DebugUtils.log(`Daily note already exists: ${filePath}`);
    }

    return file;
  }

  /**
   * Ensures the monthly folder exists for the given date
   * Creates the folder structure if it doesn't exist
   */
  async ensureMonthlyFolderExists(date: any): Promise<void> {
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    const monthName = DateService.format(date, 'MMMM YYYY');
    
    // Check if folder already exists using Vault API
    const folder = this.plugin.app.vault.getFolderByPath(monthlyFolderPath);
    const folderExists = folder !== null;
    
    if (!folderExists) {
      await this.plugin.directoryManager.getOrCreateDirectory(monthlyFolderPath);
      DebugUtils.log(`✅ Created monthly folder for ${monthName}: ${monthlyFolderPath}`);
    } else {
      DebugUtils.log(`Monthly folder for ${monthName} already exists: ${monthlyFolderPath}`);
    }
  }

  /**
   * Gets the monthly folder path for a given date
   * Uses simple mode OR dynamic folders based on single setting
   */
  public getMonthlyFolderPath(date: any): string {
    const journalBasePath = this.plugin.directoryManager.getJournalPath();
    
    // Single setting controls the mode
    if (this.plugin.settings.simpleDailyNotesMode) {
      return journalBasePath; // Simple: just use daily notes root folder
    }
    
    // Dynamic: use year/month folder structure
    return DateService.getMonthlyFolderPath(
      journalBasePath, 
      date, 
      this.plugin.settings.dailyNoteYearFormat,
      this.plugin.settings.dailyNoteMonthFormat
    );
  }

  /**
   * Creates a daily note for today if it doesn't exist
   * Automatically handles monthly folder creation
   */
  async createTodayNote(): Promise<TFile> {
    const today = DateService.now();
    return await this.createOrOpenDailyNote(today);
  }

  /**
   * Creates a daily note for a future date
   * Automatically creates monthly folders as needed
   * Uses the daily note template and modifies previous/next dates for the target date
   */
  async createFutureDailyNote(date: Date | string): Promise<TFile> {
    const targetDate = DateService.from(date);
    
    DebugUtils.log(`Creating future daily note for: ${DateService.format(targetDate, 'YYYY-MM-DD')}`);
    
    // This will automatically create the monthly folder if it doesn't exist
    // and populate with template content for the target date
    const file = await this.createOrOpenDailyNote(targetDate);
    
    // Log the created folder structure for verification
    const monthlyPath = this.getMonthlyFolderPath(targetDate);
    DebugUtils.log(`Future note created in: ${monthlyPath}`);
    
    return file;
  }



  /**
   * Opens the daily note for today
   * Creates monthly folder and daily note if they don't exist
   */
  async openTodayDailyNote(): Promise<void> {
    const today = DateService.now();
    const file = await this.createOrOpenDailyNote(today);

    // Open the file in a new leaf
    const leaf = this.plugin.app.workspace.getLeaf();
    await leaf.openFile(file);
  }

  /**
   * Checks if we need to create a new monthly folder
   * Called when the plugin loads, when creating notes, or when date changes
   */
  async checkAndCreateCurrentMonthFolder(): Promise<void> {
    const currentDate = DateService.now();
    await this.ensureMonthlyFolderExists(currentDate);
    
    // Also ensure next month folder exists if we're near end of month
    const daysUntilNextMonth = DateService.endOfMonth(currentDate).diff(currentDate, 'days');
    if (daysUntilNextMonth <= 2) {
      const nextMonth = DateService.add(currentDate, 1, 'month');
      await this.ensureMonthlyFolderExists(nextMonth);
      DebugUtils.log('Pre-created next month folder (end of month detected)');
    }
  }

  /**
   * Creates monthly folders for a range of dates
   * Useful for batch creation or setup
   */
  async createMonthlyFoldersForRange(startDate: any, endDate: any): Promise<void> {
    let current = DateService.startOfMonth(startDate);
    const end = DateService.endOfMonth(endDate);

    while (DateService.isSameOrBefore(current, end)) {
      await this.ensureMonthlyFolderExists(current);
      current = DateService.add(current, 1, 'month'); // Properly reassign the new date
    }
  }

  /**
   * Opens daily note for a specific date
   */
  async openDailyNoteForDate(date: Date | string): Promise<void> {
    const momentDate = DateService.from(date);
    const file = await this.createOrOpenDailyNote(momentDate);

    const leaf = this.plugin.app.workspace.getLeaf();
    await leaf.openFile(file);
  }

  /**
   * Updates links between daily notes
   */
  async updateDailyNoteLinks(file: TFile): Promise<void> {
    const { vault } = this.plugin.app;
    const { dailyNoteDateFormat } = this.plugin.settings;

    // Extract date from filename
    const fileDate = DateService.extractDateFromFilename(file.basename, dailyNoteDateFormat || 'YYYY-MM-DD dddd');
    if (!fileDate) return;

    const content = await vault.read(file);
    const previousDay = DateService.previousDay(fileDate);
    const nextDay = DateService.nextDay(fileDate);

    const previousFileName = DateService.format(previousDay, dailyNoteDateFormat);
    const nextFileName = DateService.format(nextDay, dailyNoteDateFormat);

    // Update frontmatter links
    const updatedContent = content
      .replace(/previous: '\[\[(.*?)\]\]'/g, `previous: '[[${previousFileName}]]'`)
      .replace(/next: '\[\[(.*?)\]\]'/g, `next: '[[${nextFileName}]]'`);

    if (updatedContent !== content) {
      await vault.modify(file, updatedContent);
    }
  }

  /**
   * Get daily note entries for a date range
   */
  async getDailyNoteEntries(startDate: any, endDate: any): Promise<JournalEntry[]> {
    const { vault } = this.plugin.app;
    const { dailyNoteDateFormat } = this.plugin.settings;
    const entries: JournalEntry[] = [];

    let current = DateService.from(startDate);
    
    while (DateService.isSameOrBefore(current, endDate)) {
      const filePath = DateService.getJournalFilePath(
        this.plugin.directoryManager.getJournalPath(),
        current,
        dailyNoteDateFormat
      );
      
      const file = vault.getAbstractFileByPath(filePath) as TFile;
      if (file) {
        entries.push({
          date: DateService.format(current, 'YYYY-MM-DD'),
          path: filePath,
          title: DateService.format(current, dailyNoteDateFormat),
          previous: DateService.format(DateService.previousDay(current), 'YYYY-MM-DD'),
          next: DateService.format(DateService.nextDay(current), 'YYYY-MM-DD')
        });
      }
      
      current = DateService.add(current, 1, 'day'); // Properly reassign the new date
    }

    return entries;
  }
}