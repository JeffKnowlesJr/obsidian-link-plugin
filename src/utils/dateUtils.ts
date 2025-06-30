import { DateService } from '../services/dateService';

/**
 * DateUtils - Legacy compatibility wrapper for DateService
 * @deprecated Use DateService directly for new code
 */
export class DateUtils {
  /**
   * Extract date from filename
   * @deprecated Use DateService.extractDateFromFilename instead
   */
  static extractDateFromFilename(filename: string, format: string): any | null {
    return DateService.extractDateFromFilename(filename, format);
  }

  /**
   * Format date
   * @deprecated Use DateService.format instead
   */
  static formatDate(date: Date | any, format: string = 'YYYY-MM-DD'): string {
    return DateService.format(date, format);
  }

  /**
   * Get journal path
   * @deprecated Use DateService.getJournalFilePath instead
   */
  static getJournalPath(date: Date | any, baseFolder: string, journalFolder: string, dateFormat: string): string {
    const basePath = `${baseFolder}/${journalFolder}`;
    return DateService.getJournalFilePath(basePath, date, dateFormat);
  }

  /**
   * Get current month
   * @deprecated Use DateService.currentMonth instead
   */
  static getCurrentMonth(): string {
    return DateService.currentMonth();
  }

  /**
   * Get current year
   * @deprecated Use DateService.currentYear instead
   */
  static getCurrentYear(): string {
    return DateService.currentYear();
  }

  /**
   * Get monthly folder name
   * @deprecated Use DateService.getJournalPathComponents instead
   */
  static getMonthlyFolderName(date: Date | any): string {
    const components = DateService.getJournalPathComponents(date);
    return `${components.yearFolder}/${components.monthFolder}`;
  }
}
