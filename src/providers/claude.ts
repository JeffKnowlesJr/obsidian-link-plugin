import { ErrorCode, LinkPluginError } from '../utils/errorUtils'

export class ClaudeProvider {
  private apiKey: string

  constructor(apiKey: string) {
    this.validateApiKey(apiKey)
    this.apiKey = apiKey
  }

  async query(prompt: string): Promise<string> {
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'claude-3-sonnet-20240229',
          max_tokens: 2000,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new LinkPluginError(
          `API request failed: ${response.statusText}`,
          ErrorCode.API_ERROR
        )
      }

      const data = await response.json()
      return data.completion
    } catch (error) {
      if (error instanceof LinkPluginError) {
        throw error
      }
      throw new LinkPluginError(
        'Failed to communicate with Claude API',
        ErrorCode.NETWORK_ERROR
      )
    }
  }

  private validateApiKey(apiKey: string): void {
    if (!apiKey) {
      throw new LinkPluginError(
        'Claude API key is required',
        ErrorCode.INVALID_API_KEY
      )
    }

    if (!apiKey.match(/^sk-[a-zA-Z0-9]{32,}$/)) {
      throw new LinkPluginError(
        'Invalid Claude API key format',
        ErrorCode.INVALID_API_KEY
      )
    }
  }
}
