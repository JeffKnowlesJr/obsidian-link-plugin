import { LinkPluginSettings } from '../types'
import { DirectorySettings } from './directorySettings'
import { JournalSettings } from './journalSettings'
import { NoteSettings } from './noteSettings'
import { DailyNotesSettings } from './dailyNotesSettings'
// import { ShortcodeSettings } from './shortcodeSettings'; // Deprecated - moved to quarantine
import { GeneralSettings } from './generalSettings'

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  ...DirectorySettings.getDefaults(),
  ...JournalSettings.getDefaults(),
  ...NoteSettings.getDefaults(),
  ...DailyNotesSettings.getDefaults(),
  // ...ShortcodeSettings.getDefaults(), // Deprecated - moved to quarantine
  ...GeneralSettings.getDefaults(),
  customTemplateLocation: undefined
}
