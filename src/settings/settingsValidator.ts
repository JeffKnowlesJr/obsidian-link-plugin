/**
 * Algorithms for settingsValidator.ts:
 * 
 * - validateSettings(settings):
 *   1. Create a validatedSettings object by merging defaults from DirectorySettings, JournalSettings, DailyNotesSettings, and GeneralSettings.
 *   2. Validate each category of settings using their respective validate() methods.
 *   3. Merge the validated results from each category into validatedSettings.
 *   4. Return the validatedSettings object.
 * 
 * - validateSettingsWithDetails(settings):
 *   1. Initialize empty errors and warnings arrays.
 *   2. If journalDateFormat is provided and invalid, add a warning.
 *   3. If directoryStructure is provided and empty, add a warning.
 *   4. Call validateSettings to get the validated settings.
 *   5. Return an object with isValid (true if no errors), errors, warnings, and validatedSettings.
 */

import { LinkPluginSettings } from '../types'
import { DirectorySettings } from './directorySettings'
import { DailyNotesSettings as JournalSettings } from './journalSettings'
import { DailyNotesSettings } from './dailyNotesSettings'
// import { ShortcodeSettings } from './shortcodeSettings'; // Deprecated - moved to quarantine
import { GeneralSettings } from './generalSettings'

export function validateSettings(
  settings: Partial<LinkPluginSettings>
): LinkPluginSettings {
  // Create default settings by combining all modules
  const validatedSettings: LinkPluginSettings = {
    ...DirectorySettings.getDefaults(),
    ...JournalSettings.getDefaults(),
    ...DailyNotesSettings.getDefaults(),
    ...GeneralSettings.getDefaults()
  }

  // Validate each category of settings
  const directoryValidation = DirectorySettings.validate(settings)
  const journalValidation = JournalSettings.validate(settings)
  const dailyNotesValidation = DailyNotesSettings.validate(settings)
  const generalValidation = GeneralSettings.validate(settings)

  // Merge validated settings
  Object.assign(
    validatedSettings,
    directoryValidation,
    journalValidation,
    dailyNotesValidation,
    generalValidation
  )

  return validatedSettings
}

export interface SettingsValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  validatedSettings: LinkPluginSettings
}

export function validateSettingsWithDetails(
  settings: Partial<LinkPluginSettings>
): SettingsValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Validate daily note date format if provided
  if (
    settings.dailyNoteDateFormat &&
    !JournalSettings.isValidDateFormat(settings.dailyNoteDateFormat)
  ) {
    warnings.push('Invalid daily note date format provided, using default')
  }
  // Basic directory structure validation
  if (settings.directoryStructure && settings.directoryStructure.length === 0) {
    warnings.push('Empty directory structure provided, using defaults')
  }

  const validatedSettings = validateSettings(settings)

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validatedSettings
  }
}
