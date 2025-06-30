
import { App, PluginSettingTab, Setting } from 'obsidian';
import LinkPlugin from '../main';

export class SettingsTab extends PluginSettingTab {
  plugin: LinkPlugin;
  constructor(app: App, plugin: LinkPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Link Plugin Settings' });
    new Setting(containerEl)
      .setName('Debug Mode')
      .setDesc('Enable debug logging')
      .addToggle(toggle => toggle
        .setValue(this.plugin.settings.debugMode)
        .onChange(async (value) => {
          this.plugin.settings.debugMode = value;
          await this.plugin.saveSettings();
        }));
  }
}
