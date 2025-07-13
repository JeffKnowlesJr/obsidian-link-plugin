import { LinkPluginSettings } from '../types'
import { DirectorySettings } from './directorySettings'
import { JournalSettings } from './journalSettings'
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

  // Validate customTemplateLocation
  if (typeof settings.customTemplateLocation === 'string') {
    validatedSettings.customTemplateLocation =
      settings.customTemplateLocation.trim()
  } else {
    validatedSettings.customTemplateLocation = undefined
  }

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



  // Validate journal date format if provided
  if (
    settings.journalDateFormat &&
    !JournalSettings.isValidDateFormat(settings.journalDateFormat)
  ) {
    warnings.push('Invalid journal date format provided, using default')
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
