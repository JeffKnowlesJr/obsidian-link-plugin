/**
 * Algorithms for DateService:
 * 
 * - initialize():
 *   1. Retrieve the moment.js instance from the global window object.
 *   2. If not available, throw an error.
 * 
 * - now():
 *   1. Return the current moment instance.
 * 
 * - from(input):
 *   1. Return a moment instance created from the input.
 * 
 * - fromFormat(input, format, strict):
 *   1. Return a moment instance created from the input string using the given format and strictness.
 * 
 * - format(date, format):
 *   1. If date is provided, create a moment instance from it; otherwise, use the current moment.
 *   2. Return the formatted string using the specified format.
 * 
 * - today(format):
 *   1. Return the current date formatted as a string.
 * 
 * - currentYear():
 *   1. Return the current year as a string.
 * 
 * - currentMonth():
 *   1. Return the current month name as a string.
 * 
 * - startOfYear(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Return the start of the year.
 * 
 * - endOfYear(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Return the end of the year.
 * 
 * - startOfMonth(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Return the start of the month.
 * 
 * - endOfMonth(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Return the end of the month.
 * 
 * - add(date, amount, unit):
 *   1. Create a moment instance from the date.
 *   2. Add the specified amount and unit.
 *   3. Return the new moment instance.
 * 
 * - subtract(date, amount, unit):
 *   1. Create a moment instance from the date.
 *   2. Subtract the specified amount and unit.
 *   3. Return the new moment instance.
 * 
 * - addDays(date, days):
 *   1. Call add(date, days, 'days').
 * 
 * - isValid(date):
 *   1. Create a moment instance from the date.
 *   2. Return whether the date is valid.
 * 
 * - isSameOrBefore(date1, date2):
 *   1. Create a moment instance from date1.
 *   2. Return whether it is the same or before date2.
 * 
 * - extractDateFromFilename(filename, format):
 *   1. Try to create a moment instance from the filename using the format in strict mode.
 *   2. If valid, return the moment instance; otherwise, return null.
 * 
 * - getJournalPathComponents(date, yearFormat, monthFormat):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Extract year, month name, and month number.
 *   3. Determine yearFolder and monthFolder formats, handling legacy/invalid formats.
 *   4. Return an object with year, monthName, monthNumber, yearFolder, and monthFolder.
 * 
 * - getJournalFilename(date, format):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Return the formatted filename.
 * 
 * - previousDay(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Subtract one day and return the new moment.
 * 
 * - nextDay(date):
 *   1. Create a moment instance from the date or use the current moment.
 *   2. Add one day and return the new moment.
 * 
 * - dateRange(startDate, endDate, unit):
 *   1. Create moment instances for startDate and endDate.
 *   2. While current is same or before end, yield a clone of current and increment by one unit.
 * 
 * - getMonthlyFolderPath(basePath, date, yearFormat, monthFormat):
 *   1. Get journal path components for the date.
 *   2. Return the folder path as basePath/yearFolder/monthFolder.
 * 
 * - getJournalFilePath(basePath, date, format):
 *   1. Get the monthly folder path.
 *   2. Get the journal filename.
 *   3. Return the full file path as monthlyPath/filename.md.
 * 
 * - isValidFormat(format):
 *   1. Try to format the current moment with the given format.
 *   2. Return true if no error, false otherwise.
 * 
 * - getDebugInfo():
 *   1. Return an object with availability, version, and type of the moment instance.
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

  static initialize(): void {
    this.moment = (window as any).moment;
    if (!this.moment) {
      throw new Error('Obsidian moment.js not available');
    }
  }

  static now(): any {
    return this.moment();
  }

  static from(input?: Date | string | any): any {
    return this.moment(input);
  }

  static fromFormat(input: string, format: string, strict: boolean = true): any {
    return this.moment(input, format, strict);
  }

  static format(date: Date | string | any, format: string = 'YYYY-MM-DD'): string {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.format(format);
  }

  static today(format: string = 'YYYY-MM-DD'): string {
    return this.moment().format(format);
  }

  static currentYear(): string {
    return this.moment().format('YYYY');
  }

  static currentMonth(): string {
    return this.moment().format('MMMM');
  }

  static startOfYear(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).startOf('year');
  }

  static endOfYear(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).endOf('year');
  }

  static startOfMonth(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).startOf('month');
  }

  static endOfMonth(date?: Date | string | any): any {
    return (date ? this.moment(date) : this.moment()).endOf('month');
  }

  static add(date: Date | string | any, amount: number, unit: string): any {
    return this.moment(date).add(amount, unit);
  }

  static subtract(date: Date | string | any, amount: number, unit: string): any {
    return this.moment(date).subtract(amount, unit);
  }

  static addDays(date: Date | string | any, days: number): any {
    return this.add(date, days, 'days');
  }

  static isValid(date: any): boolean {
    return this.moment(date).isValid();
  }

  static isSameOrBefore(date1: any, date2: any): boolean {
    return this.moment(date1).isSameOrBefore(date2);
  }

  static extractDateFromFilename(filename: string, format: string): any | null {
    try {
      const date = this.moment(filename, format, true);
      return date.isValid() ? date : null;
    } catch (error) {
      return null;
    }
  }

  static getJournalPathComponents(
    date?: Date | string | any, 
    yearFormat?: string, 
    monthFormat?: string
  ): {
    year: string;
    monthName: string;
    monthNumber: string;
    yearFolder: string;
    monthFolder: string;
  } {
    const momentDate = date ? this.moment(date) : this.moment();
    const year = momentDate.format('YYYY');
    const monthName = momentDate.format('MMMM');
    const monthNumber = momentDate.format('MM');
    const yearFolderFormat = yearFormat && yearFormat !== 'y_YYYY' ? yearFormat : 'YYYY';
    const monthFolderFormat = monthFormat || 'MM-MMMM';
    let cleanMonthFormat = monthFolderFormat;
    if (monthFolderFormat === 'MMmmmm' || monthFolderFormat === 'MMMMM' || monthFolderFormat === 'MMMM') {
      cleanMonthFormat = 'MM-MMMM';
    }
    return {
      year,
      monthName,
      monthNumber,
      yearFolder: momentDate.format(yearFolderFormat),
      monthFolder: momentDate.format(cleanMonthFormat)
    };
  }

  static getJournalFilename(date?: Date | string | any, format: string = 'YYYY-MM-DD dddd'): string {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.format(format);
  }

  static previousDay(date?: Date | string | any): any {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.subtract(1, 'day');
  }

  static nextDay(date?: Date | string | any): any {
    const momentDate = date ? this.moment(date) : this.moment();
    return momentDate.add(1, 'day');
  }

  static *dateRange(startDate: any, endDate: any, unit: string = 'day'): Generator<any> {
    const current = this.moment(startDate);
    const end = this.moment(endDate);
    while (current.isSameOrBefore(end)) {
      yield this.moment(current);
      current.add(1, unit);
    }
  }

  static getMonthlyFolderPath(
    basePath: string, 
    date?: Date | string | any, 
    yearFormat?: string, 
    monthFormat?: string
  ): string {
    const components = this.getJournalPathComponents(date, yearFormat, monthFormat);
    return `${basePath}/${components.yearFolder}/${components.monthFolder}`;
  }

  static getJournalFilePath(
    basePath: string, 
    date?: Date | string | any, 
    format: string = 'YYYY-MM-DD dddd'
  ): string {
    const monthlyPath = this.getMonthlyFolderPath(basePath, date);
    const filename = this.getJournalFilename(date, format);
    return `${monthlyPath}/${filename}.md`;
  }

  static isValidFormat(format: string): boolean {
    try {
      const testDate = this.moment();
      testDate.format(format);
      return true;
    } catch {
      return false;
    }
  }

  static getDebugInfo(): { available: boolean; version?: string; type: string } {
    return {
      available: !!this.moment,
      version: (this.moment as any)?.version || 'unknown',
      type: typeof this.moment
    };
  }
} 