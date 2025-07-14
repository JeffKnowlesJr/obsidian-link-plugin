/**
 * Debug utility for conditional logging
 * Only logs when debug mode is enabled in settings
 */
export class DebugUtils {
  private static plugin: any = null;

  static initialize(plugin: any): void {
    this.plugin = plugin;
  }

  static log(message: string, ...args: any[]): void {
    if (this.isDebugEnabled()) {
      console.log(`[Link Plugin] ${message}`, ...args);
    }
  }
  
  static error(message: string, error?: any): void {
    console.error(`[Link Plugin] ${message}`, error);
  }

  private static isDebugEnabled(): boolean {
    return this.plugin?.settings?.debugMode === true;
  }
} 