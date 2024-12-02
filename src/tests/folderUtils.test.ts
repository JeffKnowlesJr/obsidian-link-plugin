import { moment } from 'obsidian'
import {
  ensureFolderStructure,
  createDailyNoteContent,
  BASE_FOLDERS,
  ROOT_FOLDER
} from '../utils/folderUtils'

describe('folderUtils', () => {
  let mockApp: any
  let mockVault: any

  beforeEach(() => {
    // Reset all mocks before each test
    mockVault = {
      adapter: {
        exists: jest.fn(),
        read: jest.fn(),
        write: jest.fn()
      },
      createFolder: jest.fn(),
      create: jest.fn(),
      modify: jest.fn()
    }

    mockApp = {
      vault: mockVault
    }
  })

  describe('ensureFolderStructure', () => {
    it('should create root folder if it does not exist', async () => {
      mockVault.adapter.exists.mockResolvedValue(false)

      await ensureFolderStructure(mockApp)

      expect(mockVault.createFolder).toHaveBeenCalledWith(ROOT_FOLDER)
    })

    it('should create all base folders', async () => {
      mockVault.adapter.exists.mockResolvedValue(false)

      await ensureFolderStructure(mockApp)

      Object.values(BASE_FOLDERS).forEach((folder) => {
        expect(mockVault.createFolder).toHaveBeenCalledWith(folder)
      })
    })

    it('should not create folders that already exist', async () => {
      mockVault.adapter.exists.mockResolvedValue(true)

      await ensureFolderStructure(mockApp)

      expect(mockVault.createFolder).not.toHaveBeenCalled()
    })

    it('should handle errors gracefully', async () => {
      mockVault.adapter.exists.mockRejectedValue(new Error('Test error'))

      await expect(ensureFolderStructure(mockApp)).rejects.toThrow(
        'Failed to create folder structure'
      )
    })
  })

  describe('createDailyNoteContent', () => {
    const templatePath = `${BASE_FOLDERS.TEMPLATES}/Daily Note Template.md`
    const templateContent = `---
previous: ''
next: ''
tags: []
resources: []
stakeholders: []
---`

    beforeEach(() => {
      mockVault.adapter.read.mockResolvedValue(templateContent)
    })

    it('should create content with previous and next links', async () => {
      const date = moment('2024-12-19')
      const noteName = '2024-12-19 Thursday'

      const content = await createDailyNoteContent(mockApp, noteName, date)

      expect(content).toContain("previous: '[[2024-12-18 Wednesday]]'")
      expect(content).toContain("next: '[[2024-12-20 Friday]]'")
    })

    it('should handle month transitions correctly', async () => {
      const date = moment('2024-12-01')
      const noteName = '2024-12-01 Sunday'

      const content = await createDailyNoteContent(mockApp, noteName, date)

      expect(content).toContain("previous: '[[2024-11-30")
      expect(content).toContain("next: '[[2024-12-02")
    })

    it('should handle year transitions correctly', async () => {
      const date = moment('2024-01-01')
      const noteName = '2024-01-01 Monday'

      const content = await createDailyNoteContent(mockApp, noteName, date)

      expect(content).toContain("previous: '[[2023-12-31")
      expect(content).toContain("next: '[[2024-01-02")
    })

    it('should update month-specific references', async () => {
      const date = moment('2024-03-15')
      const noteName = '2024-03-15 Friday'
      const templateWithMonthRefs =
        templateContent + '\n[[December Log]]\n[[December List]]'

      mockVault.adapter.read.mockResolvedValue(templateWithMonthRefs)

      const content = await createDailyNoteContent(mockApp, noteName, date)

      expect(content).toContain('[[March Log]]')
      expect(content).toContain('[[March List]]')
    })

    it('should handle template read errors gracefully', async () => {
      mockVault.adapter.read.mockRejectedValue(new Error('Template not found'))
      const date = moment('2024-12-19')
      const noteName = '2024-12-19 Thursday'

      const content = await createDailyNoteContent(mockApp, noteName, date)

      expect(content).toContain(noteName)
      expect(content).toContain('Created:')
    })
  })
})
