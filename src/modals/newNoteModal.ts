import { App, Modal, Setting, moment } from 'obsidian'
import { BASE_FOLDERS } from '../utils/folderUtils'

interface NoteCreationResult {
  name: string
  folder: string
  isFutureDaily?: boolean
  date?: moment.Moment
}

export class NewNoteModal extends Modal {
  private onSubmit: (result: NoteCreationResult | null) => void
  private inputEl: HTMLInputElement
  private folderDropdown: Setting
  private result: NoteCreationResult = { name: '', folder: '' }
  private isFutureDaily: boolean = false
  private containers: {
    datePickerContainer?: HTMLDivElement
    nameContainer?: HTMLDivElement
    folderContainer?: HTMLDivElement
  } = {}

  constructor(app: App, onSubmit: (result: NoteCreationResult | null) => void) {
    super(app)
    this.onSubmit = onSubmit
  }

  onOpen() {
    const { contentEl } = this

    // Title
    contentEl.createEl('h2', { text: 'Create New Note' })

    // Note Type Selection
    new Setting(contentEl)
      .setName('Note Type')
      .setDesc('Choose the type of note to create')
      .addDropdown((dropdown) => {
        dropdown
          .addOption('regular', 'Regular Note')
          .addOption('future', 'Future Daily Note')
          .onChange((value) => {
            this.isFutureDaily = value === 'future'
            if (this.isFutureDaily) {
              this.result.folder = BASE_FOLDERS.JOURNAL
              this.folderDropdown?.components[0]?.setValue(BASE_FOLDERS.JOURNAL)
            }
            this.result.isFutureDaily = this.isFutureDaily
            this.updateFormVisibility()
          })
      })

    // Date Picker (initially hidden)
    this.containers.datePickerContainer = contentEl.createDiv()
    this.containers.datePickerContainer.style.display = 'none'

    new Setting(this.containers.datePickerContainer)
      .setName('Date')
      .setDesc('Choose the date for the future daily note')
      .addText((text) => {
        const datePickerEl = text.inputEl
        datePickerEl.type = 'date'
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD')
        datePickerEl.value = tomorrow
        datePickerEl.min = tomorrow
        datePickerEl.addEventListener('change', () => {
          this.result.date = moment(datePickerEl.value)
          if (this.isFutureDaily) {
            this.result.name = this.result.date.format('YYYY-MM-DD dddd')
          }
          if (this.inputEl) {
            this.inputEl.value = this.result.name
          }
        })
        // Set initial date
        this.result.date = moment(tomorrow)
        this.result.name = this.result.date.format('YYYY-MM-DD dddd')
      })

    // Note Name Input
    this.containers.nameContainer = contentEl.createDiv()
    new Setting(this.containers.nameContainer)
      .setName('Note Name')
      .setDesc('Enter the name for your new note')
      .addText((text) => {
        this.inputEl = text.inputEl
        text.inputEl.placeholder = 'Note name'
        text.inputEl.addEventListener('input', () => {
          if (!this.isFutureDaily) {
            this.result.name = text.inputEl.value
          }
        })
        text.inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && this.isValid()) {
            this.close()
            this.onSubmit(this.result)
          }
        })
      })

    // Folder Selection
    this.containers.folderContainer = contentEl.createDiv()
    this.folderDropdown = new Setting(this.containers.folderContainer)
      .setName('Location')
      .setDesc('Choose where to create the note')
      .addDropdown((dropdown) => {
        // Add base folders
        Object.entries(BASE_FOLDERS).forEach(([key, value]) => {
          dropdown.addOption(value, value)
        })

        dropdown.onChange((value) => {
          if (!this.isFutureDaily) {
            this.result.folder = value
          }
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
      if (this.isValid()) {
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

    // Initial visibility
    this.updateFormVisibility()

    // Focus input
    this.inputEl.focus()
  }

  private updateFormVisibility() {
    if (this.isFutureDaily) {
      this.containers.datePickerContainer.style.display = 'block'
      this.containers.nameContainer.style.display = 'none'
      this.containers.folderContainer.style.display = 'none'
    } else {
      this.containers.datePickerContainer.style.display = 'none'
      this.containers.nameContainer.style.display = 'block'
      this.containers.folderContainer.style.display = 'block'
      this.result.date = undefined
    }
  }

  private isValid(): boolean {
    if (this.isFutureDaily) {
      return Boolean(this.result.date)
    }
    return Boolean(this.result.name && this.result.folder)
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
