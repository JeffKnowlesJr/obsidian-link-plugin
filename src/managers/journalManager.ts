/**
 * Algorithms for JournalManager:
 * 
 * - createOrOpenJournalEntry(date):
 *   1. Get the vault and journalDateFormat from plugin.
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
 *   2. If simpleJournalMode is enabled, return the base path.
 *   3. Otherwise, use DateService to get the year/month folder path.
 * 
 * - createTodayNote():
 *   1. Get today's date.
 *   2. Call createOrOpenJournalEntry for today.
 * 
 * - createFutureDailyNote(date):
 *   1. Convert input to a date.
 *   2. Log the target date.
 *   3. Create or open the journal entry for the date.
 *   4. Log the created folder structure.
 *   5. Return the file.
 * 
 * - openTodayJournal():
 *   1. Get today's date.
 *   2. Create or open the journal entry for today.
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
 * - openJournalForDate(date):
 *   1. Convert input to a date.
 *   2. Create or open the journal entry for the date.
 *   3. Open the file in a new workspace leaf.
 * 
 * - updateJournalLinks(file):
 *   1. Get vault and journalDateFormat from plugin.
 *   2. Extract the date from the file name.
 *   3. If no date, return.
 *   4. Read the file content.
 *   5. Compute previous and next day.
 *   6. Format previous and next file names.
 *   7. Replace previous/next frontmatter links in the content.
 *   8. If content changed, modify the file.
 * 
 * - getJournalEntries(startDate, endDate):
 *   1. Get vault and journalDateFormat from plugin.
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
import { DateUtils } from '../utils/dateUtils';
import { JournalEntry } from '../types';
import { DebugUtils } from '../utils/debugUtils';

export class JournalManager {
  plugin: LinkPlugin;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Creates or opens a journal entry for the specified date
   * Automatically creates monthly folders as needed
   */
  async createOrOpenJournalEntry(date: any): Promise<TFile> {
    const { vault } = this.plugin.app;
    const { journalDateFormat } = this.plugin.settings;

    // Create the monthly folder structure for this date
    await this.ensureMonthlyFolderExists(date);

    // Generate the file name and path using the new base folder structure
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    const fileName = DateService.getJournalFilename(date, journalDateFormat);
    const filePath = normalizePath(`${monthlyFolderPath}/${fileName}.md`);

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(filePath) as TFile;

    if (!file) {
      // Create the file using Obsidian's default daily note template (empty content)
      // Let Obsidian's Daily Notes plugin handle the template
      file = await vault.create(filePath, '');
      DebugUtils.log(`Created daily note: ${filePath}`);
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
    if (this.plugin.settings.simpleJournalMode) {
      return journalBasePath; // Simple: just use journal root folder
    }
    
    // Dynamic: use year/month folder structure
    return DateService.getMonthlyFolderPath(
      journalBasePath, 
      date, 
      this.plugin.settings.journalYearFormat,
      this.plugin.settings.journalMonthFormat
    );
  }

  /**
   * Creates a daily note for today if it doesn't exist
   * Automatically handles monthly folder creation
   */
  async createTodayNote(): Promise<TFile> {
    const today = DateService.now();
    return await this.createOrOpenJournalEntry(today);
  }

  /**
   * Creates a daily note for a future date
   * Automatically creates monthly folders as needed
   */
  async createFutureDailyNote(date: Date | string): Promise<TFile> {
    const targetDate = DateService.from(date);
    
    DebugUtils.log(`Creating future daily note for: ${DateService.format(targetDate, 'YYYY-MM-DD')}`);
    
    // This will automatically create the monthly folder if it doesn't exist
    const file = await this.createOrOpenJournalEntry(targetDate);
    
    // Log the created folder structure for verification
    const monthlyPath = this.getMonthlyFolderPath(targetDate);
    DebugUtils.log(`Future note created in: ${monthlyPath}`);
    
    return file;
  }

  /**
   * Opens the journal entry for today
   * Creates monthly folder and daily note if they don't exist
   */
  async openTodayJournal(): Promise<void> {
    const today = DateService.now();
    const file = await this.createOrOpenJournalEntry(today);

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
   * Opens journal entry for a specific date
   */
  async openJournalForDate(date: Date | string): Promise<void> {
    const momentDate = DateService.from(date);
    const file = await this.createOrOpenJournalEntry(momentDate);

    const leaf = this.plugin.app.workspace.getLeaf();
    await leaf.openFile(file);
  }

  /**
   * Updates links between journal entries
   */
  async updateJournalLinks(file: TFile): Promise<void> {
    const { vault } = this.plugin.app;
    const { journalDateFormat } = this.plugin.settings;

    // Extract date from filename
    const fileDate = DateService.extractDateFromFilename(file.basename, journalDateFormat || 'YYYY-MM-DD dddd');
    if (!fileDate) return;

    const content = await vault.read(file);
    const previousDay = DateService.previousDay(fileDate);
    const nextDay = DateService.nextDay(fileDate);

    const previousFileName = DateService.format(previousDay, journalDateFormat);
    const nextFileName = DateService.format(nextDay, journalDateFormat);

    // Update frontmatter links
    const updatedContent = content
      .replace(/previous: '\[\[(.*?)\]\]'/g, `previous: '[[${previousFileName}]]'`)
      .replace(/next: '\[\[(.*?)\]\]'/g, `next: '[[${nextFileName}]]'`);

    if (updatedContent !== content) {
      await vault.modify(file, updatedContent);
    }
  }

  /**
   * Get journal entries for a date range
   */
  async getJournalEntries(startDate: any, endDate: any): Promise<JournalEntry[]> {
    const { vault } = this.plugin.app;
    const { journalDateFormat } = this.plugin.settings;
    const entries: JournalEntry[] = [];

    let current = DateService.from(startDate);
    
    while (DateService.isSameOrBefore(current, endDate)) {
      const filePath = DateService.getJournalFilePath(
        this.plugin.directoryManager.getJournalPath(),
        current,
        journalDateFormat
      );
      
      const file = vault.getAbstractFileByPath(filePath) as TFile;
      if (file) {
        entries.push({
          date: DateService.format(current, 'YYYY-MM-DD'),
          path: filePath,
          title: DateService.format(current, journalDateFormat),
          previous: DateService.format(DateService.previousDay(current), 'YYYY-MM-DD'),
          next: DateService.format(DateService.nextDay(current), 'YYYY-MM-DD')
        });
      }
      
      current = DateService.add(current, 1, 'day'); // Properly reassign the new date
    }

    return entries;
  }
}