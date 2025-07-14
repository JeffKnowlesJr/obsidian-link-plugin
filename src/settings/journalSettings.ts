/**
 * Algorithms for JournalSettings:
 * 
 * - getDefaults():
 *   1. Return an object with default values for each journal setting:
 *      a. journalDateFormat: 'YYYY-MM-DD dddd'
 *      b. journalFolderFormat: DATE_FORMATS.FOLDER_FORMAT
 *      c. journalYearFormat: 'YYYY'
 *      d. journalMonthFormat: 'MM-MMMM'
 *      e. journalTemplate: DEFAULT_TEMPLATES.JOURNAL
 *      f. simpleJournalMode: false
 * 
 * - validate(settings):
 *   1. Create an empty validated object.
 *   2. For each property in settings:
 *      a. If journalDateFormat is a string, copy it to validated.
 *      b. If journalFolderFormat is a string, copy it to validated.
 *      c. If journalTemplate is a string, copy it to validated.
 *      d. If simpleJournalMode is a boolean, copy it to validated.
 *   3. Return the validated object.
 * 
 * - isValidDateFormat(format):
 *   1. Define a list of valid moment.js tokens.
 *   2. Return true if any token is present in the format string.
 *   3. If an error occurs, return false.
 */

import { DATE_FORMATS, DEFAULT_TEMPLATES } from '../constants';

export interface JournalSettingsConfig {
  journalDateFormat: string;
  journalFolderFormat: string;
  journalYearFormat: string;
  journalMonthFormat: string;
  journalTemplate: string;
  simpleJournalMode: boolean;
}

export class JournalSettings {
  static getDefaults(): JournalSettingsConfig {
    return {
      journalDateFormat: 'YYYY-MM-DD dddd',
      journalFolderFormat: DATE_FORMATS.FOLDER_FORMAT,
      journalYearFormat: 'YYYY',
      journalMonthFormat: 'MM MMMM',
      journalTemplate: DEFAULT_TEMPLATES.JOURNAL,
      simpleJournalMode: false,
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
      const validTokens = ['YYYY', 'MM', 'DD', 'dddd', 'MMM', 'MMMM'];
      return validTokens.some(token => format.includes(token));
    } catch {
      return false;
    }
  }
}