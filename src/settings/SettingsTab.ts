import { App, PluginSettingTab, Setting } from "obsidian";
import MyPlugin from "../main";

export class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Settings for my awesome plugin." });

		new Setting(containerEl)
			.setName("Setting")
			.setDesc("It's a setting")
			.addText((text) =>
				text
					.setPlaceholder("Enter your setting")
					.setValue(this.plugin.settings.mySetting)
					.onChange(async (value) => {
						this.plugin.settings.mySetting = value;
						await this.plugin.settingsService.saveSettings();
					})
			);
	}
}
