import { DEFAULT_DIRECTORIES, DEFAULT_BASE_FOLDER } from '../constants';

export interface DirectorySettingsConfig {
  baseFolder: string;
  directoryStructure: string[];
  restrictedDirectories: string[];
  documentDirectory: string;
  journalRootFolder: string;
}

export class DirectorySettings {
  static getDefaults(): DirectorySettingsConfig {
    return {
      baseFolder: DEFAULT_BASE_FOLDER, // Creates all directories under 'Link/' by default
      directoryStructure: DEFAULT_DIRECTORIES,
      restrictedDirectories: [],
      documentDirectory: 'journal', // Simplified to journal only
      journalRootFolder: 'journal', // Updated to match README structure
    };
  }

  static validate(settings: Partial<DirectorySettingsConfig>): Partial<DirectorySettingsConfig> {
    const validated: Partial<DirectorySettingsConfig> = {};

    // Validate base folder setting
    if (settings.baseFolder !== undefined && typeof settings.baseFolder === 'string') {
      const trimmed = settings.baseFolder.trim();
      // If empty, use root (empty string)
      validated.baseFolder = trimmed === '' ? '' : trimmed;
    }

    // Validate directory structure
    if (settings.directoryStructure && Array.isArray(settings.directoryStructure)) {
      validated.directoryStructure = settings.directoryStructure;
    }

    // Validate restricted directories
    if (settings.restrictedDirectories && Array.isArray(settings.restrictedDirectories)) {
      validated.restrictedDirectories = settings.restrictedDirectories;
    }

    // Validate document directory
    if (settings.documentDirectory && typeof settings.documentDirectory === 'string') {
      validated.documentDirectory = settings.documentDirectory;
    }

    // Validate journal root folder
    if (settings.journalRootFolder && typeof settings.journalRootFolder === 'string') {
      validated.journalRootFolder = settings.journalRootFolder;
    }

    return validated;
  }
} 