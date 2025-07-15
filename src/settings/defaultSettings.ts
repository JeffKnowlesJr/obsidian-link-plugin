/**
 * Algorithms for DEFAULT_SETTINGS:
 * 
 * - For each settings module (DirectorySettings, JournalSettings, DailyNotesSettings, GeneralSettings):
 *   1. Call the getDefaults() method to retrieve the default settings object for that module.
 *   2. Spread the returned defaults into the DEFAULT_SETTINGS object.
 * - The resulting DEFAULT_SETTINGS object conforms to the LinkPluginSettings interface and contains all default values.
 */

import { LinkPluginSettings } from '../types'
import { DirectorySettings } from './directorySettings'
import { DailyNotesSettings } from './journalSettings'
import { DailyNotesSettings as DailyNotesIntegrationSettings } from './dailyNotesSettings'
import { GeneralSettings } from './generalSettings'

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  ...DirectorySettings.getDefaults(),
  ...DailyNotesSettings.getDefaults(),
  ...DailyNotesIntegrationSettings.getDefaults(),
  ...GeneralSettings.getDefaults()
}
