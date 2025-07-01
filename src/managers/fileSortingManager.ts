import { TFile, TFolder, Vault, MetadataCache, FrontMatterCache } from 'obsidian';
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

    // File type mappings for media files
    private readonly FILE_TYPE_MAPPINGS = {
        images: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp', '.ico'],
        videos: ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'],
        pdfs: ['.pdf'],
        audio: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.wma', '.m4a'],
        docs: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.rtf', '.odt']
    };

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
        this.errorHandler = new ErrorHandler(null as any); // Will be set later
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
            priority: frontmatter?.priority
        };
    }

    /**
     * Determine target directory for a file based on sorting rules
     */
    determineTargetDirectory(metadata: FileMetadata): string | null {
        // Get base directory from settings
        const baseDir = this.settings.baseFolder || 'LinkPlugin';
        
        // Check custom rules first (highest priority)
        for (const rule of this.getCustomRules()) {
            if (rule.condition(metadata)) {
                return `${baseDir}/${rule.targetDirectory}`;
            }
        }

        // File type based sorting
        const fileTypeDir = this.getFileTypeDirectory(metadata.extension);
        if (fileTypeDir) {
            return `${baseDir}/reference/files/${fileTypeDir}`;
        }

        // Markdown file sorting based on frontmatter
        if (metadata.extension === 'md') {
            return this.getMarkdownTargetDirectory(metadata, baseDir);
        }

        return null; // No sorting rule applies
    }

    /**
     * Get target directory for file types
     */
    private getFileTypeDirectory(extension: string): string | null {
        for (const [category, extensions] of Object.entries(this.FILE_TYPE_MAPPINGS)) {
            if (extensions.includes(`.${extension}`)) {
                return category;
            }
        }
        return extension === 'md' ? null : 'other';
    }

    /**
     * Determine target directory for markdown files based on frontmatter
     */
    private getMarkdownTargetDirectory(metadata: FileMetadata, baseDir: string): string | null {
        const { frontmatter, file } = metadata;
        
        if (!frontmatter) return null;

        // Journal entries
        if (frontmatter.type === 'journal' || frontmatter.category === 'journal') {
            return `${baseDir}/journal`;
        }

        // Project notes
        if (frontmatter.type === 'project' || frontmatter.category === 'project') {
            return `${baseDir}/workspace`;
        }

        // Reference notes
        if (frontmatter.type === 'reference' || frontmatter.category === 'reference') {
            return `${baseDir}/reference`;
        }

        // Template files
        if (frontmatter.type === 'template' || frontmatter.category === 'template') {
            return `${baseDir}/templates`;
        }

        // Check for specific tags
        if (metadata.tags.includes('#journal')) {
            return `${baseDir}/journal`;
        }
        if (metadata.tags.includes('#project')) {
            return `${baseDir}/workspace`;
        }
        if (metadata.tags.includes('#reference')) {
            return `${baseDir}/reference`;
        }

        return null;
    }

    /**
     * Get custom sorting rules from settings
     */
    private getCustomRules(): SortingRule[] {
        // For now, return built-in rules. Later can be extended with user-defined rules
        return [
            {
                name: 'High Priority Notes',
                condition: (metadata) => metadata.priority !== undefined && metadata.priority >= 8,
                targetDirectory: 'workspace/priority',
                priority: 100,
                description: 'Notes with priority 8 or higher'
            },
            {
                name: 'Meeting Notes',
                condition: (metadata) => 
                    metadata.frontmatter?.type === 'meeting' || 
                    metadata.tags.includes('#meeting'),
                targetDirectory: 'workspace/meetings',
                priority: 90,
                description: 'Meeting notes and minutes'
            },
            {
                name: 'Daily Notes',
                condition: (metadata) => {
                    const fileName = metadata.file.basename;
                    return /^\d{4}-\d{2}-\d{2}$/.test(fileName);
                },
                targetDirectory: 'journal',
                priority: 80,
                description: 'Daily notes with YYYY-MM-DD format'
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
                    reason: 'No sorting rule applies'
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
                    reason: 'Would be moved (dry run)'
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
                reason: 'Moved successfully'
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
     * Check if file should be excluded from sorting
     */
    private shouldExcludeFile(file: TFile): boolean {
        const excludePatterns = [
            '.obsidian',
            '.git',
            '.gitignore',
            'node_modules',
            'quarantine'
        ];

        const filePath = file.path.toLowerCase();
        return excludePatterns.some(pattern => filePath.includes(pattern.toLowerCase()));
    }

    /**
     * Bulk sort all files in the vault
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

        const allFiles = this.vault.getFiles();
        
        for (const file of allFiles) {
            if (this.shouldExcludeFile(file)) {
                skipped++;
                continue;
            }

            const result = await this.sortFile(file, dryRun);
            results.push(result);
            processed++;

            if (result.moved && !dryRun) {
                moved++;
            } else if (result.reason.startsWith('Error:')) {
                errors++;
            } else {
                skipped++;
            }
        }

        return { processed, moved, skipped, errors, results };
    }

    /**
     * Sort file on creation/modification if auto-sort is enabled
     */
    async autoSort(file: TFile): Promise<void> {
        if (!this.settings.fileSorting?.enableAutoSorting) {
            return;
        }
        
        // Small delay to ensure metadata is loaded
        setTimeout(async () => {
            await this.sortFile(file);
        }, 100);
    }
} 