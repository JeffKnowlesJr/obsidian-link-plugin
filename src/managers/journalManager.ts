import { TFile, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
import { DateService } from '../services/dateService';
import { DateUtils } from '../utils/dateUtils';
import { JournalEntry } from '../types';

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
    const { journalDateFormat, journalTemplate } = this.plugin.settings;

    // Create the monthly folder structure for this date
    await this.ensureMonthlyFolderExists(date);

    // Generate the file name and path using the new base folder structure
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    const fileName = DateService.getJournalFilename(date, journalDateFormat);
    const filePath = normalizePath(`${monthlyFolderPath}/${fileName}.md`);

    // Check if the file already exists
    let file = vault.getAbstractFileByPath(filePath) as TFile;

    if (!file) {
      // Create the file with template content
      const content = await this.generateJournalContent(date);
      file = await vault.create(filePath, content);
      console.log(`Created daily note: ${filePath}`);
    }

    return file;
  }

  /**
   * Ensures the monthly folder exists for the given date
   * Creates the folder structure if it doesn't exist
   */
  async ensureMonthlyFolderExists(date: any): Promise<void> {
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    await this.plugin.directoryManager.getOrCreateDirectory(monthlyFolderPath);
    console.log(`Ensured monthly folder exists: ${monthlyFolderPath}`);
  }

  /**
   * Gets the monthly folder path for a given date
   * Uses dynamic folders if enabled, otherwise simple journal folder
   */
  private getMonthlyFolderPath(date: any): string {
    const journalBasePath = this.plugin.directoryManager.getJournalPath();
    
    // If dynamic folders are disabled or simple mode is enabled, use simple structure
    if (!this.plugin.settings.enableDynamicFolders || this.plugin.settings.simpleJournalMode) {
      return journalBasePath; // Just use the journal root folder
    }
    
    // Use complex dynamic folder structure
    return DateService.getMonthlyFolderPath(journalBasePath, date);
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
    
    // This will automatically create the monthly folder if it doesn't exist
    return await this.createOrOpenJournalEntry(targetDate);
  }

  /**
   * Generate content for a journal entry
   */
  private async generateJournalContent(date: any): Promise<string> {
    const { journalTemplate, journalDateFormat } = this.plugin.settings;
    const previousDay = DateService.previousDay(date);
    const nextDay = DateService.nextDay(date);

    const previousLink = `[[${DateService.format(previousDay, journalDateFormat)}]]`;
    const nextLink = `[[${DateService.format(nextDay, journalDateFormat)}]]`;
    const currentDate = DateService.format(date, 'YYYY-MM-DD');
    const title = DateService.format(date, journalDateFormat);

    if (journalTemplate) {
      // Replace template variables
      return journalTemplate
        .replace(/{{date}}/g, currentDate)
        .replace(/{{title}}/g, title)
        .replace(/{{previous}}/g, previousLink)
        .replace(/{{next}}/g, nextLink);
    }

    // Default template
    return `---
date: ${currentDate}
previous: ${previousLink}
next: ${nextLink}
tags:
  - journal
---

# ${title}

## Daily Log

## Tasks
- [ ] 

## Notes

## Reflection

---
Previous: ${previousLink} | Next: ${nextLink}
`;
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
   * Called when the plugin loads or when creating notes
   */
  async checkAndCreateCurrentMonthFolder(): Promise<void> {
    const currentDate = DateService.now();
    await this.ensureMonthlyFolderExists(currentDate);
  }

  /**
   * Creates monthly folders for a range of dates
   * Useful for batch creation or setup
   */
  async createMonthlyFoldersForRange(startDate: any, endDate: any): Promise<void> {
    const current = DateService.startOfMonth(startDate);
    const end = DateService.endOfMonth(endDate);

    while (DateService.isSameOrBefore(current, end)) {
      await this.ensureMonthlyFolderExists(current);
      DateService.add(current, 1, 'month');
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

    const current = DateService.from(startDate);
    
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
      
      DateService.add(current, 1, 'day');
    }

    return entries;
  }
}