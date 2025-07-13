
/**
 * Algorithms for ErrorHandler:
 *
 * - constructor(plugin):
 *     1. Store the plugin instance for later use.
 *
 * - handleError(error, context):
 *     1. Determine the error message (from Error object or string).
 *     2. Log the error to the console with context.
 *     3. Show a Notice in Obsidian with the context and error message.
 *
 * - showNotice(message, duration):
 *     1. Show a Notice in Obsidian with the given message and optional duration.
 *
 * - showSuccess(message):
 *     1. Show a Notice in Obsidian with the message for 3 seconds.
 *
 * - showWarning(message):
 *     1. Show a Notice in Obsidian with a warning emoji and the message for 5 seconds.
 */

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
