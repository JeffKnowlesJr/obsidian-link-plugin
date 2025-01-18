import { App } from 'obsidian'
import { BasePluginModal, ModalItem } from './baseModal'

export class HelpModal extends BasePluginModal {
  constructor(app: App) {
    super(app)
  }

  renderContent() {
    this.contentEl.createEl('h2', { text: 'AI Assistant Help' })

    // Core features section
    this.createSection('Available AI Providers', [
      {
        title: '🤖 Claude (Code Assistant)',
        description:
          'Specialized for code-related queries, documentation, and technical explanations. Use for programming tasks.'
      },
      {
        title: '💭 ChatGPT (General Assistant)',
        description:
          'Best for general knowledge, creative writing, and non-technical tasks.'
      },
      {
        title: '🔒 Privacy-Focused Provider',
        description:
          'For handling personal or sensitive data with enhanced privacy controls.'
      }
    ])

    // Usage section
    this.createSection('Quick Usage', [
      {
        title: '⌨️ Hotkeys',
        description:
          'Claude: Ctrl/Cmd + Shift + C\nChatGPT: Ctrl/Cmd + Shift + G'
      },
      {
        title: '📝 Context Awareness',
        description:
          'Select text or code before querying to include it as context.'
      }
    ])

    // Privacy section
    this.createSection('Privacy & Security', [
      {
        title: '🔐 API Keys',
        description:
          'Your API keys are stored securely and never shared between providers.'
      },
      {
        title: '📊 Data Handling',
        description:
          'All conversations are stored locally. Enable anonymization in settings for enhanced privacy.'
      }
    ])

    // Add action buttons
    this.addActionButtons([
      {
        text: 'Open Settings',
        onClick: () => {
          this.close()
          this.app.setting.open()
          this.app.setting.openTabById('obsidian-ai-assistant')
        }
      },
      {
        text: 'View Documentation',
        onClick: () => {
          window.open(
            'https://github.com/yourusername/obsidian-ai-assistant/wiki'
          )
        }
      },
      {
        text: 'Close',
        isCta: true,
        onClick: () => this.close()
      }
    ])
  }
}
