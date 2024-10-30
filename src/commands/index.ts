import { Plugin, Editor, MarkdownView } from "obsidian";
import { simpleCommand } from "./handlers/simpleCommand";
import { editorCommand } from "./handlers/editorCommand";
// ... other imports

export function registerCommands(plugin: Plugin) {
	plugin.addCommand({
		id: "open-sample-modal-simple",
		name: "Open sample modal (simple)",
		callback: () => simpleCommand(plugin.app),
	});

	plugin.addCommand({
		id: "editor-command",
		name: "Editor command",
		editorCallback: (editor: Editor, view: MarkdownView) =>
			editorCommand(editor, view),
	});
}
