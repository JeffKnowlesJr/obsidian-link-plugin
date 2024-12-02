import { Moment } from 'moment'

export const moment = jest.fn((input?: string) => {
  const m = jest.requireActual('moment')(input)
  m.format = jest.fn((fmt: string) => {
    if (fmt === 'dddd') return 'Thursday'
    if (fmt === 'MMM') return 'Dec'
    if (fmt === 'YYYY-MM-DD') return '2024-12-19'
    return m.format(fmt)
  })
  return m
})

export class Plugin {
  app: App
  manifest: any

  constructor(app: App, manifest: any) {
    this.app = app
    this.manifest = manifest
  }

  loadData(): Promise<any> {
    return Promise.resolve({})
  }

  saveData(_: any): Promise<void> {
    return Promise.resolve()
  }
}

export class TFile {
  path: string
  basename: string
  extension: string

  constructor(path: string, basename: string, extension: string) {
    this.path = path
    this.basename = basename
    this.extension = extension
  }
}

export class Notice {
  constructor(message: string) {
    console.log('Notice:', message)
  }
}

export interface App {
  vault: Vault
  workspace: Workspace
  internalPlugins: {
    plugins: {
      [key: string]: any
    }
  }
}

export interface Vault {
  adapter: {
    exists(path: string): Promise<boolean>
    read(path: string): Promise<string>
    write(path: string, data: string): Promise<void>
  }
  createFolder(path: string): Promise<void>
  create(path: string, data: string): Promise<TFile>
  modify(file: TFile, data: string): Promise<void>
  on(name: string, callback: (file: TFile) => void): void
}

export interface Workspace {
  onLayoutReady(callback: () => void): void
  on(name: string, callback: (file: TFile) => void): void
  getActiveViewOfType<T>(type: any): T | null
  getLeavesOfType(type: string): any[]
}
