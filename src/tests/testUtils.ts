import {
  App,
  Plugin,
  TFile,
  TFolder,
  Vault,
  MetadataCache,
  PluginManifest
} from 'obsidian'
import { LinkPluginSettings, DEFAULT_SETTINGS } from '../settings/settings'
import LinkPlugin from '../main'

export function createMockApp(): App {
  const mockVault = {
    adapter: {
      exists: jest.fn().mockResolvedValue(false),
      read: jest.fn().mockResolvedValue(''),
      write: jest.fn().mockResolvedValue(undefined)
    },
    create: jest.fn().mockResolvedValue({ path: 'test.md' }),
    createFolder: jest.fn().mockResolvedValue({ path: 'test' }),
    delete: jest.fn().mockResolvedValue(undefined),
    modify: jest.fn().mockResolvedValue(undefined),
    on: jest.fn()
  } as unknown as Vault

  const mockWorkspace = {
    onLayoutReady: jest.fn((cb) => cb()),
    on: jest.fn(),
    getActiveViewOfType: jest.fn(),
    getLeavesOfType: jest.fn(),
    getLeaf: jest.fn().mockReturnValue({
      openFile: jest.fn().mockResolvedValue(undefined)
    })
  }

  const mockMetadataCache = {
    getFirstLinkpathDest: jest.fn(),
    getFileCache: jest.fn(),
    getCache: jest.fn(),
    fileToLinktext: jest.fn(),
    resolveSubpath: jest.fn(),
    onCleanCache: jest.fn(),
    on: jest.fn()
  } as unknown as MetadataCache

  return {
    vault: mockVault,
    workspace: mockWorkspace,
    metadataCache: mockMetadataCache
  } as unknown as App
}

export function createMockSettings(
  overrides: Partial<LinkPluginSettings> = {}
): LinkPluginSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...overrides
  }
}

export function createMockPlugin(app: App): LinkPlugin {
  const manifest: PluginManifest = {
    id: 'obsidian-link-plugin',
    name: 'Link Plugin',
    version: '1.0.0',
    minAppVersion: '0.15.0',
    description: 'A plugin for managing links in Obsidian',
    author: 'Test Author'
  }
  const plugin = new LinkPlugin(app, manifest)
  plugin.settings = createMockSettings()
  return plugin
}

export function createMockFile(path: string = 'test.md'): any {
  return {
    path,
    basename: path.replace(/\.[^/.]+$/, ''),
    extension: path.split('.').pop() || 'md'
  }
}
