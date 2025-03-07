import { TFile } from 'obsidian'
import LinkPlugin from '../main'
import { createDailyNoteContent } from '../utils/folderUtils'
import { createMockApp, createMockPlugin } from './testUtils'
import { getCurrentMoment } from '../utils/momentHelper'

jest.mock('../utils/folderUtils', () => ({
  ...jest.requireActual('../utils/folderUtils'),
  createDailyNoteContent: jest.fn()
}))

describe('LinkPlugin', () => {
  let plugin: LinkPlugin
  let mockApp: any
  let mockVault: any
  let mockWorkspace: any
  let mockInternalPlugins: any

  beforeEach(() => {
    // Reset all mocks
    mockVault = {
      adapter: {
        exists: jest.fn(),
        read: jest.fn(),
        write: jest.fn()
      },
      createFolder: jest.fn(),
      create: jest.fn(),
      modify: jest.fn(),
      on: jest.fn()
    }

    mockWorkspace = {
      onLayoutReady: jest.fn((cb) => cb()),
      on: jest.fn(),
      getActiveViewOfType: jest.fn(),
      getLeavesOfType: jest.fn()
    }

    mockInternalPlugins = {
      plugins: {
        'daily-notes': {
          enabled: true,
          instance: {
            createDailyNote: jest.fn()
          }
        }
      }
    }

    mockApp = {
      vault: mockVault,
      workspace: mockWorkspace,
      internalPlugins: mockInternalPlugins
    }

    plugin = createMockPlugin(mockApp)
    ;(createDailyNoteContent as jest.Mock).mockReset()
  })

  describe('onload', () => {
    it('should initialize plugin settings', async () => {
      await plugin.onload()
      expect(plugin.settings).toBeDefined()
    })

    it('should register file creation event listener', async () => {
      await plugin.onload()
      expect(mockVault.on).toHaveBeenCalledWith('create', expect.any(Function))
    })

    it('should patch daily notes plugin when available', async () => {
      await plugin.onload()
      expect(mockWorkspace.onLayoutReady).toHaveBeenCalled()
    })
  })

  describe('enhanceDailyNote', () => {
    it('should enhance daily note with template content', async () => {
      const mockFile = {
        basename: '2024-12-19 Thursday',
        path: '_Link/_Journal/y_2024/m_12_Dec/2024-12-19 Thursday.md',
        extension: 'md'
      } as TFile

      mockVault.read.mockResolvedValue('Original content')
      ;(createDailyNoteContent as jest.Mock).mockResolvedValue(
        'Enhanced content'
      )

      await plugin.enhanceDailyNote(mockFile)

      expect(createDailyNoteContent).toHaveBeenCalledWith(
        mockApp,
        '2024-12-19 Thursday',
        getCurrentMoment()
      )
      expect(mockVault.modify).toHaveBeenCalledWith(
        mockFile,
        'Enhanced content'
      )
    })

    it('should not enhance if file already has previous/next links', async () => {
      const mockFile = {
        basename: '2024-12-19 Thursday',
        path: '_Link/_Journal/y_2024/m_12_Dec/2024-12-19 Thursday.md',
        extension: 'md'
      } as TFile

      mockVault.read.mockResolvedValue("previous: ''\nnext: ''")

      await plugin.enhanceDailyNote(mockFile)

      expect(createDailyNoteContent).not.toHaveBeenCalled()
      expect(mockVault.modify).not.toHaveBeenCalled()
    })

    it('should handle invalid date formats', async () => {
      const mockFile = {
        basename: 'invalid-date',
        path: '_Link/_Journal/invalid-date.md',
        extension: 'md'
      } as TFile

      await plugin.enhanceDailyNote(mockFile)

      expect(createDailyNoteContent).not.toHaveBeenCalled()
      expect(mockVault.modify).not.toHaveBeenCalled()
    })
  })

  describe('patchDailyNotes', () => {
    it('should patch createDailyNote function', async () => {
      const originalCreate =
        mockInternalPlugins.plugins['daily-notes'].instance.createDailyNote

      await plugin.onload()

      const newFile = { path: 'test.md' } as TFile
      originalCreate.mockResolvedValue(newFile)

      const result = await mockInternalPlugins.plugins[
        'daily-notes'
      ].instance.createDailyNote()

      expect(result).toBe(newFile)
      expect(originalCreate).toHaveBeenCalled()
    })

    it('should handle errors in enhanced createDailyNote', async () => {
      const originalCreate =
        mockInternalPlugins.plugins['daily-notes'].instance.createDailyNote
      const error = new Error('Test error')

      await plugin.onload()

      mockVault.read.mockRejectedValue(error)
      const newFile = { path: 'test.md' } as TFile
      originalCreate.mockResolvedValue(newFile)

      const result = await mockInternalPlugins.plugins[
        'daily-notes'
      ].instance.createDailyNote()

      expect(result).toBe(newFile)
      expect(originalCreate).toHaveBeenCalled()
    })
  })
})
