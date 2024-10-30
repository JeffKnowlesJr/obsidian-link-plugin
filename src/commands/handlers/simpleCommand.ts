import { App } from "obsidian";
import { SampleModal } from "../../components/modals/SampleModal";

export function simpleCommand(app: App) {
	new SampleModal(app).open();
}
