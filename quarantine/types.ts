// Types for quarantined shortcode system

export interface Token {
  type: 'element' | 'multiplier' | 'content' | 'attribute' | 'operator' | 'group';
  value: string;
  children?: Token[];
}

export interface ASTNode {
  type: string;
  name?: string;
  content?: string;
  attributes?: Record<string, string>;
  repeat?: number;
  children?: ASTNode[];
  parent?: string;
}

export interface ShortcodeDefinition {
  pattern: string;
  expansion: string;
  description: string;
  category: string;
}

export interface ShortcodeSettingsConfig {
  shortcodeEnabled: boolean;
  shortcodeTriggerKey: string;
  customShortcodes: Record<string, string>;
} 