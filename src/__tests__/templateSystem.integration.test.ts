import { App, TFolder, Vault } from 'obsidian'
import LinkPlugin from '../main'
import { TemplateManager } from '../templates/templateManager'
import { FolderTemplate, LinkPluginSettings } from '../settings/settings'
import { ROOT_FOLDER, ensureFolderStructure } from '../utils/folderUtils'

// Mock the vault adapter and functions
const mockVault = {
  adapter: {
    exists: jest
      .fn()
      .mockImplementation((path: string) => Promise.resolve(false)),
    read: jest.fn(),
    write: jest.fn(),
    list: jest.fn(),
    mkdir: jest.fn().mockImplementation(() => Promise.resolve())
  },
  createFolder: jest
    .fn()
    .mockImplementation((path: string) => Promise.resolve({} as TFolder)),
  create: jest.fn(),
  delete: jest.fn(),
  getAbstractFileByPath: jest.fn().mockImplementation(() => null)
} as unknown as Vault

// Mock app
const mockApp = {
  vault: mockVault
} as unknown as App

// Mock plugin
const mockPlugin = {
  app: mockApp,
  settings: {} as LinkPluginSettings,
  saveSettings: jest.fn().mockImplementation(() => Promise.resolve()),
  loadSettings: jest.fn().mockImplementation(() => Promise.resolve())
} as unknown as LinkPlugin

describe('Template System Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Setup default settings
    mockPlugin.settings = {
      defaultLinkStyle: 'markdown',
      autoFormatLinks: true,
      dailyNotesLocation: '',
      autoRevealFile: true,
      autoUpdateMonthlyFolders: true,
      checkIntervalMinutes: 60,
      folderTemplates: [
        {
          id: 'default',
          name: 'Default Template',
          description: 'Default folder structure',
          isEnabled: true,
          structure: JSON.stringify({
            Journal: {
              'Daily Notes': {}
            },
            Projects: {}
          })
        },
        {
          id: 'research',
          name: 'Research Template',
          description: 'For research projects',
          isEnabled: true,
          structure: JSON.stringify({
            Research: {
              Literature: {},
              Experiments: {},
              Results: {}
            }
          })
        }
      ],
      activeTemplateId: 'default'
    }

    // Reset mock implementations
    mockVault.adapter.exists.mockImplementation((path: string) => {
      // Return true for ROOT_FOLDER, false for all others
      return Promise.resolve(path === ROOT_FOLDER)
    })

    mockVault.getAbstractFileByPath.mockImplementation((path: string) => {
      // Return fake TFolder for ROOT_FOLDER, null for all others
      return path === ROOT_FOLDER ? ({} as TFolder) : null
    })
  })

  test('End-to-end template application', async () => {
    // 1. Initialize template manager
    const templateManager = new TemplateManager(mockPlugin.settings)

    // 2. Ensure the folder structure is created using the active template
    await ensureFolderStructure(mockApp, mockPlugin.settings)

    // Verify the default template folders were created
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Journal`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Journal/Daily Notes`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Projects`
    )

    // Research template folders should not have been created
    expect(mockVault.createFolder).not.toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Research`
    )

    // 3. Change the active template to 'research'
    templateManager.setActiveTemplate('research')
    mockPlugin.settings.activeTemplateId = 'research'

    // Reset the mock call history
    mockVault.createFolder.mockClear()

    // 4. Apply the new template
    await ensureFolderStructure(mockApp, mockPlugin.settings)

    // Verify the research template folders were created
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Research`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Research/Literature`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Research/Experiments`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Research/Results`
    )
  })

  test('Template with dynamic variables', async () => {
    // Mock the current date
    const mockDate = new Date(2025, 0, 15) // January 15, 2025
    const realDate = global.Date
    global.Date = class extends Date {
      constructor() {
        super()
        return mockDate
      }
    } as typeof global.Date

    // Create a template with dynamic variables
    const dynamicTemplate: FolderTemplate = {
      id: 'dynamic',
      name: 'Dynamic Template',
      description: 'Template with dynamic variables',
      isEnabled: true,
      structure: JSON.stringify({
        Year_$YEAR$: {
          Month_$MONTH$: {
            Daily_Notes: {}
          }
        }
      })
    }

    // Add the template and make it active
    mockPlugin.settings.folderTemplates.push(dynamicTemplate)
    mockPlugin.settings.activeTemplateId = 'dynamic'

    // Apply the template
    await ensureFolderStructure(mockApp, mockPlugin.settings)

    // Check that folders were created with variables replaced
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Year_2025`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Year_2025/Month_January`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Year_2025/Month_January/Daily_Notes`
    )

    // Restore original Date
    global.Date = realDate
  })

  test('Creating and applying a custom template', async () => {
    // 1. Initialize template manager
    const templateManager = new TemplateManager(mockPlugin.settings)

    // 2. Create a new custom template
    const customTemplate = templateManager.createNewTemplate()
    customTemplate.name = 'Custom Template'
    customTemplate.description = 'My custom folder structure'
    customTemplate.structure = JSON.stringify({
      CustomRoot: {
        SubfolderA: {},
        SubfolderB: {
          NestedFolder: {}
        }
      }
    })

    // 3. Add the template to settings
    templateManager.addTemplate(customTemplate)

    // 4. Set as active template
    templateManager.setActiveTemplate(customTemplate.id)
    mockPlugin.settings.activeTemplateId = customTemplate.id

    // 5. Apply the template
    await ensureFolderStructure(mockApp, mockPlugin.settings)

    // Verify the custom template folders were created
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/CustomRoot`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/CustomRoot/SubfolderA`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/CustomRoot/SubfolderB`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/CustomRoot/SubfolderB/NestedFolder`
    )
  })

  test('Cloning and modifying a template', async () => {
    // 1. Initialize template manager
    const templateManager = new TemplateManager(mockPlugin.settings)

    // 2. Clone the default template
    const clonedTemplate = templateManager.cloneTemplate('default')

    // 3. Modify the cloned template
    clonedTemplate.name = 'Modified Clone'
    clonedTemplate.structure = JSON.stringify({
      Journal: {
        'Daily Notes': {},
        'Weekly Notes': {} // Added this folder
      },
      Projects: {},
      Archive: {} // Added this folder
    })

    // 4. Update the template
    templateManager.updateTemplate(clonedTemplate)

    // 5. Set as active template
    templateManager.setActiveTemplate(clonedTemplate.id)
    mockPlugin.settings.activeTemplateId = clonedTemplate.id

    // 6. Apply the template
    await ensureFolderStructure(mockApp, mockPlugin.settings)

    // Verify all folders were created, including the new ones
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Journal`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Journal/Daily Notes`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Journal/Weekly Notes`
    ) // New folder
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Projects`
    )
    expect(mockVault.createFolder).toHaveBeenCalledWith(
      `${ROOT_FOLDER}/Archive`
    ) // New folder
  })

  test('Error handling for invalid template structure', async () => {
    // Create settings with invalid template structure
    const invalidSettings = {
      ...mockPlugin.settings,
      folderTemplates: [
        {
          id: 'invalid',
          name: 'Invalid Template',
          description: 'Template with invalid structure',
          isEnabled: true,
          structure: '{invalid json' // Invalid JSON
        }
      ],
      activeTemplateId: 'invalid'
    }

    // Expect the function to throw an error
    await expect(
      ensureFolderStructure(mockApp, invalidSettings)
    ).rejects.toThrow('Invalid template structure')

    // Only the root folder should be created
    expect(mockVault.createFolder).toHaveBeenCalledTimes(1)
    expect(mockVault.createFolder).toHaveBeenCalledWith(ROOT_FOLDER)
  })
})
