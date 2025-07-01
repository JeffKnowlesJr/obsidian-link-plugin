import { Notice, MarkdownView } from 'obsidian';
import LinkPlugin from '../main';
import { RIBBON_BUTTONS } from '../constants';
import { DateService } from '../services/dateService';

export class RibbonManager {
  private plugin: LinkPlugin;
  private ribbonButtons: HTMLElement[] = [];

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Initialize ribbon buttons - minimized to 2 essential buttons
   */
  initializeRibbon(): void {
    this.addCreateFutureNoteButton();
    this.addSettingsButton();

    if (this.plugin.settings.debugMode) {
      console.log('[LinkPlugin] Ribbon initialized with', this.ribbonButtons.length, 'buttons');
    }
  }

  /**
   * Clean up ribbon buttons on plugin unload
   */
  cleanup(): void {
    this.ribbonButtons.forEach(button => {
      button.remove();
    });
    this.ribbonButtons = [];
  }

  /**
   * Add Today's Journal button
   */
  private addTodayJournalButton(): void {
    const button = this.plugin.addRibbonIcon(
      RIBBON_BUTTONS.TODAY_JOURNAL.icon,
      RIBBON_BUTTONS.TODAY_JOURNAL.tooltip,
      async () => {
        try {
          await this.plugin.journalManager.openTodayJournal();
          this.showSuccess('Today\'s journal opened');
        } catch (error) {
          this.plugin.errorHandler.handleError(error, 'Failed to open today\'s journal');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Add Create Future Note button - combines multiple functions into one smart button
   */
  private addCreateFutureNoteButton(): void {
    const button = this.plugin.addRibbonIcon(
      '📝',
      'Create Future Note - Creates daily notes, linked notes, or opens today\'s journal',
      async () => {
        try {
          // Get the active markdown view
          const activeView = this.plugin.app.workspace.getActiveViewOfType(MarkdownView);
          
          if (activeView) {
            const editor = activeView.editor;
            const selection = editor.getSelection();

            if (selection) {
              // If text is selected, create a linked note
              this.plugin.linkManager.createLinkedNote(selection, editor, activeView);
              this.showSuccess('Linked note created');
              return;
            }
          }

          // If no selection or no active view, open today's journal
          await this.plugin.journalManager.openTodayJournal();
          this.showSuccess('Today\'s journal opened');
        } catch (error) {
          this.plugin.errorHandler.handleError(error, 'Failed to create note');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Add Monthly Folders button
   */
  private addMonthlyFoldersButton(): void {
    const button = this.plugin.addRibbonIcon(
      RIBBON_BUTTONS.MONTHLY_FOLDERS.icon,
      RIBBON_BUTTONS.MONTHLY_FOLDERS.tooltip,
      async () => {
        try {
          const startOfYear = DateService.startOfYear();
          const endOfYear = DateService.endOfYear();
          
          await this.plugin.journalManager.createMonthlyFoldersForRange(startOfYear, endOfYear);
          this.showSuccess('Monthly folders created for current year');
        } catch (error) {
          this.plugin.errorHandler.handleError(error, 'Failed to create monthly folders');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Add Shortcode Help button (deprecated - moved to quarantine)
   */
  // private addShortcodeHelpButton(): void {
  //   // Shortcode help button logic moved to quarantine
  // }

  /**
   * Add Rebuild Directory Structure button
   */
  private addRebuildStructureButton(): void {
    const button = this.plugin.addRibbonIcon(
      RIBBON_BUTTONS.REBUILD_STRUCTURE.icon,
      RIBBON_BUTTONS.REBUILD_STRUCTURE.tooltip,
      async () => {
        try {
          await this.plugin.directoryManager.rebuildDirectoryStructure();
          this.showSuccess('Directory structure rebuilt');
        } catch (error) {
          this.plugin.errorHandler.handleError(error, 'Failed to rebuild directory structure');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Add Settings button
   */
  private addSettingsButton(): void {
    const button = this.plugin.addRibbonIcon(
      RIBBON_BUTTONS.PLUGIN_SETTINGS.icon,
      RIBBON_BUTTONS.PLUGIN_SETTINGS.tooltip,
      () => {
        try {
          // Open settings tab - use the app's settings interface
          (this.plugin.app as any).setting.open();
          (this.plugin.app as any).setting.openTabById(this.plugin.manifest.id);
        } catch (error) {
          // Fallback: show a notice to manually open settings
          new Notice('Please open Settings manually and find the Link Plugin tab');
          this.plugin.errorHandler.handleError(error, 'Failed to open settings automatically');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    new Notice(`✅ ${message}`);
    
    if (this.plugin.settings.debugMode) {
      console.log(`[LinkPlugin] ${message}`);
    }
  }

  /**
   * Update ribbon button states based on settings
   */
  updateButtonStates(): void {
    // Could be used to enable/disable buttons based on settings
    // For example, disable shortcode help if shortcodes are disabled
    if (this.plugin.settings.debugMode) {
      console.log('[LinkPlugin] Ribbon button states updated');
    }
  }

  /**
   * Get ribbon button count for debugging
   */
  getButtonCount(): number {
    return this.ribbonButtons.length;
  }

  /**
   * Add a custom ribbon button (for future extensibility)
   */
  addCustomButton(
    icon: string, 
    tooltip: string, 
    callback: () => void | Promise<void>
  ): HTMLElement {
    const button = this.plugin.addRibbonIcon(icon, tooltip, callback);
    this.ribbonButtons.push(button);
    return button;
  }

  /**
   * Remove a specific ribbon button
   */
  removeButton(button: HTMLElement): void {
    const index = this.ribbonButtons.indexOf(button);
    if (index > -1) {
      this.ribbonButtons.splice(index, 1);
      button.remove();
    }
  }

  /**
   * Show quick actions menu (future enhancement)
   */
  showQuickActionsMenu(): void {
    // This could show a popup menu with additional actions
    // For now, just show a notice about available features
    const message = `
Link Plugin Quick Actions:
• Today's Journal: ${RIBBON_BUTTONS.TODAY_JOURNAL.tooltip}
• Create Note: ${RIBBON_BUTTONS.CREATE_NOTE.tooltip}
• Monthly Folders: ${RIBBON_BUTTONS.MONTHLY_FOLDERS.tooltip}
• Shortcode Help: (deprecated - moved to quarantine)
• Rebuild Structure: ${RIBBON_BUTTONS.REBUILD_STRUCTURE.tooltip}
• Settings: ${RIBBON_BUTTONS.PLUGIN_SETTINGS.tooltip}
    `.trim();
    
    new Notice(message, 8000);
  }
} 