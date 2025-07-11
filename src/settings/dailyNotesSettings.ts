import { LinkPluginSettings, DailyNotesBackup } from '../types'

export class DailyNotesSettings {
  static getDefaults(): Pick<LinkPluginSettings, 'dailyNotesIntegration'> {
    return {
      dailyNotesIntegration: {
        enabled: false,
        backup: null
      }
    }
  }

  static validate(
    settings: Partial<LinkPluginSettings>
  ): Partial<LinkPluginSettings> {
    const defaults = this.getDefaults()

    // If dailyNotesIntegration is not provided, use defaults
    if (!settings.dailyNotesIntegration) {
      return defaults
    }

    // Validate the structure
    const integration = settings.dailyNotesIntegration

    return {
      dailyNotesIntegration: {
        enabled:
          typeof integration.enabled === 'boolean'
            ? integration.enabled
            : defaults.dailyNotesIntegration.enabled,
        backup: integration.backup || null
      }
    }
  }
}
