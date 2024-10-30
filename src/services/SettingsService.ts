import { MyPluginSettings, DEFAULT_SETTINGS } from "../settings/settings";
import type MyPlugin from "../main";

export class SettingsService {
	constructor(private plugin: MyPlugin) {}

	async loadSettings() {
		this.plugin.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.plugin.loadData()
		);
	}

	async saveSettings() {
		await this.plugin.saveData(this.plugin.settings);
	}
}
