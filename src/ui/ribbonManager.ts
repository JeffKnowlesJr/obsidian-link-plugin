import { MarkdownView, Modal } from 'obsidian';
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
   * Initialize ribbon with core journal functionality only
   */
  initializeRibbon(): void {
    // Clear existing buttons
    this.clearRibbon();

    // Add core journal management buttons only
    this.addCreateFutureNoteButton();
    this.addSettingsButton();

    console.log('Ribbon initialized - Core journal functionality enabled');
  }

  /**
   * Add Create Future Note button - CORE FEATURE with date picker
   */
  private addCreateFutureNoteButton(): void {
    const button = this.plugin.addRibbonIcon(
      'calendar-plus',
      'Create Future Note - Select date to create note',
      async () => {
        try {
          // Show date picker for future note creation
          const selectedDate = await this.showDatePicker();
          if (selectedDate) {
            // Create the future note with automatic folder creation
            const file = await this.plugin.journalManager.createFutureDailyNote(selectedDate);
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
      'Open Obsidian Link Journal Settings',
      () => {
        try {
          // Open settings using the correct Obsidian API
          // @ts-ignore - Obsidian API
          this.plugin.app.setting.open();
          // @ts-ignore - Obsidian API
          this.plugin.app.setting.openTabById(this.plugin.manifest.id);
        } catch (error) {
          // Fallback - use notice to instruct user
          this.plugin.errorHandler.showNotice('Please open Settings → Community Plugins → Obsidian Link Journal to configure');
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
    this.ribbonButtons.forEach(button => button.remove());
    this.ribbonButtons = [];
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
    // No state-dependent buttons in simplified ribbon
    console.log('Ribbon buttons updated');
  }

  /**
   * Show quick actions menu
   */
  showQuickActionsMenu(): void {
    // Simple notice with core actions
    const message = `Obsidian Link Journal Quick Actions:
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