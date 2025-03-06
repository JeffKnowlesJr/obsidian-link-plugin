// Mock console methods
global.console = {
  ...console,
  debug: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}

// Mock Notice class from Obsidian
global.Notice = jest.fn()

// Mock the Obsidian API
jest.mock('obsidian', () => {
  return {
    // Basic Plugin API
    Plugin: jest.fn().mockImplementation(() => {
      return {
        registerEvent: jest.fn(),
        registerInterval: jest.fn()
      }
    }),
    PluginSettingTab: jest.fn().mockImplementation(() => {}),
    TFolder: jest.fn(),

    // UI Elements
    Setting: jest.fn().mockImplementation(() => {
      return {
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
      }
    }),
    Modal: jest.fn().mockImplementation(() => {
      return {
        contentEl: {
          createEl: jest.fn().mockImplementation(() => ({
            createEl: jest.fn(),
            appendChild: jest.fn(),
            createDiv: jest.fn()
          })),
          createDiv: jest.fn().mockImplementation(() => ({
            createEl: jest.fn(),
            appendChild: jest.fn(),
            createDiv: jest.fn()
          })),
          appendChild: jest.fn(),
          setText: jest.fn()
        },
        open: jest.fn(),
        close: jest.fn()
      }
    }),
    Notice: jest.fn(),

    // Fragment/Element creation
    createFragment: jest.fn().mockImplementation(() => ({
      createEl: jest.fn().mockImplementation(() => ({
        setText: jest.fn().mockReturnThis(),
        addEventListener: jest.fn().mockReturnThis()
      })),
      appendChild: jest.fn()
    })),

    // Events
    Events: jest.fn()
  }
})

// Global setup
global.setTimeout = jest.fn()
global.clearTimeout = jest.fn()
global.setInterval = jest.fn()
global.clearInterval = jest.fn()
