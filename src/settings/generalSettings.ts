/**
 * Algorithm for GeneralSettings:
 * 
 * - getDefaults():
 *   Returns the default general settings object, with debugMode set to false.
 * 
 * - validate(settings):
 *   1. Create an empty validated object.
 *   2. If the input settings object has a debugMode property of type boolean,
 *      copy it to the validated object.
 *   3. Return the validated object, which only includes valid properties.
 * 
 * - getDebugInfo():
 *   Returns an object containing:
 *     - The current timestamp (ISO string)
 *     - The user's browser userAgent
 *     - The user's platform
 *     - The user's language
 */

export interface GeneralSettingsConfig {
  enabled: boolean;
  showRibbonButton: boolean;
  debugMode: boolean;
}

export class GeneralSettings {
  static getDefaults(): GeneralSettingsConfig {
    return {
      enabled: false,
      showRibbonButton: true,
      debugMode: false,
    };
  }

  static validate(settings: Partial<GeneralSettingsConfig>): Partial<GeneralSettingsConfig> {
    const validated: Partial<GeneralSettingsConfig> = {};

    // Validate enabled setting
    if (typeof settings.enabled === 'boolean') {
      validated.enabled = settings.enabled;
    }

    // Validate ribbon button setting
    if (typeof settings.showRibbonButton === 'boolean') {
      validated.showRibbonButton = settings.showRibbonButton;
    }

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