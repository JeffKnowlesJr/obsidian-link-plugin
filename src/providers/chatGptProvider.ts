import OpenAI from 'openai'
import { AIResponse, BaseAIProvider } from './baseProvider'

export class ChatGPTProvider extends BaseAIProvider {
  private client: OpenAI
  name = 'ChatGPT'

  constructor(apiKey: string) {
    super(apiKey)
    this.client = new OpenAI({ apiKey })
  }

  async query(prompt: string, context?: string): Promise<AIResponse> {
    try {
      const systemPrompt =
        'You are a helpful AI assistant specializing in general knowledge and creative tasks.'
      const fullPrompt = context ? `${context}\n\n${prompt}` : prompt

      const response = await this.client.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: fullPrompt }
        ],
        max_tokens: 4096
      })

      return {
        content: response.choices[0].message.content || '',
        type: 'text'
      }
    } catch (error) {
      return this.handleError(error)
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      const testClient = new OpenAI({ apiKey })
      await testClient.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: 'test' }],
        max_tokens: 10
      })
      return true
    } catch {
      return false
    }
  }
}
