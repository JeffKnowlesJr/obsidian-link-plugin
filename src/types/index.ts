import { Plugin } from "obsidian";

export interface IPluginServices {
	settings: SettingsService;
}

export interface IPluginFeatures {
	ribbon: RibbonFeature;
	statusBar: StatusBarFeature;
	commands: CommandFeature;
}
