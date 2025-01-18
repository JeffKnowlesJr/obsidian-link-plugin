import { ClaudeProvider } from '../claude'
import { LinkPluginError, ErrorCode } from '../../utils/errorUtils'
import { AIAssistantSettings } from '../../settings/settings'

// Mock API response
const mockApiResponse = {
  completion: "Here's how you can implement that function...",
  stop_reason: 'end_turn',
  model: 'claude-3-sonnet-20240229'
}

// Mock settings using AIAssistantSettings interface
const mockSettings: AIAssistantSettings = {
  claudeApiKey: 'sk-test-valid-api-key-12345',
  openAiApiKey: '',
  defaultProvider: 'claude',
  contextInclusionEnabled: true,
  maxContextLength: 2000,
  retentionPeriodDays: 30,
  anonymizeData: false,
  hotkeys: {
    claude: 'Ctrl/Cmd + Shift + C',
    chatgpt: 'Ctrl/Cmd + Shift + G'
  }
}

describe('ClaudeProvider', () => {
  let claudeProvider: ClaudeProvider

  beforeEach(() => {
    claudeProvider = new ClaudeProvider(mockSettings.claudeApiKey)
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('query', () => {
    it('should successfully make an API call and return response', async () => {
      // Setup
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse
      })

      // Execute
      const response = await claudeProvider.query(
        'How do I implement a binary search?'
      )

      // Verify
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': mockSettings.claudeApiKey
          },
          body: expect.stringContaining('How do I implement a binary search?')
        })
      )
      expect(response).toBe(mockApiResponse.completion)
    })

    it('should handle API errors gracefully', async () => {
      // Setup
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      // Execute & Verify
      await expect(claudeProvider.query('test query')).rejects.toThrow(
        LinkPluginError
      )
    })

    it('should handle network errors', async () => {
      // Setup
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      )

      // Execute & Verify
      await expect(claudeProvider.query('test query')).rejects.toThrow(
        LinkPluginError
      )
    })
  })

  describe('validateApiKey', () => {
    it('should throw error for empty API key', () => {
      expect(() => {
        new ClaudeProvider('')
      }).toThrow(LinkPluginError)
    })

    it('should throw error for invalid API key format', () => {
      expect(() => {
        new ClaudeProvider('invalid-key')
      }).toThrow(LinkPluginError)
    })
  })
})
