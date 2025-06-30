import { TFile, moment, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
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
  async createOrOpenJournalEntry(date: moment.Moment): Promise<TFile> {
    const { vault } = this.plugin.app;
    const { journalDateFormat, journalTemplate } = this.plugin.settings;

    // Create the monthly folder structure for this date
    await this.ensureMonthlyFolderExists(date);

    // Generate the file name and path using the new base folder structure
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    const fileName = date.format(journalDateFormat || 'YYYY-MM-DD dddd');
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
  async ensureMonthlyFolderExists(date: moment.Moment): Promise<void> {
    const monthlyFolderPath = this.getMonthlyFolderPath(date);
    await this.plugin.directoryManager.getOrCreateDirectory(monthlyFolderPath);
    console.log(`Ensured monthly folder exists: ${monthlyFolderPath}`);
  }

  /**
   * Gets the monthly folder path for a given date
   * Uses the new base folder structure: LinkPlugin/journal/y_YYYY/MonthName/
   */
  private getMonthlyFolderPath(date: moment.Moment): string {
    const journalBasePath = this.plugin.directoryManager.getJournalPath();
    const year = date.format('YYYY');
    const monthName = date.format('MMMM'); // Full month name (January, February, etc.)
    
    return `${journalBasePath}/y_${year}/${monthName}`;
  }

  /**
   * Creates a daily note for today if it doesn't exist
   * Automatically handles monthly folder creation
   */
  async createTodayNote(): Promise<TFile> {
    const today = moment();
    return await this.createOrOpenJournalEntry(today);
  }

  /**
   * Creates a daily note for a future date
   * Automatically creates monthly folders as needed
   */
  async createFutureDailyNote(date: Date | string): Promise<TFile> {
    const targetDate = typeof date === 'string' ? moment(date) : moment(date);
    
    // This will automatically create the monthly folder if it doesn't exist
    return await this.createOrOpenJournalEntry(targetDate);
  }

  /**
   * Generate content for a journal entry
   */
  private async generateJournalContent(date: moment.Moment): Promise<string> {
    const { journalTemplate, journalDateFormat } = this.plugin.settings;
    const previousDay = moment(date).subtract(1, 'day');
    const nextDay = moment(date).add(1, 'day');

    const previousLink = `[[${previousDay.format(journalDateFormat || 'YYYY-MM-DD dddd')}]]`;
    const nextLink = `[[${nextDay.format(journalDateFormat || 'YYYY-MM-DD dddd')}]]`;
    const currentDate = date.format('YYYY-MM-DD');
    const title = date.format(journalDateFormat || 'YYYY-MM-DD dddd');

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
    const today = moment();
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
    const currentDate = moment();
    await this.ensureMonthlyFolderExists(currentDate);
  }

  /**
   * Creates monthly folders for a range of dates
   * Useful for batch creation or setup
   */
  async createMonthlyFoldersForRange(startDate: moment.Moment, endDate: moment.Moment): Promise<void> {
    const current = moment(startDate).startOf('month');
    const end = moment(endDate).endOf('month');

    while (current.isSameOrBefore(end)) {
      await this.ensureMonthlyFolderExists(current);
      current.add(1, 'month');
    }
  }

  /**
   * Opens journal entry for a specific date
   */
  async openJournalForDate(date: Date | string): Promise<void> {
    const momentDate = typeof date === 'string' ? moment(date) : moment(date);
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
    const fileDate = DateUtils.extractDateFromFilename(file.basename, journalDateFormat);
    if (!fileDate) return;

    const content = await vault.read(file);
    const previousDay = moment(fileDate).subtract(1, 'day');
    const nextDay = moment(fileDate).add(1, 'day');

    const previousFileName = previousDay.format(journalDateFormat || 'YYYY-MM-DD dddd');
    const nextFileName = nextDay.format(journalDateFormat || 'YYYY-MM-DD dddd');

    // Update frontmatter links
    const updatedContent = content
      .replace(/previous: '\[\[(.*?)\]\]'/g, `previous: '[[${previousFileName}]]'`)
      .replace(/next: '\[\[(.*?)\]\]'/g, `next: '[[${nextFileName}]]'`);

    if (content !== updatedContent) {
      await vault.modify(file, updatedContent);
    }
  }

  /**
   * Get all journal entries in a date range
   */
  async getJournalEntries(startDate: moment.Moment, endDate: moment.Moment): Promise<JournalEntry[]> {
    const { vault } = this.plugin.app;
    const entries: JournalEntry[] = [];

    const current = moment(startDate);
    while (current.isSameOrBefore(endDate)) {
      const entryPath = DateUtils.getJournalPath(
        current,
        this.plugin.settings.journalRootFolder,
        this.plugin.settings.journalFolderFormat,
        this.plugin.settings.journalDateFormat
      );

      const file = vault.getAbstractFileByPath(entryPath) as TFile;
      if (file) {
        entries.push({
          date: current.format('YYYY-MM-DD'),
          path: file.path,
          title: file.basename,
          previous: moment(current).subtract(1, 'day').format('YYYY-MM-DD'),
          next: moment(current).add(1, 'day').format('YYYY-MM-DD')
        });
      }

      current.add(1, 'day');
    }

    return entries;
  }
}