import { TFile, Vault, MetadataCache, FrontMatterCache } from 'obsidian';
import { LinkPluginSettings } from '../types';
import { DirectoryManager } from './directoryManager';
import { ErrorHandler } from '../utils/errorHandler';

export interface FileMetadata {
    file: TFile;
    extension: string;
    size: number;
    createdDate: Date;
    modifiedDate: Date;
    frontmatter?: FrontMatterCache;
    tags: string[];
    category?: string;
    type?: string;
    priority?: number;
    folder?: string; // Custom target folder from frontmatter
}

export interface SortingRule {
    name: string;
    condition: (metadata: FileMetadata) => boolean;
    targetDirectory: string;
    priority: number;
    description: string;
}

export interface FileSortingConfig {
    enableAutoSorting: boolean;
    sortOnFileCreate: boolean;
    sortOnFileModify: boolean;
    excludeDirectories: string[];
    customRules: SortingRule[];
}

export class FileSortingManager {
    private vault: Vault;
    private metadataCache: MetadataCache;
    private settings: LinkPluginSettings;
    private directoryManager: DirectoryManager;
    private errorHandler: ErrorHandler;

    constructor(
        vault: Vault,
        metadataCache: MetadataCache,
        settings: LinkPluginSettings,
        directoryManager: DirectoryManager
    ) {
        this.vault = vault;
        this.metadataCache = metadataCache;
        this.settings = settings;
        this.directoryManager = directoryManager;
        this.errorHandler = new ErrorHandler(null as any); // Plugin reference will be set later
    }

    /**
     * Extract metadata from a file
     */
    async extractMetadata(file: TFile): Promise<FileMetadata> {
        const frontmatter = this.metadataCache.getFileCache(file)?.frontmatter;
        const tags = this.metadataCache.getFileCache(file)?.tags?.map(tag => tag.tag) || [];
        
        return {
            file,
            extension: file.extension.toLowerCase(),
            size: file.stat.size,
            createdDate: new Date(file.stat.ctime),
            modifiedDate: new Date(file.stat.mtime),
            frontmatter,
            tags,
            category: frontmatter?.category,
            type: frontmatter?.type,
            priority: frontmatter?.priority,
            folder: frontmatter?.folder // Custom target folder
        };
    }

    /**
     * Determine target directory for a file based on sorting rules
     */
    determineTargetDirectory(metadata: FileMetadata): string | null {
        // Get base directory from settings
        const baseDir = this.settings.baseFolder || 'LinkPlugin';
        
        // Only sort markdown files based on frontmatter metadata
        if (metadata.extension !== 'md') {
            return null; // No sorting for non-markdown files
        }

        // Check for custom folder metadata first (highest priority)
        if (metadata.folder) {
            // Support both relative and absolute paths
            if (metadata.folder.startsWith('/')) {
                // Absolute path from vault root
                return metadata.folder.substring(1); // Remove leading slash
            } else {
                // Relative to base directory
                return `${baseDir}/${metadata.folder}`;
            }
        }

        // Check custom rules second (high priority)
        for (const rule of this.getCustomRules()) {
            if (rule.condition(metadata)) {
                return `${baseDir}/${rule.targetDirectory}`;
            }
        }

        // Markdown file sorting based on frontmatter
        return this.getMarkdownTargetDirectory(metadata, baseDir);
    }

    /**
     * Determine target directory for markdown files based on frontmatter
     */
    private getMarkdownTargetDirectory(metadata: FileMetadata, baseDir: string): string | null {
        const { frontmatter } = metadata;
        
        if (!frontmatter) return null;

        // Check type field first
        if (frontmatter.type) {
            switch (frontmatter.type.toLowerCase()) {
                case 'journal':
                case 'daily':
                    return `${baseDir}/journal`;
                case 'project':
                case 'work':
                    return `${baseDir}/workspace`;
                case 'reference':
                case 'ref':
                case 'resource':
                    return `${baseDir}/reference`;
                case 'template':
                    return `${baseDir}/templates`;
                case 'meeting':
                    return `${baseDir}/workspace/meetings`;
                case 'inbox':
                case 'todo':
                    return `${baseDir}/inbox`;
                default:
                    // For any other type, create a folder with that name
                    return `${baseDir}/${frontmatter.type}`;
            }
        }

        // Check category field second
        if (frontmatter.category) {
            switch (frontmatter.category.toLowerCase()) {
                case 'journal':
                case 'daily':
                    return `${baseDir}/journal`;
                case 'project':
                case 'work':
                    return `${baseDir}/workspace`;
                case 'reference':
                case 'ref':
                case 'resource':
                    return `${baseDir}/reference`;
                case 'template':
                    return `${baseDir}/templates`;
                case 'meeting':
                    return `${baseDir}/workspace/meetings`;
                case 'inbox':
                case 'todo':
                    return `${baseDir}/inbox`;
                default:
                    // For any other category, create a folder with that name
                    return `${baseDir}/${frontmatter.category}`;
            }
        }

        // Check for specific tags
        if (metadata.tags.includes('#journal') || metadata.tags.includes('journal')) {
            return `${baseDir}/journal`;
        }
        if (metadata.tags.includes('#project') || metadata.tags.includes('project')) {
            return `${baseDir}/workspace`;
        }
        if (metadata.tags.includes('#reference') || metadata.tags.includes('reference')) {
            return `${baseDir}/reference`;
        }
        if (metadata.tags.includes('#meeting') || metadata.tags.includes('meeting')) {
            return `${baseDir}/workspace/meetings`;
        }
        if (metadata.tags.includes('#template') || metadata.tags.includes('template')) {
            return `${baseDir}/templates`;
        }
        if (metadata.tags.includes('#inbox') || metadata.tags.includes('inbox')) {
            return `${baseDir}/inbox`;
        }

        // Check for status field (common in task management)
        if (frontmatter.status) {
            switch (frontmatter.status.toLowerCase()) {
                case 'todo':
                case 'in-progress':
                case 'doing':
                    return `${baseDir}/workspace`;
                case 'done':
                case 'completed':
                    return `${baseDir}/archive`;
                case 'backlog':
                case 'someday':
                    return `${baseDir}/inbox`;
            }
        }

        return null; // No sorting rule applies
    }

    /**
     * Get custom sorting rules from settings
     */
    private getCustomRules(): SortingRule[] {
        // Built-in rules based on metadata patterns
        return [
            {
                name: 'High Priority Notes',
                condition: (metadata) => {
                    const priority = metadata.frontmatter?.priority || metadata.priority;
                    return priority !== undefined && priority >= 8;
                },
                targetDirectory: 'workspace/priority',
                priority: 100,
                description: 'Notes with priority 8 or higher'
            },
            {
                name: 'Meeting Notes',
                condition: (metadata) => 
                    metadata.frontmatter?.type === 'meeting' || 
                    metadata.tags.includes('#meeting') ||
                    metadata.tags.includes('meeting'),
                targetDirectory: 'workspace/meetings',
                priority: 90,
                description: 'Meeting notes and minutes'
            },
            {
                name: 'Daily Notes',
                condition: (metadata) => {
                    const fileName = metadata.file.basename;
                    return /^\d{4}-\d{2}-\d{2}/.test(fileName);
                },
                targetDirectory: 'journal',
                priority: 80,
                description: 'Daily notes with YYYY-MM-DD format'
            },
            {
                name: 'Archive Notes',
                condition: (metadata) => 
                    metadata.frontmatter?.archived === true ||
                    metadata.frontmatter?.status === 'archived' ||
                    metadata.tags.includes('#archived') ||
                    metadata.tags.includes('archived'),
                targetDirectory: 'archive',
                priority: 70,
                description: 'Archived notes'
            }
        ];
    }

    /**
     * Sort a single file
     */
    async sortFile(file: TFile, dryRun: boolean = false): Promise<{ moved: boolean; from: string; to: string; reason: string }> {
        try {
            const metadata = await this.extractMetadata(file);
            const targetDir = this.determineTargetDirectory(metadata);
            
            if (!targetDir) {
                return {
                    moved: false,
                    from: file.path,
                    to: file.path,
                    reason: 'No sorting rule applies (only markdown files with frontmatter are sorted)'
                };
            }

            // Check if file is already in target directory
            const currentDir = file.parent?.path || '';
            if (currentDir === targetDir) {
                return {
                    moved: false,
                    from: file.path,
                    to: file.path,
                    reason: 'Already in correct location'
                };
            }

            // Check if file should be excluded
            if (this.shouldExcludeFile(file)) {
                return {
                    moved: false,
                    from: file.path,
                    to: file.path,
                    reason: 'File excluded from sorting'
                };
            }

            if (dryRun) {
                return {
                    moved: true,
                    from: file.path,
                    to: `${targetDir}/${file.name}`,
                    reason: `Would be moved based on frontmatter: ${this.getReasonForMove(metadata)}`
                };
            }

            // Ensure target directory exists
            await this.directoryManager.getOrCreateDirectory(targetDir);

            // Move the file
            const newPath = `${targetDir}/${file.name}`;
            await this.vault.rename(file, newPath);

            return {
                moved: true,
                from: file.path,
                to: newPath,
                reason: `Moved based on frontmatter: ${this.getReasonForMove(metadata)}`
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.errorHandler.handleError(error, `Failed to sort file: ${file.path}`);
            return {
                moved: false,
                from: file.path,
                to: file.path,
                reason: `Error: ${errorMessage}`
            };
        }
    }

    /**
     * Get human-readable reason for why a file would be moved
     */
    private getReasonForMove(metadata: FileMetadata): string {
        if (metadata.folder) {
            return `folder: "${metadata.folder}"`;
        }
        if (metadata.frontmatter?.type) {
            return `type: "${metadata.frontmatter.type}"`;
        }
        if (metadata.frontmatter?.category) {
            return `category: "${metadata.frontmatter.category}"`;
        }
        if (metadata.frontmatter?.priority && metadata.frontmatter.priority >= 8) {
            return `high priority: ${metadata.frontmatter.priority}`;
        }
        if (metadata.tags.length > 0) {
            return `tags: ${metadata.tags.join(', ')}`;
        }
        return 'matching custom rule';
    }

    /**
     * Check if file should be excluded from sorting
     */
    private shouldExcludeFile(file: TFile): boolean {
        const filePath = file.path;
        
        // Don't sort files that are already in templates or system folders
        if (filePath.includes('/.obsidian/') || 
            filePath.startsWith('.obsidian/') ||
            filePath.includes('/templates/') ||
            filePath.startsWith('templates/') ||
            filePath.includes('/quarantine/') ||
            filePath.startsWith('quarantine/')) {
            return true;
        }

        return false;
    }

    /**
     * Bulk sort all files in vault
     */
    async bulkSort(dryRun: boolean = false): Promise<{
        processed: number;
        moved: number;
        skipped: number;
        errors: number;
        results: Array<{ moved: boolean; from: string; to: string; reason: string }>;
    }> {
        const results: Array<{ moved: boolean; from: string; to: string; reason: string }> = [];
        let processed = 0;
        let moved = 0;
        let skipped = 0;
        let errors = 0;

        const allFiles = this.vault.getMarkdownFiles(); // Only process markdown files

        for (const file of allFiles) {
            processed++;
            const result = await this.sortFile(file, dryRun);
            results.push(result);

            if (result.moved) {
                moved++;
            } else if (result.reason.startsWith('Error:')) {
                errors++;
            } else {
                skipped++;
            }
        }

        return {
            processed,
            moved,
            skipped,
            errors,
            results
        };
    }

    /**
     * Auto-sort a file when it's created or modified
     */
    async autoSort(file: TFile): Promise<void> {
        if (!this.settings.fileSorting?.enableAutoSorting) {
            return;
        }

        // Only auto-sort markdown files
        if (file.extension !== 'md') {
            return;
        }

        // Small delay to ensure metadata is available
        setTimeout(async () => {
            await this.sortFile(file);
        }, 500);
    }
} 