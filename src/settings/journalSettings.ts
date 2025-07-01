import { DATE_FORMATS, DEFAULT_TEMPLATES } from '../constants';

export interface JournalSettingsConfig {
  journalDateFormat: string;
  journalFolderFormat: string;
  journalYearFormat: string;
  journalMonthFormat: string;
  journalTemplate: string;
  simpleJournalMode: boolean; // Single setting: true = simple, false = dynamic monthly folders
}

export class JournalSettings {
  static getDefaults(): JournalSettingsConfig {
    return {
      journalDateFormat: 'YYYY-MM-DD dddd',
      journalFolderFormat: DATE_FORMATS.FOLDER_FORMAT,
      journalYearFormat: 'YYYY',
      journalMonthFormat: 'MM-MMMM', // Changed to MM-MMMM for "07-July" format
      journalTemplate: DEFAULT_TEMPLATES.JOURNAL,
      simpleJournalMode: false, // Default to dynamic monthly folders
    };
  }

  static validate(settings: Partial<JournalSettingsConfig>): Partial<JournalSettingsConfig> {
    const validated: Partial<JournalSettingsConfig> = {};

    if (settings.journalDateFormat && typeof settings.journalDateFormat === 'string') {
      validated.journalDateFormat = settings.journalDateFormat;
    }

    if (settings.journalFolderFormat && typeof settings.journalFolderFormat === 'string') {
      validated.journalFolderFormat = settings.journalFolderFormat;
    }

    if (settings.journalTemplate && typeof settings.journalTemplate === 'string') {
      validated.journalTemplate = settings.journalTemplate;
    }

    if (typeof settings.simpleJournalMode === 'boolean') {
      validated.simpleJournalMode = settings.simpleJournalMode;
    }

    return validated;
  }

  static isValidDateFormat(format: string): boolean {
    try {
      // Basic validation - check if format contains valid moment.js tokens
      const validTokens = ['YYYY', 'MM', 'DD', 'dddd', 'MMM', 'MMMM'];
      return validTokens.some(token => format.includes(token));
    } catch {
      return false;
    }
  }
} 