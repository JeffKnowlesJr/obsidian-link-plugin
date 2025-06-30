import { Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, LinkPluginSettings, validateSettings } from './settings';
import { SettingsTab } from './ui/settingsTab';
import { DirectoryManager } from './managers/directoryManager';
import { JournalManager } from './managers/journalManager';
import { LinkManager } from './managers/linkManager';
import { ShortcodeManager } from './shortcodes/registry';
import { ErrorHandler } from './utils/errorHandler';
import { COMMAND_IDS } from './constants';

export default class LinkPlugin extends Plugin {
  settings: LinkPluginSettings;
  directoryManager: DirectoryManager;
  journalManager: JournalManager;
  linkManager: LinkManager;
  shortcodeManager: ShortcodeManager;
  errorHandler: ErrorHandler;

  async onload() {
    console.log('Loading Link Plugin...');

    try {
      // Load settings
      await this.loadSettings();

      // Initialize error handler first
      this.errorHandler = new ErrorHandler(this);

      // Initialize managers
      this.directoryManager = new DirectoryManager(this);
      this.journalManager = new JournalManager(this);
      this.linkManager = new LinkManager(this);
      this.shortcodeManager = new ShortcodeManager(this);

      // Add settings tab
      this.addSettingTab(new SettingsTab(this.app, this));

      // Register commands
      this.registerCommands();

      // Register event handlers
      this.registerEventHandlers();

      // Initialize directory structure
      await this.directoryManager.rebuildDirectoryStructure();

      // Ensure current month folder exists
      await this.journalManager.checkAndCreateCurrentMonthFolder();

      console.log('Link Plugin loaded successfully');
    } catch (error) {
      console.error('Failed to load Link Plugin:', error);
      if (this.errorHandler) {
        this.errorHandler.handleError(error, 'Plugin initialization failed');
      }
    }
  }

  async loadSettings() {
    const loadedData = await this.loadData();
    this.settings = validateSettings(loadedData || {});
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  registerCommands() {
    // Create linked note command
    this.addCommand({
      id: COMMAND_IDS.CREATE_LINKED_NOTE,
      name: 'Create Linked Note from Selection',
      editorCallback: (editor, view) => {
        try {
          const selection = editor.getSelection();
          if (selection) {
            this.linkManager.createLinkedNote(selection, editor, view);
          } else {
            this.errorHandler.handleError(new Error('No text selected'), 'Please select text to create a linked note');
          }
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create linked note');
        }
      }
    });

    // Rebuild directory structure command
    this.addCommand({
      id: COMMAND_IDS.REBUILD_DIRECTORY,
      name: 'Rebuild Directory Structure',
      callback: () => {
        try {
          this.directoryManager.rebuildDirectoryStructure();
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to rebuild directory structure');
        }
      }
    });

    // Open today's journal command
    this.addCommand({
      id: COMMAND_IDS.OPEN_TODAY_JOURNAL,
      name: 'Open Today\'s Journal',
      callback: () => {
        try {
          this.journalManager.openTodayJournal();
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to open today\'s journal');
        }
      }
    });

    // Create today's note command
    this.addCommand({
      id: COMMAND_IDS.CREATE_TODAY_NOTE,
      name: 'Create Today\'s Daily Note',
      callback: async () => {
        try {
          const file = await this.journalManager.createTodayNote();
          const leaf = this.app.workspace.getLeaf();
          await leaf.openFile(file);
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create today\'s note');
        }
      }
    });

    // Create monthly folders command
    this.addCommand({
      id: COMMAND_IDS.CREATE_MONTHLY_FOLDERS,
      name: 'Create Monthly Folders for Current Year',
      callback: async () => {
        try {
          // Create folders for the entire current year
          const startOfYear = (window as any).moment().startOf('year');
          const endOfYear = (window as any).moment().endOf('year');
          
          await this.journalManager.createMonthlyFoldersForRange(startOfYear, endOfYear);
          
          this.errorHandler.showNotice('Monthly folders created for current year');
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create monthly folders');
        }
      }
    });

    // Show shortcode help
    this.addCommand({
      id: 'show-shortcode-help',
      name: 'Show Shortcode Help',
      callback: () => {
        try {
          this.shortcodeManager.showHelpModal();
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to show shortcode help');
        }
      }
    });
  }

  registerEventHandlers() {
    // Listen for editor changes to detect shortcodes
    this.registerEvent(
      this.app.workspace.on('editor-change', (editor) => {
        if (this.settings.shortcodeEnabled) {
          this.shortcodeManager.checkForShortcodes(editor);
        }
      })
    );

    // Listen for file creation to update journal links
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        if (file.path.includes(this.settings.journalRootFolder)) {
          this.journalManager.updateJournalLinks(file);
        }
      })
    );

    // Listen for file modifications
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        // Update backlinks or perform other operations
        if (this.settings.debugMode) {
          console.log('File modified:', file.path);
        }
      })
    );
  }

  onunload() {
    console.log('Link Plugin unloaded');
  }
}