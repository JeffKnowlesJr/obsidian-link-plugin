import { Editor, MarkdownView, TFile, normalizePath } from 'obsidian';
import LinkPlugin from '../main';
import { LinkSuggestion } from '../types';
import { PathUtils } from '../utils/pathUtils';
import { REGEX_PATTERNS } from '../constants';

export class LinkManager {
  plugin: LinkPlugin;

  constructor(plugin: LinkPlugin) {
    this.plugin = plugin;
  }

  /**
   * Create a new note from selected text and link to it
   */
  async createLinkedNote(selection: string, editor: Editor, view: MarkdownView): Promise<void> {
    const { vault } = this.plugin.app;
    const currentFile = view.file;

    if (!currentFile) {
      throw new Error('No active file found');
    }

    // Generate a file path for the new note
    const fileName = this.sanitizeFileName(selection);
    const directoryPath = this.determineTargetDirectory(fileName);
    const filePath = normalizePath(`${directoryPath}/${fileName}.md`);

    // Check if file already exists
    let file = vault.getAbstractFileByPath(filePath) as TFile;

    // Create the file if it doesn't exist
    if (!file) {
      // Ensure the directory exists
      await this.plugin.directoryManager.getOrCreateDirectory(directoryPath);

      // Create content for the new note
      const content = this.generateNoteContent(selection, currentFile);

      // Create the file
      file = await vault.create(filePath, content);
    }

    // Replace the selected text with a link to the note
    editor.replaceSelection(`[[${fileName}]]`);

    // Open the note in a new pane if configured
    if (this.plugin.settings.openNewNote) {
      const leaf = this.plugin.app.workspace.splitActiveLeaf();
      await leaf.openFile(file);
    }
  }

  /**
   * Determine the appropriate directory for a new note
   */
  private determineTargetDirectory(title: string): string {
    const { documentDirectory } = this.plugin.settings;

    // Logic to categorize notes into different directories based on keywords
    const keywords = title.toLowerCase();

    if (keywords.includes('project') || keywords.includes('work')) {
      return 'Workspace';
    } else if (keywords.includes('reference') || keywords.includes('definition')) {
      return 'References';
    } else if (keywords.includes('template')) {
      return 'Templates';
    }

    return documentDirectory || 'Documents';
  }

  /**
   * Generate content for a new linked note
   */
  private generateNoteContent(title: string, sourceFile: TFile): string {
    const { noteTemplate } = this.plugin.settings;
    const currentDate = new Date().toISOString().split('T')[0];

    if (noteTemplate) {
      // Replace template variables
      return noteTemplate
        .replace(/{{title}}/g, title)
        .replace(/{{date}}/g, currentDate)
        .replace(/{{source}}/g, `[[${sourceFile.basename}]]`);
    }

    // Default template
    return `---
title: ${title}
created: ${currentDate}
source: [[${sourceFile.basename}]]
tags: []
---

# ${title}

`;
  }

  /**
   * Sanitize a string for use as a filename
   */
  private sanitizeFileName(input: string): string {
    return input
      .replace(REGEX_PATTERNS.INVALID_FILENAME_CHARS, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100); // Limit length
  }

  /**
   * Find all links in a file
   */
  async findLinksInFile(file: TFile): Promise<string[]> {
    const { vault } = this.plugin.app;
    const content = await vault.read(file);
    const links: string[] = [];

    let match;
    while ((match = REGEX_PATTERNS.WIKI_LINK.exec(content)) !== null) {
      links.push(match[1]);
    }

    return links;
  }

  /**
   * Find all backlinks to a file
   */
  async findBacklinks(file: TFile): Promise<TFile[]> {
    const { vault } = this.plugin.app;
    const files = vault.getMarkdownFiles();
    const backlinks: TFile[] = [];

    for (const potentialSource of files) {
      if (potentialSource.path === file.path) continue;

      const links = await this.findLinksInFile(potentialSource);
      if (links.includes(file.basename)) {
        backlinks.push(potentialSource);
      }
    }

    return backlinks;
  }

  /**
   * Find broken links in the vault
   */
  async findBrokenLinks(): Promise<{ file: TFile; brokenLinks: string[] }[]> {
    const { vault } = this.plugin.app;
    const files = vault.getMarkdownFiles();
    const brokenLinksData: { file: TFile; brokenLinks: string[] }[] = [];

    for (const file of files) {
      const links = await this.findLinksInFile(file);
      const brokenLinks: string[] = [];

      for (const link of links) {
        // Check if the linked file exists
        const linkedFile = vault.getAbstractFileByPath(`${link}.md`) ||
                          vault.getAbstractFileByPath(link);

        if (!linkedFile) {
          brokenLinks.push(link);
        }
      }

      if (brokenLinks.length > 0) {
        brokenLinksData.push({ file, brokenLinks });
      }
    }

    return brokenLinksData;
  }

  /**
   * Find orphaned notes (notes with no backlinks)
   */
  async findOrphanedNotes(): Promise<TFile[]> {
    const { vault } = this.plugin.app;
    const files = vault.getMarkdownFiles();
    const orphanedNotes: TFile[] = [];

    for (const file of files) {
      const backlinks = await this.findBacklinks(file);
      if (backlinks.length === 0) {
        orphanedNotes.push(file);
      }
    }

    return orphanedNotes;
  }

  /**
   * Generate link suggestions based on content similarity
   */
  async generateLinkSuggestions(file: TFile, limit: number = 5): Promise<LinkSuggestion[]> {
    const { vault } = this.plugin.app;
    const files = vault.getMarkdownFiles();
    const suggestions: LinkSuggestion[] = [];

    const currentContent = await vault.read(file);
    const currentWords = this.extractWords(currentContent);

    for (const otherFile of files) {
      if (otherFile.path === file.path) continue;

      const otherContent = await vault.read(otherFile);
      const otherWords = this.extractWords(otherContent);

      const relevance = this.calculateRelevance(currentWords, otherWords);

      if (relevance > 0.1) { // Threshold for relevance
        suggestions.push({
          title: otherFile.basename,
          path: otherFile.path,
          relevance,
          type: 'existing'
        });
      }
    }

    // Sort by relevance and return top suggestions
    return suggestions
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, limit);
  }

  /**
   * Extract meaningful words from content
   */
  private extractWords(content: string): Set<string> {
    const words = new Set<string>();
    const text = content
      .replace(/[#*`\[\]()]/g, '') // Remove markdown syntax
      .toLowerCase()
      .split(/\s+/);

    for (const word of text) {
      if (word.length > 3 && !this.isStopWord(word)) {
        words.add(word);
      }
    }

    return words;
  }

  /**
   * Calculate relevance between two sets of words
   */
  private calculateRelevance(words1: Set<string>, words2: Set<string>): number {
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size; // Jaccard similarity
  }

  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    return stopWords.has(word);
  }
}