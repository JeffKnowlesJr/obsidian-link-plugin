import { Plugin, TFile, Notice, Modal } from 'obsidian';
import { DEFAULT_SETTINGS, validateSettings } from './settings';
import { LinkPluginSettings } from './types';
import { DirectoryManager } from './managers/directoryManager';
import { JournalManager } from './managers/journalManager';
import { LinkManager } from './managers/linkManager';
import { ErrorHandler } from './utils/errorHandler';
import { RibbonManager } from './ui/ribbonManager';
import { SettingsTab } from './ui/settingsTab';
import { DateService } from './services/dateService';
import { COMMAND_IDS } from './constants';

export default class LinkPlugin extends Plugin {
  settings!: LinkPluginSettings;
  directoryManager!: DirectoryManager;
  journalManager!: JournalManager;
  linkManager!: LinkManager;
  errorHandler!: ErrorHandler;
  ribbonManager!: RibbonManager;

  async onload() {
    console.log('Loading Obsidian Link Journal v2.2.0 - Pure Journal Management...');

    try {
      // Initialize DateService first
      DateService.initialize();

      // Load settings
      await this.loadSettings();

      // Initialize error handler first
      this.errorHandler = new ErrorHandler(this);

      // Initialize core managers (removed file sorting)
      this.directoryManager = new DirectoryManager(this);
      this.journalManager = new JournalManager(this);
      this.linkManager = new LinkManager(this);
      this.ribbonManager = new RibbonManager(this);

      // Add settings tab
      this.addSettingTab(new SettingsTab(this.app, this));

      // Initialize ribbon (simplified)
      this.ribbonManager.initializeRibbon();

      // Initialize link manager
      this.linkManager.initialize();

      // Register commands (core journal commands only)
      this.registerCommands();

      // Register event handlers (journal focused)
      this.registerEventHandlers();

      // Initialize directory structure
      await this.directoryManager.rebuildDirectoryStructure();

      // Ensure current month folder exists - CORE FEATURE
      await this.journalManager.checkAndCreateCurrentMonthFolder();

      // Update Obsidian's Daily Notes plugin to use our folder structure
      await this.updateDailyNotesSettings();

      // Start automatic date change monitoring
      this.startDateChangeMonitoring();

      // Verify date handling is working correctly
      const debugInfo = DateService.getDebugInfo();
      console.log('DateService initialized:', debugInfo);
      console.log('Today:', DateService.today());
      console.log('Current month:', DateService.currentMonth());

      this.errorHandler.showNotice('Obsidian Link Journal loaded - Pure journal management ready!');
      console.log('Obsidian Link Journal loaded successfully - Core journal functionality enabled');
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
    // Update ribbon button states when settings change
    if (this.ribbonManager) {
      this.ribbonManager.updateButtonStates();
    }
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
            // Type guard to ensure we have a MarkdownView
            if ('previewMode' in view) {
              this.linkManager.createLinkedNote(selection, editor, view);
            } else {
              this.errorHandler.handleError(new Error('Invalid view type'), 'Please use this command in a markdown view');
            }
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

    // Create future note command
    this.addCommand({
      id: COMMAND_IDS.CREATE_FUTURE_NOTE,
      name: 'Create Future Daily Note',
      callback: async () => {
        try {
          // Prompt user for date
          const dateInput = await this.promptForDate();
          if (dateInput) {
            const file = await this.journalManager.createFutureDailyNote(dateInput);
            const leaf = this.app.workspace.getLeaf();
            await leaf.openFile(file);
            this.errorHandler.showNotice(`Created future note for ${DateService.format(DateService.from(dateInput), 'YYYY-MM-DD')}`);
          }
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create future note');
        }
      }
    });

    // Create monthly folders command
    this.addCommand({
      id: COMMAND_IDS.CREATE_MONTHLY_FOLDERS,
      name: 'Create Monthly Folders for Current Year',
      callback: async () => {
        try {
          // Use DateService for consistent date handling
          const startOfYear = DateService.startOfYear();
          const endOfYear = DateService.endOfYear();
          
          await this.journalManager.createMonthlyFoldersForRange(startOfYear, endOfYear);
          
          this.errorHandler.showNotice('Monthly folders created for current year');
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to create monthly folders');
        }
      }
    });

    // Show ribbon quick actions (new command)
    this.addCommand({
      id: 'show-ribbon-actions',
      name: 'Show Ribbon Quick Actions',
      callback: () => {
        try {
          this.ribbonManager.showQuickActionsMenu();
        } catch (error) {
          this.errorHandler.handleError(error, 'Failed to show ribbon actions');
        }
      }
    });
  }

  registerEventHandlers() {
    // CORE FEATURE: Listen for journal file creation to update links
    this.registerEvent(
      this.app.vault.on('create', (file) => {
        // Type guard to ensure we have a TFile (has stat, basename, extension properties)
        if ('stat' in file && 'basename' in file && 'extension' in file && 
            file.path.includes(this.settings.journalRootFolder)) {
          this.journalManager.updateJournalLinks(file as TFile);
        }
      })
    );

    // Debug logging for journal-related file modifications
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (this.settings.debugMode && file.path.includes(this.settings.journalRootFolder)) {
          console.log('Journal file modified:', file.path);
        }
      })
    );

    // REMOVED: File sorting event handlers - functionality moved to quarantine
    // Focus on core journal management only
  }

  /**
   * Prompt user for a date input
   */
  private async promptForDate(): Promise<string | null> {
    return new Promise((resolve) => {
      const modal = new Modal(this.app);
      modal.setTitle('Create Future Daily Note');
      
      const { contentEl } = modal;
      
      // Add description
      contentEl.createEl('p', { 
        text: 'Select a date to create a daily note. This will automatically create the required monthly folders.',
        cls: 'modal-description'
      });
      
      // Create input container with proper spacing
      const inputContainer = contentEl.createDiv({ cls: 'date-input-container' });
      
      const input = inputContainer.createEl('input', {
        type: 'date',
        value: DateService.today(),
        cls: 'date-input'
      });
      
      // Add spacing after input to prevent overlap
      contentEl.createDiv({ cls: 'date-picker-spacer' });
      
      const buttonContainer = contentEl.createDiv({ cls: 'modal-button-container' });
      
      const createButton = buttonContainer.createEl('button', {
        text: 'Create Note',
        cls: 'mod-cta'
      });
      
      const cancelButton = buttonContainer.createEl('button', {
        text: 'Cancel'
      });
      
      // Add custom styles to prevent overlap
      const style = document.createElement('style');
      style.textContent = `
        .date-input-container {
          margin: 16px 0;
          position: relative;
          z-index: 1;
        }
        .date-input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid var(--background-modifier-border);
          border-radius: 4px;
          background: var(--background-primary);
          color: var(--text-normal);
          font-size: 14px;
        }
        .date-picker-spacer {
          height: 40px;
        }
        .modal-button-container {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          margin-top: 20px;
        }
        .modal-description {
          margin-bottom: 16px;
          color: var(--text-muted);
        }
      `;
      contentEl.appendChild(style);
      
      // Focus with slight delay to prevent initial overlap
      setTimeout(() => input.focus(), 100);
      
      createButton.onclick = () => {
        const dateValue = input.value;
        if (dateValue) {
          modal.close();
          resolve(dateValue);
        }
      };
      
      cancelButton.onclick = () => {
        modal.close();
        resolve(null);
      };
      
      input.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          createButton.click();
        } else if (e.key === 'Escape') {
          cancelButton.click();
        }
      });
      
      modal.open();
    });
  }

  /**
   * Start monitoring for date changes to automatically create new monthly folders
   */
  private startDateChangeMonitoring(): void {
    let lastCheckedMonth = DateService.format(DateService.now(), 'YYYY-MM');
    
    // Check every hour for date changes
    this.registerInterval(
      window.setInterval(async () => {
        try {
          const currentMonth = DateService.format(DateService.now(), 'YYYY-MM');
          
          // If month changed, ensure new month folder exists
          if (currentMonth !== lastCheckedMonth) {
            console.log(`Month changed from ${lastCheckedMonth} to ${currentMonth} - creating new monthly folder`);
            await this.journalManager.checkAndCreateCurrentMonthFolder();
            
            // Update Daily Notes plugin settings for new month
            await this.updateDailyNotesSettings();
            
            lastCheckedMonth = currentMonth;
            
            // Show notification about new month
            const monthName = DateService.format(DateService.now(), 'MMMM YYYY');
            this.errorHandler.showNotice(`📅 New month detected: ${monthName} folder created`);
          }
        } catch (error) {
          console.error('Error in date change monitoring:', error);
        }
      }, 60 * 60 * 1000) // Check every hour
    );
    
    console.log('Date change monitoring started - will auto-create monthly folders');
  }

  /**
   * Update Obsidian's Daily Notes plugin settings to use our folder structure
   */
  private async updateDailyNotesSettings(): Promise<void> {
    try {
      // Get the daily notes core plugin
      const dailyNotesPlugin = (this.app as any).internalPlugins?.plugins?.['daily-notes'];
      
      if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
        // Get our current month folder path
        const currentDate = DateService.now();
        const monthlyFolderPath = this.journalManager.getMonthlyFolderPath(currentDate);
        
        // Update the daily notes plugin settings
        const dailyNotesSettings = dailyNotesPlugin.instance.options;
        
        // Use the full monthly folder path (including base folder)
        dailyNotesSettings.folder = monthlyFolderPath;
        
        // Update format to match our format
        dailyNotesSettings.format = this.settings.journalDateFormat;
        
        // Settings updated (no save needed - handled by Obsidian)
        
        console.log(`Updated Daily Notes plugin folder to: ${monthlyFolderPath}`);
        this.errorHandler.showNotice(`✅ Daily Notes location updated to: ${monthlyFolderPath}`);
      } else {
        // Try community plugin approach
        const communityDailyNotes = (this.app as any).plugins?.plugins?.['daily-notes'];
        if (communityDailyNotes) {
          const currentDate = DateService.now();
          const monthlyFolderPath = this.journalManager.getMonthlyFolderPath(currentDate);
          
          // Use the full monthly folder path (including base folder)
          communityDailyNotes.settings.folder = monthlyFolderPath;
          communityDailyNotes.settings.format = this.settings.journalDateFormat;
          await communityDailyNotes.saveSettings();
          
          console.log(`Updated Community Daily Notes plugin folder to: ${monthlyFolderPath}`);
          this.errorHandler.showNotice(`✅ Daily Notes location updated to: ${monthlyFolderPath}`);
        } else {
          console.log('Daily Notes plugin not found or not enabled - using plugin folder structure only');
          this.errorHandler.showNotice('⚠️ Daily Notes plugin not found - notes created in plugin folder only');
        }
      }
    } catch (error) {
      console.log('Daily Notes integration skipped:', error instanceof Error ? error.message : String(error));
      // Don't show error to user - this is optional functionality
    }
  }

  onunload() {
    console.log('Obsidian Link Journal unloaded');
    
    // Clean up link manager
    if (this.linkManager) {
      this.linkManager.cleanup();
    }
    
    // Clean up ribbon buttons
    if (this.ribbonManager) {
      this.ribbonManager.cleanup();
    }
  }
}