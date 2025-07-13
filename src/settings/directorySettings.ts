import { DEFAULT_DIRECTORIES, DEFAULT_BASE_FOLDER } from '../constants'

export interface DirectorySettingsConfig {
  baseFolder: string
  directoryStructure: string[]
  restrictedDirectories: string[]
  documentDirectory: string
  journalRootFolder: string
}

export class DirectorySettings {
  static getDefaults(): DirectorySettingsConfig {
    return {
      baseFolder: DEFAULT_BASE_FOLDER, // Creates all directories under 'Link/' by default
      directoryStructure: ['journal'],
      restrictedDirectories: [],
      documentDirectory: 'journal', // Simplified to journal only
      journalRootFolder: 'journal' // Updated to match README structure
    }
  }

  /**
   * This function validates and sanitizes a partial DirectorySettingsConfig object.
   * 
   * - For each property in the input `settings` object, it checks if the property exists and is of the correct type.
   * - For `baseFolder`, it trims whitespace and, if the result is empty or only slashes, sets it to the root (empty string).
   * - For array properties (`directoryStructure`, `restrictedDirectories`), it checks if they are arrays and copies them if so.
   * - For string properties (`documentDirectory`, `journalRootFolder`), it checks if they are strings and copies them if so.
   * - Only valid and present properties are included in the returned object; missing or invalid properties are omitted.
   * 
   * This is a defensive programming pattern to ensure that only valid, sanitized settings are used, and to prevent
   * malformed or unexpected input from causing issues in the application.
   */
  static validate(
    settings: Partial<DirectorySettingsConfig>
  ): Partial<DirectorySettingsConfig> {
    const validated: Partial<DirectorySettingsConfig> = {}

    // Validate base folder setting
    if (
      settings.baseFolder !== undefined &&
      typeof settings.baseFolder === 'string'
    ) {
      const trimmed = settings.baseFolder.trim()
      // If empty or only slashes, use root (empty string)
      if (trimmed === '' || /^\/*$/.test(trimmed)) {
        validated.baseFolder = ''
      } else {
        validated.baseFolder = trimmed
      }
    }

    // Validate directory structure
    if (
      settings.directoryStructure &&
      Array.isArray(settings.directoryStructure)
    ) {
      validated.directoryStructure = settings.directoryStructure
    }

    // Validate restricted directories
    if (
      settings.restrictedDirectories &&
      Array.isArray(settings.restrictedDirectories)
    ) {
      validated.restrictedDirectories = settings.restrictedDirectories
    }

    // Validate document directory
    if (
      settings.documentDirectory &&
      typeof settings.documentDirectory === 'string'
    ) {
      validated.documentDirectory = settings.documentDirectory
    }

    // Validate journal root folder
    if (
      settings.journalRootFolder &&
      typeof settings.journalRootFolder === 'string'
    ) {
      validated.journalRootFolder = settings.journalRootFolder
    }

    return validated
  }
}
