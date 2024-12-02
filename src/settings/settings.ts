export interface LinkPluginSettings {
  defaultLinkStyle: string
  autoFormatLinks: boolean
  dailyNotesLocation: string
  autoRevealFile: boolean
}

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  defaultLinkStyle: 'markdown',
  autoFormatLinks: true,
  dailyNotesLocation: '',
  autoRevealFile: true
}
