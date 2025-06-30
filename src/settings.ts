import { LinkPluginSettings } from './types';
import { DEFAULT_DIRECTORIES, DEFAULT_BASE_FOLDER, DATE_FORMATS, DEFAULT_TEMPLATES } from './constants';

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  // Directory structure settings
  baseFolder: DEFAULT_BASE_FOLDER, // Creates all directories under 'LinkPlugin/' by default
  directoryStructure: DEFAULT_DIRECTORIES,
  restrictedDirectories: [],
  documentDirectory: 'workspace', // Updated to match README structure
  journalRootFolder: 'journal', // Updated to match README structure

  // Journal settings
  journalDateFormat: DATE_FORMATS.DEFAULT_JOURNAL,
  journalFolderFormat: DATE_FORMATS.FOLDER_FORMAT,
  journalTemplate: DEFAULT_TEMPLATES.JOURNAL,

  // Note creation settings
  noteTemplate: DEFAULT_TEMPLATES.NOTE,
  openNewNote: true,

  // Shortcode settings
  shortcodeEnabled: true,
  shortcodeTriggerKey: 'Tab',
  customShortcodes: {},

  // Other settings
  debugMode: false
};

export function validateSettings(settings: Partial<LinkPluginSettings>): LinkPluginSettings {
  const validatedSettings = { ...DEFAULT_SETTINGS };

  // Validate base folder setting
  if (settings.baseFolder && typeof settings.baseFolder === 'string') {
    validatedSettings.baseFolder = settings.baseFolder.trim();
  }

  // Validate and merge settings
  if (settings.directoryStructure && Array.isArray(settings.directoryStructure)) {
    validatedSettings.directoryStructure = settings.directoryStructure;
  }

  if (settings.restrictedDirectories && Array.isArray(settings.restrictedDirectories)) {
    validatedSettings.restrictedDirectories = settings.restrictedDirectories;
  }

  if (settings.documentDirectory && typeof settings.documentDirectory === 'string') {
    validatedSettings.documentDirectory = settings.documentDirectory;
  }

  if (settings.journalRootFolder && typeof settings.journalRootFolder === 'string') {
    validatedSettings.journalRootFolder = settings.journalRootFolder;
  }

  if (settings.journalDateFormat && typeof settings.journalDateFormat === 'string') {
    validatedSettings.journalDateFormat = settings.journalDateFormat;
  }

  if (settings.journalFolderFormat && typeof settings.journalFolderFormat === 'string') {
    validatedSettings.journalFolderFormat = settings.journalFolderFormat;
  }

  if (settings.journalTemplate && typeof settings.journalTemplate === 'string') {
    validatedSettings.journalTemplate = settings.journalTemplate;
  }

  if (settings.noteTemplate && typeof settings.noteTemplate === 'string') {
    validatedSettings.noteTemplate = settings.noteTemplate;
  }

  if (typeof settings.openNewNote === 'boolean') {
    validatedSettings.openNewNote = settings.openNewNote;
  }

  if (typeof settings.shortcodeEnabled === 'boolean') {
    validatedSettings.shortcodeEnabled = settings.shortcodeEnabled;
  }

  if (settings.shortcodeTriggerKey && typeof settings.shortcodeTriggerKey === 'string') {
    validatedSettings.shortcodeTriggerKey = settings.shortcodeTriggerKey;
  }

  if (settings.customShortcodes && typeof settings.customShortcodes === 'object') {
    validatedSettings.customShortcodes = settings.customShortcodes;
  }

  if (typeof settings.debugMode === 'boolean') {
    validatedSettings.debugMode = settings.debugMode;
  }

  return validatedSettings;
}