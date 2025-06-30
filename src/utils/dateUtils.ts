
import { moment } from 'obsidian';

export class DateUtils {
  static extractDateFromFilename(filename: string, format: string): moment.Moment | null {
    try {
      const date = (moment as any)(filename, format, true);
      return date.isValid() ? date : null;
    } catch (error) {
      return null;
    }
  }

  static formatDate(date: Date | moment.Moment, format: string = 'YYYY-MM-DD'): string {
    const m = (date instanceof Date) ? (moment as any)(date) : date;
    return m.format(format);
  }

  static getJournalPath(date: Date | moment.Moment, baseFolder: string, journalFolder: string, dateFormat: string): string {
    const m = (date instanceof Date) ? (moment as any)(date) : date;
    const year = m.format('YYYY');
    const monthName = m.format('MMMM');
    const fileName = m.format(dateFormat || 'YYYY-MM-DD dddd');
    
    return `${baseFolder}/${journalFolder}/y_${year}/${monthName}/${fileName}.md`;
  }

  static getCurrentMonth(): string {
    return (moment as any)().format('MMMM');
  }

  static getCurrentYear(): string {
    return (moment as any)().format('YYYY');
  }

  static getMonthlyFolderName(date: Date | moment.Moment): string {
    const m = (date instanceof Date) ? (moment as any)(date) : date;
    return `y_${m.format('YYYY')}/${m.format('MMMM')}`;
  }
}
