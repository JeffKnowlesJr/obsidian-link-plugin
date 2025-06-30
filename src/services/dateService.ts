/**
 * DateService - Centralized date handling for the Obsidian Link Plugin
 * 
 * This service encapsulates all moment.js usage and provides a clean, type-safe API.
 * It handles the TypeScript issues with Obsidian's moment.js implementation by
 * using proper type assertions and providing consistent date operations.
 */

// Type definition for Obsidian's moment instance
type ObsidianMoment = {
  (): any;
  (input?: any): any;
  (input?: any, format?: string): any;
  (input?: any, format?: string, strict?: boolean): any;
};

export class DateService {
  private static moment: ObsidianMoment;

  /**
   * Initialize the date service with Obsidian's moment instance
   * This should be called once when the plugin loads
   */
  static initialize(): void {
    // Get moment from Obsidian's global scope
    this.moment = (window as any).moment;
    
    if (!this.moment) {
      throw new Error('Obsidian moment.js not available');
    }
  }

  /**
   * Get current date/time
   */
  static now(): any {
    return this.moment();
  }

  /**
   * Create moment from date input
   */
  static from(input?: Date | string | any): any {
    return this.moment(input);
  }

  /**
   * Create moment from date string with format
   */
  static fromFormat(input: string, format: string, strict: boolean = true): any {
    return this.moment(input, format, strict);
  }

  /**
   * Format a date using the specified format
   */
  static format(date: Date | string | any, format: string = 'YYYY-MM-DD'): string {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.format(format);
  }

  /**
   * Get today's date formatted
   */
  static today(format: string = 'YYYY-MM-DD'): string {
    return this.moment().format(format);
  }

  /**
   * Get current year
   */
  static currentYear(): string {
    return this.moment().format('YYYY');
  }

  /**
   * Get current month name
   */
  static currentMonth(): string {
    return this.moment().format('MMMM');
  }

  /**
   * Get start of year for given date
   */
  static startOfYear(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).startOf('year');
  }

  /**
   * End of year for given date
   */
  static endOfYear(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).endOf('year');
  }

  /**
   * Start of month for given date
   */
  static startOfMonth(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).startOf('month');
  }

  /**
   * End of month for given date
   */
  static endOfMonth(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).endOf('month');
  }

  /**
   * Add time to a date
   */
  static add(date: Date | string | any, amount: number, unit: string): any {
    return this.moment(date).add(amount, unit);
  }

  /**
   * Subtract time from a date
   */
  static subtract(date: Date | string | any, amount: number, unit: string): any {
    return this.moment(date).subtract(amount, unit);
  }

  /**
   * Check if date is valid
   */
  static isValid(date: any): boolean {
    return this.moment(date).isValid();
  }

  /**
   * Check if date is same or before another date
   */
  static isSameOrBefore(date1: any, date2: any): boolean {
    return this.moment(date1).isSameOrBefore(date2);
  }

  /**
   * Extract date from filename using format
   */
  static extractDateFromFilename(filename: string, format: string): any | null {
    try {
      const date = this.moment(filename, format, true);
      return date.isValid() ? date : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get journal path components for a date
   */
  static getJournalPathComponents(date?: Date | string | any): {
    year: string;
    monthName: string;
    yearFolder: string;
    monthFolder: string;
  } {
    const momentDate = date ? this.moment(date) : this.moment();
    const year = momentDate.format('YYYY');
    const monthName = momentDate.format('MMMM');
    
    return {
      year,
      monthName,
      yearFolder: `y_${year}`,
      monthFolder: monthName
    };
  }

  /**
   * Get formatted filename for journal entry
   */
  static getJournalFilename(date?: Date | string | any, format: string = 'YYYY-MM-DD dddd'): string {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.format(format);
  }

  /**
   * Get previous day
   */
  static previousDay(date?: Date | string | any): any {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.subtract(1, 'day');
  }

  /**
   * Get next day
   */
  static nextDay(date?: Date | string | any): any {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.add(1, 'day');
  }

  /**
   * Create date range iterator
   */
  static *dateRange(startDate: any, endDate: any, unit: string = 'day'): Generator<any> {
    const current = this.moment(startDate);
    const end = this.moment(endDate);
    
    while (current.isSameOrBefore(end)) {
      yield this.moment(current);
      current.add(1, unit);
    }
  }

  /**
   * Get monthly folder path for a date
   */
  static getMonthlyFolderPath(basePath: string, date?: Date | string | any): string {
    const components = this.getJournalPathComponents(date);
    return `${basePath}/${components.yearFolder}/${components.monthFolder}`;
  }

  /**
   * Get full journal file path
   */
  static getJournalFilePath(
    basePath: string, 
    date?: Date | string | any, 
    format: string = 'YYYY-MM-DD dddd'
  ): string {
    const monthlyPath = this.getMonthlyFolderPath(basePath, date);
    const filename = this.getJournalFilename(date, format);
    return `${monthlyPath}/${filename}.md`;
  }

  /**
   * Validate date format string
   */
  static isValidFormat(format: string): boolean {
    try {
      const testDate = this.moment();
      testDate.format(format);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get debug information about the moment instance
   */
  static getDebugInfo(): { available: boolean; version?: string; type: string } {
    return {
      available: !!this.moment,
      version: (this.moment as any)?.version || 'unknown',
      type: typeof this.moment
    };
  }
} 