import moment from 'moment'

// Mock Obsidian's moment implementation
// Export moment as a callable function that matches Obsidian's API
export const moment = ((date?: any) => moment(date)) as typeof moment

// Other Obsidian mocks
export class Plugin {}
export class PluginSettingTab {}
export class Notice {}
export class TFile {}
export class App {
  vault: any
}
