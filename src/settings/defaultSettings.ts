import { LinkPluginSettings } from '../types';
import { DirectorySettings } from './directorySettings';
import { JournalSettings } from './journalSettings';
import { NoteSettings } from './noteSettings';
import { ShortcodeSettings } from './shortcodeSettings';
import { GeneralSettings } from './generalSettings';

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  ...DirectorySettings.getDefaults(),
  ...JournalSettings.getDefaults(),
  ...NoteSettings.getDefaults(),
  ...ShortcodeSettings.getDefaults(),
  ...GeneralSettings.getDefaults()
}; 