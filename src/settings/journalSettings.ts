import { DATE_FORMATS, DEFAULT_TEMPLATES } from '../constants';

export interface JournalSettingsConfig {
  journalDateFormat: string;
  journalFolderFormat: string;
  journalTemplate: string;
}

export class JournalSettings {
  static getDefaults(): JournalSettingsConfig {
    return {
      journalDateFormat: DATE_FORMATS.DEFAULT_JOURNAL,
      journalFolderFormat: DATE_FORMATS.FOLDER_FORMAT,
      journalTemplate: DEFAULT_TEMPLATES.JOURNAL,
    };
  }

  static validate(settings: Partial<JournalSettingsConfig>): Partial<JournalSettingsConfig> {
    const validated: Partial<JournalSettingsConfig> = {};

    // Validate journal date format
    if (settings.journalDateFormat && typeof settings.journalDateFormat === 'string') {
      validated.journalDateFormat = settings.journalDateFormat;
    }

    // Validate journal folder format
    if (settings.journalFolderFormat && typeof settings.journalFolderFormat === 'string') {
      validated.journalFolderFormat = settings.journalFolderFormat;
    }

    // Validate journal template
    if (settings.journalTemplate && typeof settings.journalTemplate === 'string') {
      validated.journalTemplate = settings.journalTemplate;
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