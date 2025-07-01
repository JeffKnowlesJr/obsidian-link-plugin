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
import { DateService } from '../services/dateService';

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
      // Create the base folder first (if not root)
      const basePath = baseFolder ? normalizePath(baseFolder) : '';
      if (basePath) {
        await this.getOrCreateDirectory(basePath);
        console.log(`Created base directory: ${basePath}`);
      } else {
        console.log('Using vault root as base directory');
      }

      // Create basic directory structure
      for (const dirName of directoryStructure || DEFAULT_DIRECTORIES) {
        const dirPath = basePath ? PathUtils.joinPath(basePath, dirName) : dirName;
        await this.getOrCreateDirectory(dirPath);
        console.log(`Created directory: ${dirPath}`);
      }

      // Create journal structure (only journal folder needed)
      await this.createJournalStructure(basePath);

    } catch (error) {
      throw new Error(`Failed to rebuild directory structure: ${error}`);
    }
  }

  /**
   * Creates journal structure - simple or dynamic based on single setting
   */
  async createJournalStructure(basePath: string): Promise<void> {
    const journalPath = PathUtils.joinPath(basePath, 'journal');
    
    // Always create the basic journal directory
    await this.getOrCreateDirectory(journalPath);
    console.log(`Created journal directory: ${journalPath}`);
    
    // Only create complex structure if simple mode is disabled
    if (!this.plugin.settings.simpleJournalMode) {
      // Create CURRENT YEAR/MONTH structure using proper format
      const currentDate = DateService.now();
      const currentYear = DateService.format(currentDate, 'YYYY');
      const currentMonth = DateService.format(currentDate, 'MM-MMMM');
      
      // Create current year/month folder
      const currentYearPath = PathUtils.joinPath(journalPath, currentYear);
      const currentMonthPath = PathUtils.joinPath(currentYearPath, currentMonth);
      
      await this.getOrCreateDirectory(currentYearPath);
      await this.getOrCreateDirectory(currentMonthPath);
      
      console.log(`Created current month directory: ${currentMonthPath}`);
      
      // Create archive structure
      const archivePath = PathUtils.joinPath(journalPath, 'z_Archives');
      await this.getOrCreateDirectory(archivePath);
      
      const archiveYears = ['2022', '2023', '2024'];
      for (const year of archiveYears) {
        const archiveYearPath = PathUtils.joinPath(archivePath, year);
        await this.getOrCreateDirectory(archiveYearPath);
      }
      
      console.log('Created archive structure');
    }
  }

  /**
   * Creates the reference structure (just reference folder, no files inside)
   */
  async createReferenceStructure(basePath: string): Promise<void> {
    const referencePath = PathUtils.joinPath(basePath, 'reference');
    
    // Create reference directory for reference notes only
    await this.getOrCreateDirectory(referencePath);
    console.log(`Created reference directory: ${referencePath}`);
  }

  /**
   * Creates the FILES structure as TOP-LEVEL directory (NOT inside references!)
   */
  async createFilesStructure(basePath: string): Promise<void> {
    const filesPath = PathUtils.joinPath(basePath, 'files');
    
    // Create FILES file type directories at TOP LEVEL
    const fileTypes = ['images', 'pdfs', 'videos', 'audio', 'docs', 'other'];
    
    for (const fileType of fileTypes) {
      const filePath = PathUtils.joinPath(filesPath, fileType);
      await this.getOrCreateDirectory(filePath);
      console.log(`Created FILES directory: ${filePath}`);
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
    return baseFolder ? PathUtils.joinPath(baseFolder, relativePath) : relativePath;
  }

  /**
   * Gets the journal directory path
   */
  getJournalPath(): string {
    const { baseFolder, journalRootFolder } = this.plugin.settings;
    return baseFolder ? PathUtils.joinPath(baseFolder, journalRootFolder) : journalRootFolder;
  }

  /**
   * Gets the workspace directory path  
   */
  getWorkspacePath(): string {
    const { baseFolder, documentDirectory } = this.plugin.settings;
    return baseFolder ? PathUtils.joinPath(baseFolder, documentDirectory) : documentDirectory;
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