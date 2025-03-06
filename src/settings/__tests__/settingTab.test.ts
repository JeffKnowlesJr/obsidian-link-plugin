import { LinkPluginSettingTab } from '../settingTab'
import { App, PluginSettingTab } from 'obsidian'
import { LinkPlugin } from '../../main'
import { FolderTemplate, LinkPluginSettings } from '../settings'

// Mock Obsidian components
jest.mock('obsidian', () => {
  const original = jest.requireActual('obsidian')

  return {
    ...original,
    // Mock element-creation API
    Setting: jest.fn().mockImplementation(() => ({
      setName: jest.fn().mockReturnThis(),
      setDesc: jest.fn().mockReturnThis(),
      addToggle: jest.fn().mockImplementation(() => ({
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      })),
      addText: jest.fn().mockImplementation(() => ({
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis(),
        inputEl: {
          addEventListener: jest.fn()
        }
      })),
      addTextArea: jest.fn().mockImplementation(() => ({
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      })),
      addButton: jest.fn().mockImplementation(() => ({
        setButtonText: jest.fn().mockReturnThis(),
        onClick: jest.fn().mockReturnThis()
      })),
      addDropdown: jest.fn().mockImplementation(() => ({
        addOption: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      })),
      addSlider: jest.fn().mockImplementation(() => ({
        setLimits: jest.fn().mockReturnThis(),
        setValue: jest.fn().mockReturnThis(),
        setDynamicTooltip: jest.fn().mockReturnThis(),
        onChange: jest.fn().mockReturnThis()
      })),
      settingEl: {
        createEl: jest.fn().mockImplementation(() => ({
          createEl: jest.fn(),
          appendChild: jest.fn()
        })),
        appendChild: jest.fn()
      }
    })),
    // Mock plugin API
    PluginSettingTab: jest.fn(),
    // Mock fragment
    createFragment: jest.fn().mockImplementation(() => ({
      createEl: jest.fn().mockImplementation(() => ({
        setText: jest.fn().mockReturnThis(),
        addEventListener: jest.fn().mockReturnThis()
      })),
      appendChild: jest.fn()
    }))
  }
})

// Mock plugin
const mockPlugin = {
  settings: {} as LinkPluginSettings,
  saveSettings: jest.fn().mockImplementation(() => Promise.resolve()),
  app: {} as App
} as unknown as LinkPlugin

describe('LinkPluginSettingTab', () => {
  let settingTab: LinkPluginSettingTab

  beforeEach(() => {
    // Reset mock settings
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

    // Reset mocks
    jest.clearAllMocks()

    // Initialize the setting tab
    settingTab = new LinkPluginSettingTab(mockPlugin.app, mockPlugin)
  })

  test('should initialize the setting tab', () => {
    expect(settingTab).toBeDefined()
  })

  test('should display settings when display() is called', () => {
    // Mock the containerEl
    const mockContainerEl = {
      empty: jest.fn(),
      createEl: jest.fn().mockImplementation(() => ({
        setText: jest.fn()
      })),
      appendChild: jest.fn()
    }
    settingTab.containerEl = mockContainerEl as any

    // Call display method
    settingTab.display()

    // Check that containerEl was emptied
    expect(mockContainerEl.empty).toHaveBeenCalled()
  })

  test('should save settings when changes are made', async () => {
    // Create a mock setting update function from the tab
    const updateSettings = settingTab.updateTemplateSettings

    // Mock updated template
    const updatedTemplate: FolderTemplate = {
      id: 'default',
      name: 'Updated Template',
      description: 'Updated description',
      isEnabled: true,
      structure: JSON.stringify({
        UpdatedFolder: {}
      })
    }

    // Update template
    await updateSettings(updatedTemplate)

    // Verify that saveSettings was called
    expect(mockPlugin.saveSettings).toHaveBeenCalled()

    // Verify that the settings were updated
    const template = mockPlugin.settings.folderTemplates.find(
      (t) => t.id === 'default'
    )
    expect(template).toBeDefined()
    expect(template?.name).toBe('Updated Template')
    expect(template?.description).toBe('Updated description')
  })

  test('should add a new template', async () => {
    // Get initial template count
    const initialCount = mockPlugin.settings.folderTemplates.length

    // Call the add template function
    await settingTab.addNewTemplate()

    // Verify a new template was added
    expect(mockPlugin.settings.folderTemplates.length).toBe(initialCount + 1)
    expect(mockPlugin.saveSettings).toHaveBeenCalled()
  })

  test('should delete a template', async () => {
    // Get initial template count
    const initialCount = mockPlugin.settings.folderTemplates.length

    // Call the delete template function
    await settingTab.deleteTemplate('research')

    // Verify the template was deleted
    expect(mockPlugin.settings.folderTemplates.length).toBe(initialCount - 1)
    expect(
      mockPlugin.settings.folderTemplates.find((t) => t.id === 'research')
    ).toBeUndefined()
    expect(mockPlugin.saveSettings).toHaveBeenCalled()
  })

  test('should not delete the last template', async () => {
    // First delete one template
    await settingTab.deleteTemplate('research')

    // Now try to delete the last template
    await expect(settingTab.deleteTemplate('default')).rejects.toThrow()

    // Verify we still have one template
    expect(mockPlugin.settings.folderTemplates.length).toBe(1)
  })

  test('should set active template', async () => {
    // Set research as active
    await settingTab.setActiveTemplate('research')

    // Verify the active template was updated
    expect(mockPlugin.settings.activeTemplateId).toBe('research')
    expect(mockPlugin.saveSettings).toHaveBeenCalled()
  })

  test('should clone a template', async () => {
    // Get initial template count
    const initialCount = mockPlugin.settings.folderTemplates.length

    // Clone the default template
    await settingTab.cloneTemplate('default')

    // Verify a new template was added
    expect(mockPlugin.settings.folderTemplates.length).toBe(initialCount + 1)

    // Find the cloned template
    const cloned = mockPlugin.settings.folderTemplates.find((t) =>
      t.name.startsWith('Copy of Default Template')
    )

    expect(cloned).toBeDefined()
    expect(cloned?.id).not.toBe('default')
    expect(cloned?.structure).toBe(
      mockPlugin.settings.folderTemplates[0].structure
    )
    expect(mockPlugin.saveSettings).toHaveBeenCalled()
  })
})
