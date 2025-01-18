import { Claude } from '@anthropic-ai/sdk'
import { AIResponse, BaseAIProvider } from './baseProvider'

export class ClaudeProvider extends BaseAIProvider {
  private client: Claude
  name = 'Claude'

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new Claude({ apiKey })
  }

  async query(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const systemPrompt =
        'You are a helpful AI assistant specializing in programming and technical tasks.'
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt

      const response = await this.client.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4096,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ]
      })

      return {
        content: response.content[0].text,
        type: 'text'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new Claude({ apiKey })
      await testClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'test' }]
      })
      return true
    } catch {
      return false
    }
  }
}
