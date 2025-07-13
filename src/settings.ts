/**
 * Algorithms for settings module:
 *
 * 1. Settings Validation:
 *    - validateSettings: Checks if a settings object matches the expected schema and types.
 *    - validateSettingsWithDetails: Returns detailed validation results, including errors and warnings.
 *
 * 2. Modular Settings Structure:
 *    - Each settings domain (Directory, Journal, Note, General) is defined in its own module with config types and logic.
 *    - These modules can be imported individually for advanced usage or testing.
 *
 * 3. Default Settings Export:
 *    - DEFAULT_SETTINGS provides a baseline configuration for initializing the plugin or resetting user settings.
 */

// Re-export everything from the modular settings structure
export { 
  validateSettings,
  validateSettingsWithDetails,
  type SettingsValidationResult
} from './settings/settingsValidator';

// Re-export individual setting modules for advanced usage
export {
  DirectorySettings,
  type DirectorySettingsConfig
} from './settings/directorySettings';

export {
  JournalSettings,
  type JournalSettingsConfig
} from './settings/journalSettings';

export {
  NoteSettings,
  type NoteSettingsConfig
} from './settings/noteSettings';

export {
  GeneralSettings,
  type GeneralSettingsConfig
} from './settings/generalSettings';

// Re-export default settings
export { DEFAULT_SETTINGS } from './settings/defaultSettings';