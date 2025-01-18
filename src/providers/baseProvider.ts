export interface AIResponse {
  content: string
  type: 'text' | 'code' | 'error'
  language?: string
}

export interface AIProvider {
  name: string
  isConfigured(): boolean
  query(prompt: string, context?: string): Promise<AIResponse>
  validateApiKey(apiKey: string): Promise<boolean>
}

export abstract class BaseAIProvider implements AIProvider {
  protected apiKey: string
  abstract name: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  abstract query(prompt: string, context?: string): Promise<AIResponse>

  abstract validateApiKey(apiKey: string): Promise<boolean>

  isConfigured(): boolean {
    return Boolean(this.apiKey)
  }

  protected handleError(error: any): AIResponse {
    return {
      content: `Error: ${error.message || 'Unknown error occurred'}`,
      type: 'error'
    }
  }
}
