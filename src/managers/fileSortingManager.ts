/**
 * File Sorting Manager - STUB/PLACEHOLDER
 * 
 * The actual file sorting functionality has been moved to quarantine/ to focus
 * on the core journal management features. This stub maintains compatibility
 * with existing code while disabling the sorting features.
 * 
 * Status: Quarantined - functionality disabled
 * Original location: quarantine/fileSortingManager.ts
 */

import { TFile } from 'obsidian';

export class FileSortingManager {
    constructor(vault: any, metadataCache: any, settings: any, directoryManager: any, errorHandler?: any) {
        // Stub constructor - no actual initialization
        console.log('FileSortingManager: File sorting functionality has been quarantined - focusing on core journal features');
    }

    /**
     * STUB: Auto-sort functionality disabled
     */
    async autoSort(file: TFile): Promise<void> {
        // No-op - file sorting has been disabled
        return;
    }

    /**
     * STUB: Bulk sort functionality disabled  
     */
    async bulkSort(dryRun: boolean = false): Promise<{
        processed: number;
        moved: number;
        skipped: number;
        errors: number;
        results: Array<{ moved: boolean; from: string; to: string; reason: string }>;
    }> {
        // Return empty results - file sorting disabled
        return {
            processed: 0,
            moved: 0,
            skipped: 0,
            errors: 0,
            results: []
        };
    }
} 