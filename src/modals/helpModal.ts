import { App, Modal, Setting } from 'obsidian'

export class HelpModal extends Modal {
  constructor(app: App) {
    super(app)
  }

  onOpen() {
    console.debug('Opening help modal')
    const { contentEl } = this

    // Title
    contentEl.createEl('h2', { text: 'Link Plugin Help' })
    console.debug('Help modal content created')

    // Main features section
    this.createSection(contentEl, 'Core Features', [
      {
        title: '📝 Creating Linked Notes',
        description:
          'Select text and use the command "Create new linked note" or Ctrl/Cmd + L to create a new linked note. The selected text becomes the note title.'
      },
      {
        title: '📁 Folder Organization',
        description:
          'Notes are automatically organized into DailyNotes, Projects, Resources, or Archives based on their type and content.'
      },
      {
        title: '🏷️ Metadata Management',
        description:
          'Each note type includes specific metadata and tags for better organization and searchability.'
      }
    ])

    // Templates section
    this.createSection(contentEl, 'Available Templates', [
      {
        title: '📅 Daily Notes',
        description:
          'For daily journal entries and task logs. Includes sections for routine checklist and to-do lists.'
      },
      {
        title: '📊 Project Notes',
        description:
          'For project documentation. Includes overview, objectives, and task tracking sections.'
      },
      {
        title: '📚 Resource Notes',
        description:
          'For reference materials and research. Includes source attribution and summary sections.'
      }
    ])

    // Quick tips section
    this.createSection(contentEl, 'Quick Tips', [
      {
        title: '⌨️ Keyboard Shortcuts',
        description:
          'Use Ctrl/Cmd + L: Create new linked note\nCtrl/Cmd + Shift + L: Format existing link'
      },
      {
        title: '🔄 Auto-formatting',
        description:
          'Links are automatically formatted based on your preferred style (Wiki or Markdown) set in settings.'
      },
      {
        title: '📋 Templates',
        description:
          'Custom templates can be added to the Templates folder and will be automatically recognized.'
      }
    ])

    // Settings section
    this.createSection(contentEl, 'Settings', [
      {
        title: '⚙️ Plugin Settings',
        description:
          'Access settings via Settings > Link Plugin to customize:\n- Default link style\n- Auto-formatting options\n- Folder locations\n- Template preferences'
      }
    ])

    // Add a close button at the bottom
    new Setting(contentEl).addButton((btn) =>
      btn
        .setButtonText('Close')
        .setCta()
        .onClick(() => {
          this.close()
        })
    )
    console.debug('Help modal sections created')
  }

  private createSection(
    container: HTMLElement,
    title: string,
    items: { title: string; description: string }[]
  ) {
    const sectionEl = container.createEl('div', { cls: 'help-section' })
    sectionEl.createEl('h3', { text: title })

    const listEl = sectionEl.createEl('div', { cls: 'help-list' })
    items.forEach((item) => {
      const itemEl = listEl.createEl('div', { cls: 'help-item' })
      itemEl.createEl('h4', { text: item.title })
      itemEl.createEl('p', { text: item.description })
    })
  }

  onClose() {
    console.debug('Closing help modal')
    const { contentEl } = this
    contentEl.empty()
  }
}
