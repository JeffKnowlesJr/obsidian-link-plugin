export interface ShortcodeSettingsConfig {
  shortcodeEnabled: boolean;
  shortcodeTriggerKey: string;
  customShortcodes: Record<string, string>;
}

export class ShortcodeSettings {
  static getDefaults(): ShortcodeSettingsConfig {
    return {
      shortcodeEnabled: true,
      shortcodeTriggerKey: 'Tab',
      customShortcodes: {},
    };
  }

  static validate(settings: Partial<ShortcodeSettingsConfig>): Partial<ShortcodeSettingsConfig> {
    const validated: Partial<ShortcodeSettingsConfig> = {};

    // Validate shortcode enabled setting
    if (typeof settings.shortcodeEnabled === 'boolean') {
      validated.shortcodeEnabled = settings.shortcodeEnabled;
    }

    // Validate shortcode trigger key
    if (settings.shortcodeTriggerKey && typeof settings.shortcodeTriggerKey === 'string') {
      const validTriggerKeys = ['Tab', 'Enter', 'Space'];
      if (validTriggerKeys.includes(settings.shortcodeTriggerKey)) {
        validated.shortcodeTriggerKey = settings.shortcodeTriggerKey;
      }
    }

    // Validate custom shortcodes
    if (settings.customShortcodes && typeof settings.customShortcodes === 'object') {
      const validatedShortcodes: Record<string, string> = {};
      
      for (const [key, value] of Object.entries(settings.customShortcodes)) {
        if (typeof key === 'string' && typeof value === 'string') {
          // Basic validation for shortcode patterns
          if (this.isValidShortcodePattern(key) && value.trim().length > 0) {
            validatedShortcodes[key] = value;
          }
        }
      }
      
      validated.customShortcodes = validatedShortcodes;
    }

    return validated;
  }

  static isValidShortcodePattern(pattern: string): boolean {
    // Basic pattern validation - alphanumeric, underscore, dash, and shortcode operators
    const validPattern = /^[a-zA-Z0-9_\-+>*{}\[\]()]+$/;
    return validPattern.test(pattern) && pattern.length > 0 && pattern.length <= 100;
  }

  static getBuiltinShortcodes(): Record<string, string> {
    return {
      'table3x4': 'Creates a 3x4 table structure',
      'h2+ul>li*3': 'Creates heading with 3-item list',
      'div>h3+ul>li*5': 'Creates section with heading and 5 list items',
      'link[url]{text}': 'Creates markdown link',
    };
  }
} 