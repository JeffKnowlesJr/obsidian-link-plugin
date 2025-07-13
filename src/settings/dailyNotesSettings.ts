import { LinkPluginSettings, DailyNotesBackup } from '../types'

// This is a simple validation and defaulting algorithm.
// It checks if the 'dailyNotesIntegration' property exists in the settings object.
// If not, it returns the default values. If it does exist, it validates the structure
// and fills in missing or invalid fields with defaults.
// This is a form of "defensive programming" and "object merging" pattern, but not a complex algorithm.
// It is not a search, sort, or optimization algorithm; it's a settings validation/merging routine.

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
