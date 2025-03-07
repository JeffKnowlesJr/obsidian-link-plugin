import { App } from 'obsidian'
import { ensureFolderStructure } from '../utils/folderUtils'
import { createMockApp, createMockSettings } from './testUtils'
import { getCurrentMoment } from '../utils/momentHelper'

describe('folderUtils', () => {
  let mockApp: App

  beforeEach(() => {
    mockApp = createMockApp()
  })

  describe('ensureFolderStructure', () => {
    it('creates the basic folder structure', async () => {
      const settings = createMockSettings()
      await ensureFolderStructure(mockApp, settings)

      // Verify the root folders were created
      expect(mockApp.vault.createFolder).toHaveBeenCalledWith('Journal')
      expect(mockApp.vault.createFolder).toHaveBeenCalledWith('Documents')
      expect(mockApp.vault.createFolder).toHaveBeenCalledWith('Templates')
    })

    it('creates year and month folders in Journal', async () => {
      const settings = createMockSettings()
      const date = getCurrentMoment()
      const year = date.format('YYYY')
      const month = date.format('MMMM')

      await ensureFolderStructure(mockApp, settings)

      expect(mockApp.vault.createFolder).toHaveBeenCalledWith(
        `Journal/y_${year}`
      )
      expect(mockApp.vault.createFolder).toHaveBeenCalledWith(
        `Journal/y_${year}/${month}`
      )
    })
  })
})
