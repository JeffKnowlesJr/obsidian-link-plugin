import moment from 'moment'

// Mock Obsidian's moment implementation
const momentFn: typeof moment = Object.assign(
  (date?: any) => moment(date),
  moment
)
export { momentFn as moment }

// Other Obsidian mocks
export class Plugin {}
export class PluginSettingTab {}
export class Notice {}
export class TFile {}
export class App {
  vault: any
}
