export interface FolderTemplate {
  id: string
  name: string
  description: string
  isEnabled: boolean
  structure: string // JSON string representing folder structure
}

export interface LinkPluginSettings {
  // Daily Notes Management
  autoUpdateMonthlyFolders: boolean
  checkIntervalMinutes: number
  checkIntervalVariance: number // Add randomization to prevent system load spikes
  dailyNotesLocation: string // Current location of daily notes

  // Folder Template Management
  folderTemplates: FolderTemplate[]
  activeTemplateId: string

  // Link Processing
  hugoCompatibleLinks: boolean // Ensure links are Hugo-compatible
}

// Default folder templates
const DEFAULT_TEMPLATES: FolderTemplate[] = [
  {
    id: 'default',
    name: 'Default Structure',
    description: 'The default folder structure with all components',
    isEnabled: true,
    structure: JSON.stringify({
      Journal: {
        y_$YEAR$: {
          $MONTH$: {}
        }
      },
      Documents: {
        Images: {},
        Videos: {},
        Audio: {},
        Other: {}
      },
      Templates: {},
      Workspace: {
        'Client-X': {
          'Project-Alpha': {}
        },
        'Client-Y': {
          'Project-Beta': {}
        },
        'Client-Self': {
          'Project-Zen': {}
        }
      },
      References: {
        Books: {
          Technology: {},
          Business: {}
        },
        Articles: {
          'Blog-Posts': {},
          Research: {}
        },
        Courses: {
          Online: {},
          Certifications: {}
        }
      },
      Archive: {
        'Completed-Projects': {},
        'Old-References': {},
        'Old-Templates': {}
      }
    })
  },
  {
    id: 'minimal',
    name: 'Minimal Structure',
    description: 'Just the essential components (Journal and Templates)',
    isEnabled: true,
    structure: JSON.stringify({
      Journal: {
        y_$YEAR$: {
          $MONTH$: {}
        }
      },
      Templates: {}
    })
  },
  {
    id: 'research',
    name: 'Research Focus',
    description: 'Optimized for research and reference materials',
    isEnabled: false,
    structure: JSON.stringify({
      Journal: {
        y_$YEAR$: {
          $MONTH$: {}
        }
      },
      Templates: {},
      References: {
        Books: {
          Technology: {},
          Science: {},
          Humanities: {}
        },
        Papers: {
          Published: {},
          Drafts: {},
          References: {}
        },
        'Research-Notes': {
          Experiments: {},
          Observations: {},
          Ideas: {}
        }
      },
      Archive: {}
    })
  }
]

export const DEFAULT_SETTINGS: LinkPluginSettings = {
  // Daily Notes Management
  autoUpdateMonthlyFolders: true,
  checkIntervalMinutes: 60,
  checkIntervalVariance: 5, // +/- 5 minutes random variance
  dailyNotesLocation: '', // Will be set during initialization

  // Folder Template Management
  folderTemplates: DEFAULT_TEMPLATES,
  activeTemplateId: 'default',

  // Link Processing
  hugoCompatibleLinks: true
}
