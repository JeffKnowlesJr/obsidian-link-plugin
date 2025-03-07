import { App } from 'obsidian'
import { createMockApp } from '../../tests/testUtils'
import { TemplateManager } from '../templateManager'

describe('TemplateManager', () => {
  let mockApp: App
  let templateManager: TemplateManager

  beforeEach(() => {
    mockApp = createMockApp()
    templateManager = new TemplateManager(mockApp)
  })

  describe('loadTemplate', () => {
    it('should load a template from file', async () => {
      const mockTemplate = '# {{title}}\n\n{{content}}'
      ;(mockApp.vault.adapter.read as jest.Mock).mockResolvedValue(mockTemplate)

      const template = await templateManager.loadTemplate('test.md')
      expect(template).toBe(mockTemplate)
    })

    it('should handle missing template file', async () => {
      ;(mockApp.vault.adapter.read as jest.Mock).mockRejectedValue(
        new Error('File not found')
      )

      await expect(templateManager.loadTemplate('missing.md')).rejects.toThrow(
        'File not found'
      )
    })
  })

  describe('applyTemplate', () => {
    it('should replace variables in template', async () => {
      const template = '# {{title}}\n\n{{content}}'
      const variables = {
        title: 'Test Title',
        content: 'Test Content'
      }

      const result = await templateManager.applyTemplate(template, variables)
      expect(result).toBe('# Test Title\n\nTest Content')
    })

    it('should handle missing variables', async () => {
      const template = '# {{title}}\n\n{{content}}\n\n{{missing}}'
      const variables = {
        title: 'Test Title',
        content: 'Test Content'
      }

      const result = await templateManager.applyTemplate(template, variables)
      expect(result).toBe('# Test Title\n\nTest Content\n\n{{missing}}')
    })
  })
})
