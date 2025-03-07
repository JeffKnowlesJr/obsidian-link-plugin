import { App } from 'obsidian'

export class TemplateManager {
  constructor(private app: App) {}

  async loadTemplate(templatePath: string): Promise<string> {
    try {
      return await this.app.vault.adapter.read(templatePath)
    } catch (error) {
      throw new Error(`Failed to load template: ${error.message}`)
    }
  }

  async applyTemplate(
    template: string,
    variables: Record<string, string>
  ): Promise<string> {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, value)
    }
    return result
  }
}
