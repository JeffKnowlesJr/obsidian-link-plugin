import {
  App,
  Modal,
  Setting,
  TextComponent,
  DropdownComponent,
  BaseComponent
} from 'obsidian'
import { getCurrentMoment, addDay } from '../utils/momentHelper'
import { BASE_FOLDERS } from '../utils/folderUtils'

interface NewNoteResult {
  name: string
  folder: string
  date?: moment.Moment
}

export class NewNoteModal extends Modal {
  result: NewNoteResult
  containers: {
    nameContainer?: HTMLDivElement
    folderContainer?: HTMLDivElement
    datePickerContainer?: HTMLDivElement
  }
  folderDropdown?: Setting
  onSubmit: (result: NewNoteResult) => void

  constructor(app: App, onSubmit: (result: NewNoteResult) => void) {
    super(app)
    this.onSubmit = onSubmit
    this.result = {
      name: '',
      folder: BASE_FOLDERS.JOURNAL
    }
    this.containers = {}
  }

  onOpen() {
    const { contentEl } = this
    contentEl.empty()

    // Create containers
    this.containers.nameContainer = contentEl.createDiv()
    this.containers.folderContainer = contentEl.createDiv()
    this.containers.datePickerContainer = contentEl.createDiv()

    // Add folder dropdown
    this.folderDropdown = new Setting(this.containers.folderContainer)
      .setName('Folder')
      .setDesc('Choose where to create the note')
      .addDropdown((dropdown) => {
        Object.values(BASE_FOLDERS).forEach((folder) => {
          dropdown.addOption(folder, folder)
        })
        dropdown.setValue(BASE_FOLDERS.JOURNAL)
        dropdown.onChange((value) => {
          this.result.folder = value
          this.updateDisplay()
        })
      })

    // Add date picker for journal notes
    new Setting(this.containers.datePickerContainer)
      .setName('Date')
      .setDesc('Choose the date for the note')
      .addText((text) => {
        const tomorrow = addDay(getCurrentMoment()).format('YYYY-MM-DD')
        const datePickerEl = text.inputEl
        datePickerEl.type = 'date'
        datePickerEl.value = tomorrow
        datePickerEl.addEventListener('change', () => {
          if (datePickerEl.value) {
            this.result.date = getCurrentMoment()
            if (this.result.date) {
              this.result.name = this.result.date.format('YYYY-MM-DD dddd')
            }
          }
        })
        this.result.date = getCurrentMoment()
      })

    // Add name input
    new Setting(this.containers.nameContainer)
      .setName('Name')
      .setDesc('Enter the name for your note')
      .addText((text) => {
        text.onChange((value) => {
          this.result.name = value
        })
      })

    // Add submit button
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Create')
        .setCta()
        .onClick(() => {
          this.close()
          this.onSubmit(this.result)
        })
    )

    this.updateDisplay()
  }

  private updateDisplay() {
    if (this.result.folder === BASE_FOLDERS.JOURNAL) {
      this.containers.datePickerContainer!.style.display = 'block'
      this.containers.nameContainer!.style.display = 'none'
      this.containers.folderContainer!.style.display = 'none'
    } else {
      this.containers.datePickerContainer!.style.display = 'none'
      this.containers.nameContainer!.style.display = 'block'
      this.containers.folderContainer!.style.display = 'block'
    }
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}
