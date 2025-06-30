// Default base folder to prevent collision with existing vault structure
export const DEFAULT_BASE_FOLDER = 'LinkPlugin';

// Updated directory structure based on README specifications
export const DEFAULT_DIRECTORIES = [
  'journal',
  'templates',
  'workspace',
  'reference'
];

// Detailed journal structure as shown in README
export const DEFAULT_JOURNAL_STRUCTURE = {
  'journal': {
    'Misc': null,
    'y_2025': {
      'January': null,
      'February': null,
      'March': null,
      'April': null,
      'May': null,
      'June': null,
      'Misc': null,
      'Yearly List': null,
      'Yearly Log': null
    },
    'z_Archives': {
      'y_2022': null,
      'y_2023': null,
      'y_2024': null
    }
  }
};

// Reference structure as shown in README
export const DEFAULT_REFERENCE_STRUCTURE = {
  'reference': {
    'files': {
      'images': null,
      'pdfs': null,
      'videos': null,
      'audio': null,
      'docs': null,
      'other': null
    }
  }
};

// Optional complex structure mentioned in README
export const OPTIONAL_DIRECTORIES = [
  'context',
  'schema',
  'Projects'
];

export const COMMAND_IDS = {
  CREATE_LINKED_NOTE: 'create-linked-note',
  REBUILD_DIRECTORY: 'rebuild-directory-structure',
  OPEN_TODAY_JOURNAL: 'open-today-journal',
  CREATE_TODAY_NOTE: 'create-today-note',
  CREATE_FUTURE_NOTE: 'create-future-note',
  CREATE_MONTHLY_FOLDERS: 'create-monthly-folders',
  EXPAND_SHORTCODE: 'expand-shortcode',
  SHOW_LINK_SUGGESTIONS: 'show-link-suggestions'
} as const;

// Ribbon button configurations
export const RIBBON_BUTTONS = {
  TODAY_JOURNAL: {
    icon: 'calendar-days',
    title: 'Open Today\'s Journal',
    tooltip: 'Open or create today\'s journal entry'
  },
  CREATE_NOTE: {
    icon: 'file-plus',
    title: 'Create Linked Note',
    tooltip: 'Create a new linked note from selected text'
  },
  MONTHLY_FOLDERS: {
    icon: 'folder-plus',
    title: 'Create Monthly Folders',
    tooltip: 'Create monthly folders for the current year'
  },
  SHORTCODE_HELP: {
    icon: 'zap',
    title: 'Shortcode Help',
    tooltip: 'Show available shortcodes and examples'
  },
  REBUILD_STRUCTURE: {
    icon: 'folder-sync',
    title: 'Rebuild Directory Structure',
    tooltip: 'Rebuild the plugin\'s directory structure'
  },
  PLUGIN_SETTINGS: {
    icon: 'settings',
    title: 'Link Plugin Settings',
    tooltip: 'Open Link Plugin settings'
  }
} as const;

export const DATE_FORMATS = {
  DEFAULT_JOURNAL: 'YYYY-MM-DD dddd',
  ISO_DATE: 'YYYY-MM-DD',
  FOLDER_FORMAT: 'YYYY/MM'
} as const;

export const SHORTCODE_PATTERNS = {
  ELEMENT: /^[a-zA-Z0-9_-]+$/,
  MULTIPLIER: /^[a-zA-Z0-9_-]+\*\d+$/,
  CHILD: />/,
  SIBLING: /\+/,
  CONTENT: /\{.*\}/,
  ATTRIBUTE: /\[.*\]/,
  GROUP: /\(.*\)/
} as const;

export const ERROR_MESSAGES = {
  INVALID_PATH: 'Invalid file path provided',
  DIRECTORY_CREATE_FAILED: 'Failed to create directory',
  FILE_CREATE_FAILED: 'Failed to create file',
  SHORTCODE_PARSE_ERROR: 'Failed to parse shortcode',
  JOURNAL_CREATE_ERROR: 'Failed to create journal entry'
} as const;

export const DEFAULT_TEMPLATES = {
  JOURNAL: `# {{date}}

## Daily Log

## Tasks
- [ ] 

## Notes

## Reflection

---
Previous: {{previous}}
Next: {{next}}
`,
  NOTE: `---
title: {{title}}
created: {{date}}
source: {{source}}
tags: []
---

# {{title}}

`
} as const;

export const REGEX_PATTERNS = {
  WIKI_LINK: /\[\[(.*?)\]\]/g,
  SHORTCODE: /[\w>+*{}\[\]()]+$/,
  DATE_FILENAME: /\d{4}-\d{2}-\d{2}/,
  INVALID_FILENAME_CHARS: /[\\/:*?"<>|]/g
} as const;