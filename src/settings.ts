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
  ShortcodeSettings,
  type ShortcodeSettingsConfig
} from './settings/shortcodeSettings';

export {
  GeneralSettings,
  type GeneralSettingsConfig
} from './settings/generalSettings';

// Re-export default settings
export { DEFAULT_SETTINGS } from './settings/defaultSettings';