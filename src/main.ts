import { Plugin, Notice } from "obsidian";
import { SampleSettingTab } from "./settings/SettingsTab";
import { simpleCommand } from "./commands/handlers/simpleCommand";

interface PluginSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	mySetting: "default",
};

export default class MyPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// Add settings tab
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Add command
		this.addCommand({
			id: "open-sample-modal",
			name: "Open Sample Modal",
			callback: () => simpleCommand(this.app),
		});

		// Add ribbon icon
		this.addRibbonIcon(
			"link", // Using a standard Obsidian icon
			"Link Plugin",
			(evt: MouseEvent) => {
				new Notice("Link Plugin is active!");
			}
		).addClass("link-plugin-ribbon");
	}

	onunload() {
		// Clean up plugin resources
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
