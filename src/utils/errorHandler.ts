
import { Notice } from 'obsidian';
import LinkPlugin from '../main';

export class ErrorHandler {
  plugin: LinkPlugin;
  
  constructor(plugin: LinkPlugin) { 
    this.plugin = plugin; 
  }
  
  handleError(error: any, context: string): void {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`${context}: ${message}`);
    new Notice(`${context}: ${message}`);
  }

  showNotice(message: string, duration?: number): void {
    new Notice(message, duration);
  }

  showSuccess(message: string): void {
    new Notice(message, 3000);
  }

  showWarning(message: string): void {
    new Notice(`⚠️ ${message}`, 5000);
  }
}
