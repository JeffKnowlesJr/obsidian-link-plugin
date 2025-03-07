// Mock Moment.js functionality
export const moment = (input?: any) => ({
  format: jest.fn((format) =>
    format ? `formatted-${input || 'now'}-${format}` : ''
  ),
  add: jest.fn().mockReturnThis(),
  subtract: jest.fn().mockReturnThis(),
  isValid: jest.fn().mockReturnValue(true)
})
moment.now = jest.fn(() => 'now')

// Export mocked Obsidian APIs
export class WorkspaceLeaf {
  view: any
  constructor() {
    this.view = {}
  }
}

export class Plugin {
  app: App
  manifest: any
  constructor(app: App, manifest: any) {
    this.app = app
    this.manifest = manifest
  }
  loadData = jest.fn().mockResolvedValue({})
  saveData = jest.fn().mockResolvedValue(undefined)
  registerEvent = jest.fn()
  registerInterval = jest.fn()
  registerDomEvent = jest.fn()
  addRibbonIcon = jest.fn()
  addStatusBarItem = jest.fn()
  addCommand = jest.fn()
  addSettingTab = jest.fn()
}

export class TFile {
  path: string
  basename: string
  extension: string
  constructor(path: string) {
    this.path = path
    const parts = path.split('/')
    const filename = parts[parts.length - 1]
    const [basename, extension] = filename.split('.')
    this.basename = basename
    this.extension = extension || ''
  }
}

export class TFolder {
  path: string
  constructor(path: string) {
    this.path = path
  }
}

export class Notice {
  constructor(message: string) {
    console.log('Notice:', message)
  }
}

export class Modal {
  app: App
  contentEl: HTMLElement
  constructor(app: App) {
    this.app = app
    this.contentEl = document.createElement('div')
  }
  open = jest.fn()
  close = jest.fn()
  onOpen = jest.fn()
  onClose = jest.fn()
}

export class Setting {
  constructor() {}
  setName = jest.fn().mockReturnThis()
  setDesc = jest.fn().mockReturnThis()
  addText = jest.fn().mockReturnThis()
  addToggle = jest.fn().mockReturnThis()
  addButton = jest.fn().mockReturnThis()
  addDropdown = jest.fn().mockReturnThis()
  addSlider = jest.fn().mockReturnThis()
}

export interface App {
  vault: Vault
  workspace: Workspace
  metadataCache: MetadataCache
}

export interface MetadataCache {
  getFirstLinkpathDest: (linkpath: string) => TFile | null
  getFileCache: (file: TFile) => any
  getCache: (path: string) => any
  fileToLinktext: (
    file: TFile,
    sourcePath: string,
    omitMdExtension?: boolean
  ) => string
  resolveSubpath: (file: TFile, subpath: string) => any
  getLinkSuggestions: () => any[]
  onCleanCache: (callback: (file: TFile) => void) => void
  on: (name: string, callback: (file: TFile) => void) => void
  off: (name: string, callback: (file: TFile) => void) => void
  trigger: (name: string, file: TFile) => void
}

export interface Vault {
  adapter: {
    exists: (path: string) => Promise<boolean>
    read: (path: string) => Promise<string>
    write: (path: string, data: string) => Promise<void>
    mkdir: (path: string) => Promise<void>
    trashSystem: boolean
  }
  create: (path: string, data: string) => Promise<TFile>
  createFolder: (path: string) => Promise<void>
  delete: (file: TFile, force?: boolean) => Promise<void>
  read: (file: TFile) => Promise<string>
  modify: (file: TFile, data: string) => Promise<void>
  getAbstractFileByPath: (path: string) => TFile | null
}

export interface Workspace {
  activeLeaf: WorkspaceLeaf | null
  getLeavesOfType: (type: string) => WorkspaceLeaf[]
}
