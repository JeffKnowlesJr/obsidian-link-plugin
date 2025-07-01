import { DEFAULT_TEMPLATES } from '../constants';

export interface NoteSettingsConfig {
  noteTemplate: string;
}

export class NoteSettings {
  static getDefaults(): NoteSettingsConfig {
    return {
      noteTemplate: DEFAULT_TEMPLATES.NOTE,
    };
  }

  static validate(settings: Partial<NoteSettingsConfig>): Partial<NoteSettingsConfig> {
    const validated: Partial<NoteSettingsConfig> = {};

    // Validate note template
    if (settings.noteTemplate && typeof settings.noteTemplate === 'string') {
      validated.noteTemplate = settings.noteTemplate;
    }

    return validated;
  }

  static validateTemplate(template: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for required template variables
    const requiredVars = ['{{title}}'];
    const missingVars = requiredVars.filter(varName => !template.includes(varName));
    
    if (missingVars.length > 0) {
      errors.push(`Missing required template variables: ${missingVars.join(', ')}`);
    }

    // Check for malformed template variables
    const templateVarPattern = /\{\{[^}]*\}\}/g;
    const matches = template.match(templateVarPattern);
    if (matches) {
      matches.forEach(match => {
        if (!match.endsWith('}}')) {
          errors.push(`Malformed template variable: ${match}`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 