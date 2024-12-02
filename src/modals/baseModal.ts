/**
 * @file baseModal.ts
 */

import { App, Modal, Setting } from 'obsidian'

export interface ModalItem {
  title: string
  description: string
}

export abstract class BasePluginModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  abstract renderContent(): void

  onOpen() {
    const { contentEl } = this
    contentEl.empty()
    this.renderContent()
  }

  onClose() {
    const { contentEl } = this
    contentEl.empty()
  }

  protected createSection(title: string, items: ModalItem[]) {
    const section = this.contentEl.createEl('div', { cls: 'help-section' })
    section.createEl('h3', { text: title })

    const list = section.createEl('div', { cls: 'help-list' })
    items.forEach((item) => {
      const itemEl = list.createEl('div', { cls: 'help-item' })
      itemEl.createEl('h4', { text: item.title })
      itemEl.createEl('p', { text: item.description })
    })
  }

  protected addActionButtons(
    actions: Array<{
      text: string
      isCta?: boolean
      onClick: () => void
    }>
  ) {
    const buttonContainer = new Setting(this.contentEl)

    actions.forEach(({ text, isCta, onClick }) => {
      buttonContainer.addButton((btn) => {
        btn.setButtonText(text)
        if (isCta) btn.setCta()
        btn.onClick(onClick)
        return btn
      })
    })
  }
}
