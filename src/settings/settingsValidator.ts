import { LinkPluginSettings } from '../types';
import { DirectorySettings } from './directorySettings';
import { JournalSettings } from './journalSettings';
import { NoteSettings } from './noteSettings';
// import { ShortcodeSettings } from './shortcodeSettings'; // Deprecated - moved to quarantine
import { GeneralSettings } from './generalSettings';

export function validateSettings(settings: Partial<LinkPluginSettings>): LinkPluginSettings {
  // Create default settings by combining all modules
  const validatedSettings: LinkPluginSettings = {
    ...DirectorySettings.getDefaults(),
    ...JournalSettings.getDefaults(),
    ...NoteSettings.getDefaults(),
    // ...ShortcodeSettings.getDefaults(), // Deprecated - moved to quarantine
    ...GeneralSettings.getDefaults()
  };

  // Validate each category of settings
  const directoryValidation = DirectorySettings.validate(settings);
  const journalValidation = JournalSettings.validate(settings);
  const noteValidation = NoteSettings.validate(settings);
  // const shortcodeValidation = ShortcodeSettings.validate(settings); // Deprecated - moved to quarantine
  const generalValidation = GeneralSettings.validate(settings);

  // Merge validated settings
  Object.assign(validatedSettings, 
    directoryValidation,
    journalValidation,
    noteValidation,
    // shortcodeValidation, // Deprecated - moved to quarantine
    generalValidation
  );

  return validatedSettings;
}

export interface SettingsValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  validatedSettings: LinkPluginSettings;
}

export function validateSettingsWithDetails(settings: Partial<LinkPluginSettings>): SettingsValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate note template if provided
  if (settings.noteTemplate) {
    const templateValidation = NoteSettings.validateTemplate(settings.noteTemplate);
    if (!templateValidation.isValid) {
      errors.push(...templateValidation.errors);
    }
  }

  // Validate journal date format if provided
  if (settings.journalDateFormat && !JournalSettings.isValidDateFormat(settings.journalDateFormat)) {
    warnings.push('Invalid journal date format provided, using default');
  }

  // Validate shortcode patterns if provided (deprecated - moved to quarantine)
  // if (settings.customShortcodes) {
  //   for (const [pattern, expansion] of Object.entries(settings.customShortcodes)) {
  //     if (!ShortcodeSettings.isValidShortcodePattern(pattern)) {
  //       warnings.push(`Invalid shortcode pattern: ${pattern}`);
  //     }
  //   }
  // }

  // Basic directory structure validation
  if (settings.directoryStructure && settings.directoryStructure.length === 0) {
    warnings.push('Empty directory structure provided, using defaults');
  }

  const validatedSettings = validateSettings(settings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    validatedSettings
  };
} 