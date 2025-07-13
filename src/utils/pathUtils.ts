
/**
 * Algorithms for PathUtils:
 *
 * - sanitizePath(path):
 *     1. Remove invalid path characters (\/:*?"<>|) from the input string.
 *     2. Trim whitespace from the resulting string.
 *     3. Normalize the path using Obsidian's normalizePath.
 *     4. Return the sanitized, normalized path.
 *
 * - joinPath(...segments):
 *     1. Filter out any falsy (empty) segments from the input.
 *     2. Join the remaining segments with '/' as the separator.
 *     3. Normalize the resulting path using Obsidian's normalizePath.
 *     4. Return the joined, normalized path.
 */

import { normalizePath } from 'obsidian';

export class PathUtils {
  static sanitizePath(path: string): string {
    return normalizePath(path.replace(/[\/:*?"<>|]/g, '').trim());
  }

  static joinPath(...segments: string[]): string {
    return normalizePath(segments.filter(Boolean).join('/'));
  }
}
