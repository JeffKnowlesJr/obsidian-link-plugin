import { TFolder, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
import { 
  DEFAULT_DIRECTORIES, 
  DEFAULT_JOURNAL_STRUCTURE, 
  DEFAULT_REFERENCE_STRUCTURE,
  OPTIONAL_DIRECTORIES 
} from '../constants';
import { PathUtils } from '../utils/pathUtils';
import { DirectoryTemplate } from '../types';

export class DirectoryManager {
  plugin: LinkPlugin;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Creates the base directory structure according to settings
   * All directories are created under the configured baseFolder to prevent collisions
   */
  async rebuildDirectoryStructure(): Promise<void> {
    const { vault } = this.plugin.app;
    const { baseFolder, directoryStructure } = this.plugin.settings;

    try {
      // Create the base folder first
      const basePath = normalizePath(baseFolder);
      await this.getOrCreateDirectory(basePath);
      console.log(`Created base directory: ${basePath}`);

      // Create basic directory structure
      for (const dirName of directoryStructure || DEFAULT_DIRECTORIES) {
        const dirPath = PathUtils.joinPath(basePath, dirName);
        await this.getOrCreateDirectory(dirPath);
        console.log(`Created directory: ${dirPath}`);
      }

      // Create detailed journal structure
      await this.createJournalStructure(basePath);
      
      // Create reference structure
      await this.createReferenceStructure(basePath);

    } catch (error) {
      throw new Error(`Failed to rebuild directory structure: ${error}`);
    }
  }

  /**
   * Creates the detailed journal structure as specified in README
   */
  async createJournalStructure(basePath: string): Promise<void> {
    const journalPath = PathUtils.joinPath(basePath, 'journal');
    
    // Create journal subdirectories
    const journalSubdirs = [
      'Misc',
      'y_2025/January',
      'y_2025/February', 
      'y_2025/March',
      'y_2025/April',
      'y_2025/May',
      'y_2025/June',
      'y_2025/Misc',
      'y_2025/Yearly List',
      'y_2025/Yearly Log',
      'z_Archives/y_2022',
      'z_Archives/y_2023',
      'z_Archives/y_2024'
    ];

    for (const subdir of journalSubdirs) {
      const fullPath = PathUtils.joinPath(journalPath, subdir);
      await this.getOrCreateDirectory(fullPath);
      console.log(`Created journal directory: ${fullPath}`);
    }
  }

  /**
   * Creates the reference file structure as specified in README
   */
  async createReferenceStructure(basePath: string): Promise<void> {
    const referencePath = PathUtils.joinPath(basePath, 'reference');
    
    // Create reference file type directories
    const fileTypes = ['images', 'pdfs', 'videos', 'audio', 'docs', 'other'];
    
    for (const fileType of fileTypes) {
      const filePath = PathUtils.joinPath(referencePath, 'files', fileType);
      await this.getOrCreateDirectory(filePath);
      console.log(`Created reference directory: ${filePath}`);
    }
  }

  /**
   * Creates optional complex structure directories
   */
  async createOptionalStructure(basePath: string): Promise<void> {
    for (const dirName of OPTIONAL_DIRECTORIES) {
      const dirPath = PathUtils.joinPath(basePath, dirName);
      await this.getOrCreateDirectory(dirPath);
      console.log(`Created optional directory: ${dirPath}`);
    }
  }

  /**
   * Gets a directory path, creating it if it doesn't exist
   * Handles both absolute paths and paths relative to the base folder
   */
  async getOrCreateDirectory(path: string): Promise<TFolder> {
    const { vault } = this.plugin.app;
    const normalizedPath = normalizePath(path);
    const existingFolder = vault.getAbstractFileByPath(normalizedPath);

    if (existingFolder instanceof TFolder) {
      return existingFolder;
    }

    // Create parent directories recursively
    const pathParts = normalizedPath.split('/');
    let currentPath = '';

    for (const part of pathParts) {
      if (!part) continue;

      currentPath += (currentPath ? '/' : '') + part;
      const folder = vault.getAbstractFileByPath(currentPath);

      if (!folder) {
        await vault.createFolder(currentPath);
      } else if (!(folder instanceof TFolder)) {
        throw new Error(`Path ${currentPath} exists but is not a folder`);
      }
    }

    return vault.getAbstractFileByPath(normalizedPath) as TFolder;
  }

  /**
   * Gets the full path for a directory within the plugin's base folder
   */
  getPluginDirectoryPath(relativePath: string): string {
    const { baseFolder } = this.plugin.settings;
    return PathUtils.joinPath(baseFolder, relativePath);
  }

  /**
   * Gets the journal directory path
   */
  getJournalPath(): string {
    const { baseFolder, journalRootFolder } = this.plugin.settings;
    return PathUtils.joinPath(baseFolder, journalRootFolder);
  }

  /**
   * Gets the workspace directory path  
   */
  getWorkspacePath(): string {
    const { baseFolder, documentDirectory } = this.plugin.settings;
    return PathUtils.joinPath(baseFolder, documentDirectory);
  }

  /**
   * Applies a directory template to create structured folders
   */
  async applyDirectoryTemplate(basePath: string, template: DirectoryTemplate): Promise<void> {
    for (const [key, value] of Object.entries(template)) {
      const dirPath = PathUtils.joinPath(basePath, key);
      await this.getOrCreateDirectory(dirPath);

      if (value && typeof value === 'object') {
        await this.applyDirectoryTemplate(dirPath, value);
      }
    }
  }

  /**
   * Validates if a given path is within allowed directories
   */
  isValidPath(path: string): boolean {
    const normalizedPath = normalizePath(path);
    const { restrictedDirectories } = this.plugin.settings;

    if (!restrictedDirectories || restrictedDirectories.length === 0) {
      return true;
    }

    return !restrictedDirectories.some((dir: string) => {
      const normalizedDir = normalizePath(dir);
      return normalizedPath === normalizedDir || normalizedPath.startsWith(normalizedDir + '/');
    });
  }

  /**
   * Lists all directories in the vault
   */
  getAllDirectories(): TFolder[] {
    const { vault } = this.plugin.app;
    return vault.getAllLoadedFiles()
      .filter(file => file instanceof TFolder) as TFolder[];
  }

  /**
   * Creates a directory with a specific template structure within the plugin's base folder
   */
  async createProjectDirectory(name: string, template?: DirectoryTemplate): Promise<TFolder> {
    const sanitizedName = PathUtils.sanitizePath(name);
    const workspacePath = this.getWorkspacePath();
    const projectPath = PathUtils.joinPath(workspacePath, sanitizedName);

    const projectFolder = await this.getOrCreateDirectory(projectPath);

    if (template) {
      await this.applyDirectoryTemplate(projectPath, template);
    }

    return projectFolder;
  }
}