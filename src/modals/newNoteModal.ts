import { App, Modal } from 'obsidian'

export class NewNoteModal extends Modal {
  onSubmit: (result: string) => void

  constructor(app: App, onSubmit: (result: string) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    const { contentEl } = this
    contentEl.createEl('h2', { text: 'Enter note name' })

    const inputEl = contentEl.createEl('input', {
      type: 'text',
      placeholder: 'Note name'
    })
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.close()
        this.onSubmit(inputEl.value)
      }
    })

    const buttonEl = contentEl.createEl('button', {
      text: 'Create'
    })
    buttonEl.addEventListener('click', () => {
      this.close()
      this.onSubmit(inputEl.value)
    })
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
