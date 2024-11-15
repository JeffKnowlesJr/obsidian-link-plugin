export interface LinkPluginSettings {
  defaultLinkStyle: string
  autoFormatLinks: boolean
}

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  defaultLinkStyle: 'markdown',
  autoFormatLinks: true
}
