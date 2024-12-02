import { App } from 'obsidian'
import { BasePluginModal } from './baseModal'

export class NewNoteModal extends BasePluginModal {
  private onSubmit: (result: string) => void

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  renderContent() {
    this.contentEl.createEl('h2', { text: 'Enter note name' })

    const inputEl = this.contentEl.createEl('input', {
      type: 'text',
      placeholder: 'Note name'
    })

    // Handle enter key
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.close()
        this.onSubmit(inputEl.value)
      }
    })

    // Add action buttons
    this.addActionButtons([
      {
        text: 'Create',
        isCta: true,
        onClick: () => {
          this.close()
          this.onSubmit(inputEl.value)
        }
      },
      {
        text: 'Cancel',
        onClick: () => {
          this.close()
          this.onSubmit(null)
        }
      }
    ])

    // Focus input
    inputEl.focus()
  }
}
