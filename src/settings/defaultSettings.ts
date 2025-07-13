import { LinkPluginSettings } from '../types'
import { DirectorySettings } from './directorySettings'
import { JournalSettings } from './journalSettings'
import { DailyNotesSettings } from './dailyNotesSettings'
import { GeneralSettings } from './generalSettings'

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  ...DirectorySettings.getDefaults(),
  ...JournalSettings.getDefaults(),
  ...DailyNotesSettings.getDefaults(),
  ...GeneralSettings.getDefaults(),
  customTemplateLocation: undefined
}
