import { App, Modal, Notice, Setting } from 'obsidian'
import { FolderTemplate } from '../settings/settings'

/**
 * Modal for previewing a folder structure template
 */
export class StructurePreviewModal extends Modal {
  private structure: any

  constructor(app: App, structure: any) {
    super(app)
    this.structure = structure
  }

  onOpen() {
    const { contentEl } = this

    contentEl.createEl('h2', { text: 'Folder Structure Preview' })

    const previewContainer = contentEl.createDiv('folder-structure-preview')
    previewContainer.style.maxHeight = '400px'
    previewContainer.style.overflow = 'auto'
    previewContainer.style.padding = '10px'
    previewContainer.style.border =
      '1px solid var(--background-modifier-border)'
    previewContainer.style.borderRadius = '4px'

    // Create a recursive function to render the structure
    const createStructurePreview = (
      container: HTMLElement,
      structure: any,
      level = 0
    ) => {
      for (const [folderName, subFolders] of Object.entries(structure)) {
        const folderContainer = container.createDiv('folder-item')
        folderContainer.style.paddingLeft = `${level * 20}px`
        folderContainer.style.marginBottom = '5px'

        const folderIcon = folderContainer.createSpan('folder-icon')
        folderIcon.innerHTML = '📁 '

        folderContainer.createSpan({ text: folderName })

        if (
          subFolders &&
          typeof subFolders === 'object' &&
          Object.keys(subFolders).length > 0
        ) {
          createStructurePreview(container, subFolders, level + 1)
        }
      }
    }

    createStructurePreview(previewContainer, this.structure)

    // Add close button
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Close')
        .setCta()
        .onClick(() => this.close())
    )
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }
}

/**
 * Modal for editing a folder structure template
 */
export class TemplateEditModal extends Modal {
  private template: FolderTemplate
  private onSave: (template: FolderTemplate) => void
  private editedTemplate: FolderTemplate

  constructor(
    app: App,
    template: FolderTemplate,
    onSave: (template: FolderTemplate) => void
  ) {
    super(app)
    this.template = template
    this.onSave = onSave
    this.editedTemplate = { ...template }
  }

  onOpen() {
    const { contentEl } = this

    contentEl.createEl('h2', { text: 'Edit Template' })

    // Template name
    new Setting(contentEl)
      .setName('Template Name')
      .setDesc('Enter a name for this template')
      .addText((text) =>
        text.setValue(this.editedTemplate.name).onChange((value) => {
          this.editedTemplate.name = value
        })
      )

    // Template description
    new Setting(contentEl)
      .setName('Template Description')
      .setDesc('Enter a description for this template')
      .addTextArea((text) => {
        text.setValue(this.editedTemplate.description).onChange((value) => {
          this.editedTemplate.description = value
        })

        text.inputEl.rows = 3
        text.inputEl.cols = 40
      })

    // Template structure (JSON editor)
    contentEl.createEl('h3', { text: 'Folder Structure (JSON)' })

    const jsonDescription = contentEl.createEl('p')
    jsonDescription.innerHTML = `
      Define your folder structure using JSON format. Use <code>$YEAR$</code> and <code>$MONTH$</code> 
      as variables for the current year and month.<br>
      Example: <code>{"_Journal": {"y_$YEAR$": {"$MONTH$": {}}}}</code>
    `

    const structureContainer = contentEl.createDiv()

    const textArea = structureContainer.createEl('textarea')
    textArea.value = this.prettifyJson(this.editedTemplate.structure)
    textArea.style.width = '100%'
    textArea.style.height = '200px'
    textArea.style.fontFamily = 'monospace'
    textArea.addEventListener('change', () => {
      try {
        // Test that it's valid JSON
        JSON.parse(textArea.value)
        this.editedTemplate.structure = textArea.value
      } catch (e) {
        // If invalid, show error but don't update
        new Notice('Invalid JSON structure. Please correct it before saving.')
      }
    })

    // Format button
    const formatButton = structureContainer.createEl('button', {
      text: 'Format JSON'
    })
    formatButton.style.marginTop = '10px'
    formatButton.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(textArea.value)
        textArea.value = this.prettifyJson(JSON.stringify(parsed))
        this.editedTemplate.structure = textArea.value
      } catch (e) {
        new Notice('Invalid JSON structure.')
      }
    })

    // Buttons for save/cancel
    const buttonContainer = contentEl.createDiv()
    buttonContainer.style.display = 'flex'
    buttonContainer.style.justifyContent = 'flex-end'
    buttonContainer.style.marginTop = '20px'

    const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' })
    cancelButton.style.marginRight = '10px'
    cancelButton.addEventListener('click', () => {
      this.close()
    })

    const saveButton = buttonContainer.createEl('button', {
      text: 'Save Template',
      cls: 'mod-cta'
    })
    saveButton.addEventListener('click', () => {
      try {
        // Final validation
        JSON.parse(this.editedTemplate.structure)

        // Call the save callback
        this.onSave(this.editedTemplate)
        this.close()
      } catch (e) {
        new Notice('Invalid JSON structure. Please correct it before saving.')
      }
    })
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }

  /**
   * Format JSON string with indentation for better readability
   */
  private prettifyJson(jsonString: string): string {
    try {
      const obj = JSON.parse(jsonString)
      return JSON.stringify(obj, null, 2)
    } catch (e) {
      return jsonString // Return as-is if it's not valid JSON
    }
  }
}
