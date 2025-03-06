import { App, Vault } from 'obsidian'
import {
  ensureFolderStructure,
  createFolderStructure,
  ROOT_FOLDER
} from '../folderUtils'
import { LinkPluginSettings, FolderTemplate } from '../../settings/settings'

// Mock the vault adapter and functions
const mockVault = {
  adapter: {
    exists: jest.fn().mockImplementation(() => Promise.resolve(false)),
    read: jest.fn(),
    write: jest.fn(),
    list: jest.fn()
  },
  createFolder: jest.fn().mockImplementation(() => Promise.resolve(undefined)),
  create: jest.fn(),
  delete: jest.fn(),
  getAbstractFileByPath: jest.fn()
} as unknown as Vault

// Mock app
const mockApp = {
  vault: mockVault
} as unknown as App

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks()

  // Default mock implementations
  mockVault.adapter.exists.mockImplementation(() => Promise.resolve(false)) // Assume folders don't exist by default
  mockVault.createFolder.mockImplementation(() => Promise.resolve(undefined)) // Mock successful folder creation
})

describe('Folder Structure Templates', () => {
  // Mock settings for testing
  const mockSettings: LinkPluginSettings = {
    defaultLinkStyle: 'markdown',
    autoFormatLinks: true,
    dailyNotesLocation: '',
    autoRevealFile: true,
    autoUpdateMonthlyFolders: true,
    checkIntervalMinutes: 60,
    folderTemplates: [
      {
        id: 'test-template',
        name: 'Test Template',
        description: 'For testing',
        isEnabled: true,
        structure: JSON.stringify({
          _Journal: {
            y_$YEAR$: {
              $MONTH$: {}
            }
          },
          Templates: {}
        })
      },
      {
        id: 'disabled-template',
        name: 'Disabled Template',
        description: 'This template is disabled',
        isEnabled: false,
        structure: JSON.stringify({
          DisabledFolder: {}
        })
      }
    ],
    activeTemplateId: 'test-template'
  }

  test('ensureFolderStructure creates the root folder first', async () => {
    await ensureFolderStructure(mockApp, mockSettings)

    // Check that the root folder was created
    expect(mockVault.adapter.exists).toHaveBeenCalledWith(ROOT_FOLDER)
    expect(mockVault.createFolder).toHaveBeenCalledWith(ROOT_FOLDER)
  })

  test('ensureFolderStructure uses the active template', async () => {
    await ensureFolderStructure(mockApp, mockSettings)

    // Get the active template from settings
    const activeTemplate = mockSettings.folderTemplates.find(
      (t) => t.id === mockSettings.activeTemplateId
    )

    // Root structure from the template
    const structure = JSON.parse(activeTemplate!.structure)

    // Check that Journal folder was created (from the active template)
    const journalPath = `${ROOT_FOLDER}/_Journal`
    expect(mockVault.adapter.exists).toHaveBeenCalledWith(journalPath)
    expect(mockVault.createFolder).toHaveBeenCalledWith(journalPath)

    // Check that Templates folder was created (from the active template)
    const templatesPath = `${ROOT_FOLDER}/Templates`
    expect(mockVault.adapter.exists).toHaveBeenCalledWith(templatesPath)
    expect(mockVault.createFolder).toHaveBeenCalledWith(templatesPath)

    // Check that disabled template folders weren't created
    const disabledPath = `${ROOT_FOLDER}/DisabledFolder`
    expect(mockVault.adapter.exists).not.toHaveBeenCalledWith(disabledPath)
    expect(mockVault.createFolder).not.toHaveBeenCalledWith(disabledPath)
  })

  test('ensureFolderStructure processes template variables', async () => {
    // Mock the current date to ensure predictable results
    const mockDate = new Date(2025, 0, 15) // January 15, 2025
    const realDate = global.Date
    global.Date = class extends Date {
      constructor() {
        super()
        return mockDate
      }
    } as typeof global.Date

    await ensureFolderStructure(mockApp, mockSettings)

    // Check that year folder was created with correct variable replacement
    const yearFolder = `${ROOT_FOLDER}/_Journal/y_2025`
    expect(mockVault.adapter.exists).toHaveBeenCalledWith(yearFolder)
    expect(mockVault.createFolder).toHaveBeenCalledWith(yearFolder)

    // Check that month folder was created with correct variable replacement
    const monthFolder = `${yearFolder}/January`
    expect(mockVault.adapter.exists).toHaveBeenCalledWith(monthFolder)
    expect(mockVault.createFolder).toHaveBeenCalledWith(monthFolder)

    // Restore original Date
    global.Date = realDate
  })

  test('ensureFolderStructure falls back to another template if active template is not found', async () => {
    // Create settings with non-existent active template ID
    const settingsWithBadTemplateId = {
      ...mockSettings,
      activeTemplateId: 'non-existent-id'
    }

    await ensureFolderStructure(mockApp, settingsWithBadTemplateId)

    // Should fall back to the first enabled template
    const journalPath = `${ROOT_FOLDER}/_Journal`
    expect(mockVault.createFolder).toHaveBeenCalledWith(journalPath)
  })

  test('ensureFolderStructure throws error when no valid templates are found', async () => {
    // Create settings with no enabled templates
    const settingsWithNoEnabledTemplates = {
      ...mockSettings,
      folderTemplates: [
        {
          id: 'all-disabled',
          name: 'All Disabled',
          description: 'All templates are disabled',
          isEnabled: false,
          structure: JSON.stringify({
            ShouldNotBeCreated: {}
          })
        }
      ]
    }

    // Expect the function to throw an error
    await expect(
      ensureFolderStructure(mockApp, settingsWithNoEnabledTemplates)
    ).rejects.toThrow('No valid folder template found')

    // No folders should be created
    expect(mockVault.createFolder).not.toHaveBeenCalled()
  })

  test('ensureFolderStructure gracefully handles invalid JSON', async () => {
    // Create settings with invalid JSON in the template structure
    const settingsWithInvalidJson = {
      ...mockSettings,
      folderTemplates: [
        {
          id: 'invalid-json',
          name: 'Invalid JSON',
          description: 'Template with invalid JSON',
          isEnabled: true,
          structure: '{invalid: json'
        }
      ],
      activeTemplateId: 'invalid-json'
    }

    // Expect the function to throw an error
    await expect(
      ensureFolderStructure(mockApp, settingsWithInvalidJson)
    ).rejects.toThrow('Invalid template structure')

    // Root folder should be created, but no other folders
    expect(mockVault.createFolder).toHaveBeenCalledTimes(1)
    expect(mockVault.createFolder).toHaveBeenCalledWith(ROOT_FOLDER)
  })
})
