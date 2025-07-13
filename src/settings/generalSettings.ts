export interface GeneralSettingsConfig {
  debugMode: boolean;
}

export class GeneralSettings {
  static getDefaults(): GeneralSettingsConfig {
    return {
      debugMode: false,
    };
  }

  static validate(settings: Partial<GeneralSettingsConfig>): Partial<GeneralSettingsConfig> {
    const validated: Partial<GeneralSettingsConfig> = {};

    // Validate debug mode setting
    if (typeof settings.debugMode === 'boolean') {
      validated.debugMode = settings.debugMode;
    }

    return validated;
  }

  static getDebugInfo(): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    };
  }
} 