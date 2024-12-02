export interface LinkPluginSettings {
  defaultLinkStyle: string
  autoFormatLinks: boolean
  dailyNotesLocation: string
}

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  defaultLinkStyle: 'markdown',
  autoFormatLinks: true,
  dailyNotesLocation: ''
}
