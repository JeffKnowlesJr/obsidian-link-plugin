import { createLinkedNote } from '../createLinkedNote'
import { LinkPluginError, ErrorCode } from '../../utils/errorUtils'

// Mock Obsidian's API
const mockVault = {
  adapter: {
    exists: jest.fn(),
    mkdir: jest.fn()
  },
  create: jest.fn(),
  createFolder: jest.fn(),
  read: jest.fn(),
  getAbstractFileByPath: jest.fn()
}

const mockEditor = {
  getSelection: jest.fn(),
  replaceSelection: jest.fn()
}

const mockPlugin = {
  app: {
    vault: mockVault
  },
  settings: {
    defaultLinkStyle: 'wiki'
  }
}

describe('createLinkedNote', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  it('should handle file already exists error', async () => {
    // Setup
    mockEditor.getSelection.mockReturnValue('Test Note')
    mockVault.adapter.exists.mockResolvedValue(true)

    // Execute
    await createLinkedNote(mockPlugin as any, mockEditor as any)

    // Verify
    expect(mockVault.create).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error creating linked note'),
      expect.any(LinkPluginError)
    )
  })

  it('should handle invalid note name', async () => {
    // Setup
    mockEditor.getSelection.mockReturnValue('Test/Note/Invalid')

    // Execute
    await createLinkedNote(mockPlugin as any, mockEditor as any)

    // Verify
    expect(mockVault.create).not.toHaveBeenCalled()
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error creating linked note'),
      expect.objectContaining({
        code: ErrorCode.INVALID_NOTE_NAME
      })
    )
  })

  it('should handle template not found gracefully', async () => {
    // Setup
    mockEditor.getSelection.mockReturnValue('Test Note')
    mockVault.adapter.exists.mockResolvedValue(false)
    mockVault.getAbstractFileByPath.mockReturnValue(null)

    // Execute
    await createLinkedNote(mockPlugin as any, mockEditor as any)

    // Verify
    expect(mockVault.create).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('# Test Note')
    )
  })

  it('should handle folder creation failure', async () => {
    // Setup
    mockEditor.getSelection.mockReturnValue('Test Note')
    mockVault.adapter.exists.mockResolvedValue(false)
    mockVault.createFolder.mockRejectedValue(new Error('Permission denied'))

    // Execute
    await createLinkedNote(mockPlugin as any, mockEditor as any)

    // Verify
    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('Error creating linked note'),
      expect.objectContaining({
        code: ErrorCode.FOLDER_CREATION_FAILED
      })
    )
  })
})
