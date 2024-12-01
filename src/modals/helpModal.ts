import { App, Modal, Setting } from 'obsidian'

export class HelpModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  onOpen() {
    const { contentEl } = this

    contentEl.createEl('h2', { text: 'Link Plugin Help' })

    this.createSection('Core Features', [
      {
        title: '📝 Creating Linked Notes',
        description:
          'Enter a name for your new note in the popup dialog to create a linked note.'
      }
    ])

    this.createSection('Settings', [
      {
        title: '⚙️ Plugin Settings',
        description:
          'Access settings via Settings > Link Plugin to customize:\n- Default link style (Wiki or Markdown)\n- Auto-format links toggle'
      }
    ])

    const buttons = new Setting(contentEl)
    buttons
      .addButton((btn) =>
        btn.setButtonText('Open Settings').onClick(() => {
          this.close()
          // @ts-ignore
          this.app.setting.openTabById('obsidian-link-plugin')
        })
      )
      .addButton((btn) =>
        btn
          .setButtonText('Close')
          .setCta()
          .onClick(() => {
            this.close()
          })
      )
  }

  private createSection(
    title: string,
    items: { title: string; description: string }[]
  ) {
    const section = this.contentEl.createEl('div', { cls: 'help-section' })
    section.createEl('h3', { text: title })

    const list = section.createEl('div', { cls: 'help-list' })
    items.forEach((item) => {
      const itemEl = list.createEl('div', { cls: 'help-item' })
      itemEl.createEl('h4', { text: item.title })
      itemEl.createEl('p', { text: item.description })
    })
  }

  onClose() {
    this.contentEl.empty()
  }
}
