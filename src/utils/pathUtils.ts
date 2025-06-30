
import { normalizePath } from 'obsidian';

export class PathUtils {
  static sanitizePath(path: string): string {
    return normalizePath(path.replace(/[\/:*?"<>|]/g, '').trim());
  }

  static joinPath(...segments: string[]): string {
    return normalizePath(segments.filter(Boolean).join('/'));
  }
}
