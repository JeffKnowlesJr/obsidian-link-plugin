import { Plugin, PluginSettingTab, Setting, Notice } from 'obsidian'

// 🔹 Plugin Settings Interface
interface WebSearchSettings {
  enableSearch: boolean;
}

// 🔹 Default Settings
const DEFAULT_SETTINGS: WebSearchSettings = {
  enableSearch: true
}

export default class WebSearchPlugin extends Plugin {
  settings: WebSearchSettings

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new WebSearchSettingTab(this))

    this.addCommand({
      id: 'search-google',
      name: 'Search Google',
      callback: async () => {
        if (!this.settings.enableSearch) {
          new Notice('Web search is disabled in settings.')
          return
        }
        let query = await this.getSelectedText()
        if (query) {
          let results = await this.googleSearch(query)
          this.createNote('Search Results', results)
        } else {
          new Notice('No text selected.')
        }
      }
    })

    this.addCommand({
      id: 'summarize-url',
      name: 'Summarize Web Page',
      callback: async () => {
        let url = await this.getUserInput('Enter URL to summarize:')
        if (url) {
          let summary = await this.summarizePage(url)
          this.createNote('Page Summary', summary)
        }
      }
    })
  }

  async googleSearch(query: string): Promise<string> {
    const API_KEY = 'your_google_api_key'
    const SEARCH_ENGINE_ID = 'your_search_engine_id'
    const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
      query
    )}&key=${API_KEY}&cx=${SEARCH_ENGINE_ID}`

    const response = await fetch(url)
    const data = await response.json()
    return data.items
      .map((item: any) => `- [${item.title}](${item.link})`)
      .join('\n')
  }

  async summarizePage(url: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: `Summarize this webpage: ${url}` }]
      })
    })

    const data = await response.json()
    return `## Summary of ${url}\n\n${data.choices[0].message.content}`
  }

  async getSelectedText(): Promise<string | null> {
    return this.app.workspace.activeLeaf?.view.getSelection() || null
  }

  async getUserInput(promptText: string): Promise<string | null> {
    return new Promise((resolve) => {
      let inputBox = document.createElement('input')
      inputBox.type = 'text'
      inputBox.placeholder = promptText
      document.body.appendChild(inputBox)

      inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          resolve(inputBox.value)
          document.body.removeChild(inputBox)
        }
      })

      inputBox.focus()
    })
  }

  async createNote(title: string, content: string) {
    const file = `${title}.md`
    await this.app.vault.create(file, content)
    new Notice(`Created note: ${file}`)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

// 🔹 Settings UI
class WebSearchSettingTab extends PluginSettingTab {
  plugin: WebSearchPlugin

  constructor(plugin: WebSearchPlugin) {
    super(plugin.app, plugin)
    this.plugin = plugin
  }

  display(): void {
    let { containerEl } = this
    containerEl.empty()

    new Setting(containerEl)
      .setName('Enable Web Search')
      .setDesc('Turn web search on or off.')
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.enableSearch)
          .onChange(async (value) => {
            this.plugin.settings.enableSearch = value
            await this.plugin.saveSettings()
          })
      )
  }
}
