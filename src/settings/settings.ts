import { ClaudeProvider } from '../providers/claudeProvider'
import { ChatGPTProvider } from '../providers/chatGptProvider'

export interface AIAssistantSettings {
  claudeApiKey: string
  openAiApiKey: string
  defaultProvider: 'claude' | 'chatgpt'
  contextInclusionEnabled: boolean
  maxContextLength: number
  retentionPeriodDays: number
  anonymizeData: boolean
  hotkeys: {
    claude: string
    chatgpt: string
  }
}

export const DEFAULT_SETTINGS: AIAssistantSettings = {
  claudeApiKey: '',
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

export interface ProviderSettings {
  claudeApiKey: string
  maxTokens: number
  temperature: number
}

export interface PluginSettings {
  provider: ProviderSettings
  defaultLinkStyle: string
  // Add other plugin settings as needed
}

export class ProviderManager {
  private claudeProvider: ClaudeProvider | null = null
  private chatGptProvider: ChatGPTProvider | null = null

  constructor(private settings: AIAssistantSettings) {
    this.initializeProviders()
  }

  private initializeProviders() {
    if (this.settings.claudeApiKey) {
      this.claudeProvider = new ClaudeProvider(this.settings.claudeApiKey)
    }
    if (this.settings.openAiApiKey) {
      this.chatGptProvider = new ChatGPTProvider(this.settings.openAiApiKey)
    }
  }

  getProvider(name: 'claude' | 'chatgpt') {
    switch (name) {
      case 'claude':
        return this.claudeProvider
      case 'chatgpt':
        return this.chatGptProvider
      default:
        return null
    }
  }

  getDefaultProvider() {
    return this.getProvider(this.settings.defaultProvider)
  }

  updateSettings(settings: AIAssistantSettings) {
    this.settings = settings
    this.initializeProviders()
  }
}
