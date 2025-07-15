/**
 * Algorithms for RibbonManager:
 * 
 * - constructor(plugin):
 *   1. Store the plugin instance.
 *   2. Initialize an empty array for ribbonButtons.
 * 
 * - initializeRibbon():
 *   1. Call clearRibbon() to remove any existing ribbon buttons.
 *   2. Add the core journal management buttons by calling addCreateFutureNoteButton() and addSettingsButton().
 *   3. Log that the ribbon has been initialized.
 * 
 * - addCreateFutureNoteButton():
 *   1. Add a ribbon icon for creating a future note.
 *   2. On click:
 *      a. Show a date picker modal (showDatePicker()).
 *      b. If a date is selected, create the future daily note and open it.
 *      c. Show a success message with the formatted date.
 *      d. If an error occurs, handle it with the error handler.
 *   3. Store the button in ribbonButtons.
 * 
 * - showDatePicker():
 *   1. Create and display a modal with:
 *      a. Instructions.
 *      b. A date input (defaulting to tomorrow).
 *      c. Cancel and Create Note buttons.
 *      d. Keyboard shortcuts for Enter (create) and Escape (cancel).
 *   2. Resolve with the selected date or null.
 * 
 * - addSettingsButton():
 *   1. Add a ribbon icon for opening settings.
 *   2. On click:
 *      a. Try to open the plugin's settings tab using the Obsidian API.
 *      b. If it fails, show a notice and handle the error.
 *   3. Store the button in ribbonButtons.
 * 
 * - clearRibbon():
 *   1. Remove all ribbon buttons from the UI.
 *   2. Clear the ribbonButtons array.
 * 
 * - cleanup():
 *   1. Call clearRibbon() to remove all buttons.
 * 
 * - updateButtonStates():
 *   1. (No-op) Log that ribbon buttons were updated.
 * 
 * - showQuickActionsMenu():
 *   1. Show a notice listing the core quick actions.
 * 
 * - showSuccess(message):
 *   1. Show a success notice with the provided message.
 */

import { MarkdownView, Modal } from 'obsidian';
import LinkPlugin from '../main';
import { RIBBON_BUTTONS } from '../constants';
import { DateService } from '../services/dateService';
import { DebugUtils } from '../utils/debugUtils';

export class RibbonManager {
  private plugin: LinkPlugin;
  private ribbonButtons: HTMLElement[] = [];

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Initialize ribbon with core journal functionality only
   */
  initializeRibbon(): void {
    // Clear existing buttons
    this.clearRibbon();

    // Only add journal management buttons if plugin is enabled
    if (this.plugin.settings.enabled) {
      this.addCreateFutureNoteButton();
    }
    
    // Only add settings button if enabled in settings
    if (this.plugin.settings.showRibbonButton) {
      this.addSettingsButton();
    }

    DebugUtils.log('Ribbon initialized - Core journal functionality enabled');
  }

  /**
   * Add Create Future Note button - CORE FEATURE with date picker
   */
  private addCreateFutureNoteButton(): void {
    const button = this.plugin.addRibbonIcon(
      'calendar-plus',
      'Create Future Note - Select date to create note',
      async () => {
        if (!this.plugin.settings.enabled) {
          this.plugin.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use this feature.');
          return;
        }
        try {
          // Show date picker for future note creation
          const selectedDate = await this.showDatePicker();
          if (selectedDate) {
            // Create the future note with automatic folder creation
            const file = await this.plugin.dailyNotesManager.createFutureDailyNote(selectedDate);
            const leaf = this.plugin.app.workspace.getLeaf();
            await leaf.openFile(file);
            
            const formattedDate = DateService.format(DateService.from(selectedDate), 'YYYY-MM-DD');
            this.showSuccess(`Created future note for ${formattedDate}`);
          }
        } catch (error) {
          this.plugin.errorHandler.handleError(error, 'Failed to create future note');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Show date picker modal for future note creation - FIXED MODAL API
   */
  private async showDatePicker(): Promise<string | null> {
    return new Promise((resolve) => {
      const modal = new Modal(this.plugin.app);
      modal.setTitle('Create Future Daily Note');
      
      const { contentEl } = modal;
      
      // Instructions
      const instructions = contentEl.createEl('p');
      instructions.textContent = 'Select a date to create a daily note. This will automatically create the required monthly folders.';
      instructions.style.marginBottom = '1em';
      instructions.style.color = 'var(--text-muted)';
      
      // Date input
      const dateInput = contentEl.createEl('input');
      dateInput.type = 'date';
      dateInput.style.width = '100%';
      dateInput.style.padding = '8px';
      dateInput.style.marginBottom = '1em';
      dateInput.style.border = '1px solid var(--background-modifier-border)';
      dateInput.style.borderRadius = '4px';
      
      // Set default to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.value = tomorrow.toISOString().split('T')[0];
      
      // Button container
      const buttonContainer = contentEl.createDiv();
      buttonContainer.style.display = 'flex';
      buttonContainer.style.gap = '8px';
      buttonContainer.style.justifyContent = 'flex-end';
      
      // Cancel button
      const cancelButton = buttonContainer.createEl('button', { text: 'Cancel' });
      cancelButton.onclick = () => {
        modal.close();
        resolve(null);
      };
      
      // Create button
      const createButton = buttonContainer.createEl('button', { 
        text: 'Create Note',
        cls: 'mod-cta'
      });
      createButton.onclick = () => {
        const selectedDate = dateInput.value;
        if (selectedDate) {
          modal.close();
          resolve(selectedDate);
        }
      };
      
      // Enter key creates note
      dateInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          const selectedDate = dateInput.value;
          if (selectedDate) {
            modal.close();
            resolve(selectedDate);
          }
        }
      });
      
      // Escape key cancels
      modal.scope.register([], 'Escape', () => {
        modal.close();
        resolve(null);
      });
      
      modal.open();
      
      // Focus the date input
      setTimeout(() => dateInput.focus(), 100);
    });
  }

  /**
   * Add Settings button
   */
  private addSettingsButton(): void {
    const button = this.plugin.addRibbonIcon(
      'link',
      'DateFolders For DailyNotes Settings',
      () => {
        try {
          // Open settings using the correct Obsidian API
          // @ts-ignore - Obsidian API
          this.plugin.app.setting.open();
          // @ts-ignore - Obsidian API
          this.plugin.app.setting.openTabById(this.plugin.manifest.id);
        } catch (error) {
          // Fallback - use notice to instruct user
          this.plugin.errorHandler.showNotice('Please open Settings → Community Plugins → DateFolders For DailyNotes to configure');
          this.plugin.errorHandler.handleError(error, 'Failed to open settings automatically');
        }
      }
    );
    this.ribbonButtons.push(button);
  }

  /**
   * Clear all ribbon buttons
   */
  clearRibbon(): void {
    this.ribbonButtons.forEach(button => {
      if (button && button.parentNode) {
        button.remove();
      }
    });
    this.ribbonButtons = [];
    DebugUtils.log('Cleared all ribbon buttons');
  }

  /**
   * Cleanup method for plugin unload
   */
  cleanup(): void {
    this.clearRibbon();
  }

  /**
   * Update button states based on settings
   */
  updateButtonStates(): void {
    // Reinitialize ribbon to reflect current settings
    DebugUtils.log('Updating ribbon buttons based on settings...');
    this.initializeRibbon();
    DebugUtils.log(`Ribbon updated - Plugin enabled: ${this.plugin.settings.enabled}, Show ribbon: ${this.plugin.settings.showRibbonButton}`);
  }

  /**
   * Show quick actions menu
   */
  showQuickActionsMenu(): void {
    if (!this.plugin.settings.enabled) {
      this.plugin.errorHandler.showNotice('❌ Plugin is disabled. Enable it in settings to use journal management features.');
      return;
    }
    
    // Simple notice with core actions
    const message = `DateFolders For DailyNotes Quick Actions:
• Create Today's Note: Open or create today's journal
• Create Monthly Folders: Set up folder structure
• Settings: Configure journal management`;
    
    this.plugin.errorHandler.showNotice(message);
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.plugin.errorHandler.showNotice(message);
  }
} 