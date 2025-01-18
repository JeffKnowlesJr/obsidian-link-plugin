import { Plugin, Editor, MarkdownView } from 'obsidian'
import { AIAssistantSettingTab } from './settings/settingsTab'
import {
  AIAssistantSettings,
  DEFAULT_SETTINGS,
  ProviderManager
} from './settings/settings'
import { AIProvider } from './providers/baseProvider'
import { HelpModal } from './modals/helpModal'

export default class AIAssistantPlugin extends Plugin {
  settings: AIAssistantSettings
  providerManager: ProviderManager

  async onload() {
    await this.loadSettings()
    this.providerManager = new ProviderManager(this.settings)

    // Add settings tab
    this.addSettingTab(new AIAssistantSettingTab(this.app, this))

    // Add ribbon icon
    this.addRibbonIcon('bot', 'AI Assistant', (evt: MouseEvent) => {
      new HelpModal(this.app).open()
    })

    // Register Claude command
    this.addCommand({
      id: 'query-claude',
      name: 'Query Claude (Code Assistant)',
      callback: () => {
        this.handleAIQuery(this.app.workspace.activeEditor?.editor, 'claude')
      }
    })

    // Register ChatGPT command
    this.addCommand({
      id: 'query-chatgpt',
      name: 'Query ChatGPT',
      editorCallback: (editor: Editor) => this.handleAIQuery(editor, 'chatgpt')
    })

    // Register default provider command
    this.addCommand({
      id: 'query-default-ai',
      name: 'Query Default AI Provider',
      editorCallback: (editor: Editor) => {
        const provider = this.providerManager.getDefaultProvider()
        if (provider) {
          this.handleAIQuery(editor, this.settings.defaultProvider)
        } else {
          this.showError('No default AI provider configured')
        }
      }
    })
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
    this.providerManager.updateSettings(this.settings)
  }

  private async handleAIQuery(
    editor: Editor,
    providerName: 'claude' | 'chatgpt'
  ) {
    const provider = this.providerManager.getProvider(providerName)
    if (!provider) {
      this.showError(`${providerName} is not configured`)
      return
    }

    const selection = editor.getSelection()
    if (!selection) {
      this.showError('No text selected')
      return
    }

    try {
      let context = ''
      if (this.settings.contextInclusionEnabled) {
        context = this.getRelevantContext(editor)
      }

      const response = await provider.query(selection, context)
      if (response.type === 'error') {
        this.showError(response.content)
        return
      }

      // Insert response after the selection
      const cursorPos = editor.getCursor('to')
      editor.replaceRange('\n\n' + response.content + '\n', cursorPos)
    } catch (error) {
      this.showError(`Error querying ${providerName}: ${error.message}`)
    }
  }

  private getRelevantContext(editor: Editor): string {
    // Get surrounding paragraphs up to maxContextLength
    const doc = editor.getValue()
    const cursorPos = editor.getCursor('from')
    const lines = doc.split('\n')

    let contextLines: string[] = []
    let charCount = 0
    let lineIndex = cursorPos.line

    // Get lines before cursor
    while (lineIndex >= 0 && charCount < this.settings.maxContextLength) {
      const line = lines[lineIndex]
      if (line.trim() === '') break
      contextLines.unshift(line)
      charCount += line.length
      lineIndex--
    }

    // Get lines after cursor
    lineIndex = cursorPos.line + 1
    while (
      lineIndex < lines.length &&
      charCount < this.settings.maxContextLength
    ) {
      const line = lines[lineIndex]
      if (line.trim() === '') break
      contextLines.push(line)
      charCount += line.length
      lineIndex++
    }

    return contextLines.join('\n')
  }

  private showError(message: string) {
    const notice = this.addNotice(message)
    setTimeout(() => notice.hide(), 4000)
  }
}
