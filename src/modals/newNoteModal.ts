import { App, Modal, Setting } from 'obsidian'
import { BASE_FOLDERS } from '../utils/folderUtils'

export class NewNoteModal extends Modal {
  private onSubmit: (result: { name: string; folder: string } | null) => void
  private inputEl: HTMLInputElement
  private folderSelect: HTMLSelectElement
  private result: { name: string; folder: string } = { name: '', folder: '' }

  constructor(
    app: App,
    onSubmit: (result: { name: string; folder: string } | null) => void
  ) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    const { contentEl } = this

    // Title
    contentEl.createEl('h2', { text: 'Create New Note' })

    // Note Name Input
    new Setting(contentEl)
      .setName('Note Name')
      .setDesc('Enter the name for your new note')
      .addText((text) => {
        this.inputEl = text.inputEl
        text.inputEl.placeholder = 'Note name'
        text.inputEl.addEventListener('input', () => {
          this.result.name = text.inputEl.value
        })
        text.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && this.result.name && this.result.folder) {
            this.close()
            this.onSubmit(this.result)
          }
        })
      })

    // Folder Selection
    new Setting(contentEl)
      .setName('Location')
      .setDesc('Choose where to create the note')
      .addDropdown((dropdown) => {
        // Add base folders
        Object.entries(BASE_FOLDERS).forEach(([key, value]) => {
          dropdown.addOption(value, value)
        })

        dropdown.onChange((value) => {
          this.result.folder = value
        })

        // Set default value
        dropdown.setValue(BASE_FOLDERS.JOURNAL)
        this.result.folder = BASE_FOLDERS.JOURNAL
      })

    // Buttons
    const buttonDiv = contentEl.createDiv('button-container')
    buttonDiv.style.display = 'flex'
    buttonDiv.style.justifyContent = 'flex-end'
    buttonDiv.style.gap = '10px'
    buttonDiv.style.marginTop = '20px'

    // Create Button
    const createButton = buttonDiv.createEl('button', {
      text: 'Create',
      cls: 'mod-cta'
    })
    createButton.addEventListener('click', () => {
      if (this.result.name && this.result.folder) {
        this.close()
        this.onSubmit(this.result)
      }
    })

    // Cancel Button
    const cancelButton = buttonDiv.createEl('button', { text: 'Cancel' })
    cancelButton.addEventListener('click', () => {
      this.close()
      this.onSubmit(null)
    })

    // Focus input
    this.inputEl.focus()
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
