import { App } from 'obsidian'
import { BasePluginModal, ModalItem } from './baseModal'

export class HelpModal extends BasePluginModal {
  constructor(app: App) {
    super(app)
  }

  renderContent() {
    this.contentEl.createEl('h2', { text: 'Link Plugin Help' })

    // Core features section
    this.createSection('Core Features', [
      {
        title: '📝 Creating Linked Notes',
        description:
          'Enter a name for your new note in the popup dialog to create a linked note.'
      }
    ])

    // Settings section
    this.createSection('Settings', [
      {
        title: '⚙️ Plugin Settings',
        description:
          'Access settings via Settings > Link Plugin to customize:\n- Default link style (Wiki or Markdown)\n- Auto-format links toggle'
      }
    ])

    // Add action buttons
    this.addActionButtons([
      {
        text: 'Open Settings',
        onClick: () => {
          this.close()
          // @ts-ignore
          this.app.setting.openTabById('obsidian-link-plugin')
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
