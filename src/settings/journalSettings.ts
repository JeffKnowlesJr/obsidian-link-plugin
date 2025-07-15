/**
 * Algorithms for DailyNotesSettings:
 * 
 * - getDefaults():
 *   1. Return an object with default values for each daily notes setting:
 *      a. dailyNoteDateFormat: 'YYYY-MM-DD dddd'
 *      b. dailyNoteFolderFormat: DATE_FORMATS.FOLDER_FORMAT
 *      c. dailyNoteYearFormat: 'YYYY'
 *      d. dailyNoteMonthFormat: 'MM MMMM'
 *      e. simpleDailyNotesMode: false
 * 
 * - validate(settings):
 *   1. Create an empty validated object.
 *   2. For each property in settings:
 *      a. If dailyNoteDateFormat is a string, copy it to validated.
 *      b. If dailyNoteFolderFormat is a string, copy it to validated.
 *      c. If simpleDailyNotesMode is a boolean, copy it to validated.
 *   3. Return the validated object.
 * 
 * - isValidDateFormat(format):
 *   1. Define a list of valid moment.js tokens.
 *   2. Return true if any token is present in the format string.
 *   3. If an error occurs, return false.
 */

import { DATE_FORMATS } from '../constants';

export interface DailyNotesSettingsConfig {
  dailyNoteDateFormat: string;
  dailyNoteFolderFormat: string;
  dailyNoteYearFormat: string;
  dailyNoteMonthFormat: string;
  simpleDailyNotesMode: boolean;
}

export class DailyNotesSettings {
  static getDefaults(): DailyNotesSettingsConfig {
    return {
      dailyNoteDateFormat: 'YYYY-MM-DD dddd',
      dailyNoteFolderFormat: DATE_FORMATS.FOLDER_FORMAT,
      dailyNoteYearFormat: 'YYYY',
      dailyNoteMonthFormat: 'MM MMMM',
      simpleDailyNotesMode: false,
    };
  }

  static validate(settings: Partial<DailyNotesSettingsConfig>): Partial<DailyNotesSettingsConfig> {
    const validated: Partial<DailyNotesSettingsConfig> = {};

    if (settings.dailyNoteDateFormat && typeof settings.dailyNoteDateFormat === 'string') {
      validated.dailyNoteDateFormat = settings.dailyNoteDateFormat;
    }

    if (settings.dailyNoteFolderFormat && typeof settings.dailyNoteFolderFormat === 'string') {
      validated.dailyNoteFolderFormat = settings.dailyNoteFolderFormat;
    }

    if (typeof settings.simpleDailyNotesMode === 'boolean') {
      validated.simpleDailyNotesMode = settings.simpleDailyNotesMode;
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