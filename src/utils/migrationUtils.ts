import { App, TFile, TFolder } from 'obsidian'
import { LinkPluginSettings } from '../settings/settings'

// Define folder structure types
export enum FolderStructureType {
  LEGACY = 'legacy', // Structure with underscores (_Link, _Journal, etc.)
  HUGO_COMPATIBLE = 'hugo_compatible', // Structure without underscores for Hugo compatibility
  VAULT_ROOT = 'vault_root' // Structure directly in vault root
}

// Legacy root folder (with underscore)
export const LEGACY_ROOT = '_Link'

// Hugo-compatible root folder (no underscore)
export const HUGO_ROOT = 'Link'

// Vault root (no prefix folder)
export const VAULT_ROOT = ''

// Base folder mappings between the structures
export const FOLDER_MAPPINGS = {
  // Legacy → Hugo-compatible
  [`${LEGACY_ROOT}/_Journal`]: `${HUGO_ROOT}/Journal`,
  [`${LEGACY_ROOT}/_References`]: `${HUGO_ROOT}/References`,
  [`${LEGACY_ROOT}/_Workspace`]: `${HUGO_ROOT}/Workspace`,
  [`${LEGACY_ROOT}/Documents`]: `${HUGO_ROOT}/Documents`,
  [`${LEGACY_ROOT}/Templates`]: `${HUGO_ROOT}/Templates`,
  [`${LEGACY_ROOT}/Archive`]: `${HUGO_ROOT}/Archive`,

  // Hugo-compatible → Vault root
  [`${HUGO_ROOT}/Journal`]: `Journal`,
  [`${HUGO_ROOT}/References`]: `References`,
  [`${HUGO_ROOT}/Workspace`]: `Workspace`,
  [`${HUGO_ROOT}/Documents`]: `Documents`,
  [`${HUGO_ROOT}/Templates`]: `Templates`,
  [`${HUGO_ROOT}/Archive`]: `Archive`
}

// Reverse mappings for migrations back to Hugo structure if needed
export const REVERSE_FOLDER_MAPPINGS = {
  [`Journal`]: `${HUGO_ROOT}/Journal`,
  [`References`]: `${HUGO_ROOT}/References`,
  [`Workspace`]: `${HUGO_ROOT}/Workspace`,
  [`Documents`]: `${HUGO_ROOT}/Documents`,
  [`Templates`]: `${HUGO_ROOT}/Templates`,
  [`Archive`]: `${HUGO_ROOT}/Archive`
}

/**
 * Determines the current folder structure type being used
 */
export async function detectFolderStructureType(
  vault: any
): Promise<FolderStructureType> {
  // Check for each root type
  const legacyRootExists = await vault.adapter.exists(LEGACY_ROOT)
  const hugoRootExists = await vault.adapter.exists(HUGO_ROOT)

  // Check for folders in vault root
  const journalExists = await vault.adapter.exists('Journal')
  const templatesExists = await vault.adapter.exists('Templates')

  // If vault root folders exist, use vault root type
  if (journalExists || templatesExists) {
    return FolderStructureType.VAULT_ROOT
  }

  // If both legacy and hugo exist, determine which has more content
  if (legacyRootExists && hugoRootExists) {
    const legacyContents = await vault.adapter.list(LEGACY_ROOT)
    const hugoContents = await vault.adapter.list(HUGO_ROOT)

    const legacyFileCount = countFilesRecursively(legacyContents)
    const hugoFileCount = countFilesRecursively(hugoContents)

    return legacyFileCount > hugoFileCount
      ? FolderStructureType.LEGACY
      : FolderStructureType.HUGO_COMPATIBLE
  }

  // Otherwise return based on which exists
  if (legacyRootExists) return FolderStructureType.LEGACY
  if (hugoRootExists) return FolderStructureType.HUGO_COMPATIBLE

  // Default to vault root if nothing exists yet
  return FolderStructureType.VAULT_ROOT
}

/**
 * Helper to count files recursively in a folder listing
 */
function countFilesRecursively(listing: any): number {
  if (!listing || !listing.files) return 0

  let count = listing.files.length

  if (listing.folders) {
    for (const folder of listing.folders) {
      try {
        const folderListing = listing.folders[folder]
        count += countFilesRecursively(folderListing)
      } catch (error) {
        console.error(`Error counting files in ${folder}:`, error)
      }
    }
  }

  return count
}

/**
 * Migrates folder structure between legacy, Hugo-compatible, and vault root formats
 * @param app The Obsidian App instance
 * @param targetType The target folder structure type to migrate to
 * @param preserveFiles Whether to move files between structures (true) or create empty folders (false)
 * @param ensureArchive Whether to always maintain an Archive folder
 * @returns A log of migration operations performed
 */
export async function migrateFolderStructure(
  app: App,
  targetType: FolderStructureType,
  preserveFiles: boolean = true,
  ensureArchive: boolean = true
): Promise<string[]> {
  const migrationLog: string[] = []
  const vault = app.vault

  try {
    // Determine current structure type
    const currentType = await detectFolderStructureType(vault)

    // If already using the target type, log and return
    if (currentType === targetType) {
      migrationLog.push(`Already using ${targetType} folder structure`)

      // If ensuring archive, still check it exists
      if (ensureArchive) {
        await ensureArchiveFolder(app, targetType)
        migrationLog.push(
          `Verified Archive folder exists in ${targetType} structure`
        )
      }

      return migrationLog
    }

    // Otherwise, perform migration
    migrationLog.push(
      `Migrating from ${currentType} to ${targetType} folder structure`
    )

    // Create mappings based on the source and target types
    const sourceMappings = buildMappings(currentType, targetType)

    // Create target root folder if needed
    const targetRoot = getTargetRoot(targetType)
    if (targetRoot && !(await vault.adapter.exists(targetRoot))) {
      await vault.createFolder(targetRoot)
      migrationLog.push(`Created root folder: ${targetRoot}`)
    }

    // Process each folder mapping
    for (const [sourcePath, targetPath] of sourceMappings) {
      // Skip if source doesn't exist
      if (!(await vault.adapter.exists(sourcePath))) {
        migrationLog.push(`Source folder does not exist: ${sourcePath}`)
        continue
      }

      // Create target folder if it doesn't exist
      if (!(await vault.adapter.exists(targetPath))) {
        await vault.createFolder(targetPath)
        migrationLog.push(`Created target folder: ${targetPath}`)
      }

      if (preserveFiles) {
        // Migrate files from source to target
        await migrateFiles(app, sourcePath, targetPath, migrationLog)
      }
    }

    // Always ensure the archive folder exists
    if (ensureArchive) {
      await ensureArchiveFolder(app, targetType)
      migrationLog.push(
        `Ensured Archive folder exists in ${targetType} structure`
      )
    }

    migrationLog.push(`Migration completed successfully`)
    return migrationLog
  } catch (error) {
    migrationLog.push(`Error during migration: ${error.message}`)
    console.error('Error during folder structure migration:', error)
    throw error
  }
}

/**
 * Build the appropriate source and target path mappings based on the migration direction
 */
function buildMappings(
  currentType: FolderStructureType,
  targetType: FolderStructureType
): [string, string][] {
  // Determine source and target roots
  const sourceRoot = getSourceRoot(currentType)
  const targetRoot = getTargetRoot(targetType)

  // Create mappings based on source and target types
  if (
    currentType === FolderStructureType.VAULT_ROOT &&
    targetType === FolderStructureType.HUGO_COMPATIBLE
  ) {
    // Moving from vault root to Link folder
    return [
      ['Journal', `${HUGO_ROOT}/Journal`],
      ['Documents', `${HUGO_ROOT}/Documents`],
      ['Templates', `${HUGO_ROOT}/Templates`],
      ['Workspace', `${HUGO_ROOT}/Workspace`],
      ['References', `${HUGO_ROOT}/References`],
      ['Archive', `${HUGO_ROOT}/Archive`]
    ]
  } else if (
    currentType === FolderStructureType.VAULT_ROOT &&
    targetType === FolderStructureType.LEGACY
  ) {
    // Moving from vault root to _Link folder
    return [
      ['Journal', `${LEGACY_ROOT}/_Journal`],
      ['Documents', `${LEGACY_ROOT}/Documents`],
      ['Templates', `${LEGACY_ROOT}/Templates`],
      ['Workspace', `${LEGACY_ROOT}/_Workspace`],
      ['References', `${LEGACY_ROOT}/_References`],
      ['Archive', `${LEGACY_ROOT}/Archive`]
    ]
  } else if (
    currentType === FolderStructureType.HUGO_COMPATIBLE &&
    targetType === FolderStructureType.VAULT_ROOT
  ) {
    // Moving from Link folder to vault root
    return [
      [`${HUGO_ROOT}/Journal`, 'Journal'],
      [`${HUGO_ROOT}/Documents`, 'Documents'],
      [`${HUGO_ROOT}/Templates`, 'Templates'],
      [`${HUGO_ROOT}/Workspace`, 'Workspace'],
      [`${HUGO_ROOT}/References`, 'References'],
      [`${HUGO_ROOT}/Archive`, 'Archive']
    ]
  } else if (
    currentType === FolderStructureType.LEGACY &&
    targetType === FolderStructureType.VAULT_ROOT
  ) {
    // Moving from _Link folder to vault root
    return [
      [`${LEGACY_ROOT}/_Journal`, 'Journal'],
      [`${LEGACY_ROOT}/Documents`, 'Documents'],
      [`${LEGACY_ROOT}/Templates`, 'Templates'],
      [`${LEGACY_ROOT}/_Workspace`, 'Workspace'],
      [`${LEGACY_ROOT}/_References`, 'References'],
      [`${LEGACY_ROOT}/Archive`, 'Archive']
    ]
  } else if (
    currentType === FolderStructureType.LEGACY &&
    targetType === FolderStructureType.HUGO_COMPATIBLE
  ) {
    // Moving from _Link folder to Link folder
    return Object.entries(FOLDER_MAPPINGS).filter(([source]) =>
      source.startsWith(LEGACY_ROOT)
    )
  } else if (
    currentType === FolderStructureType.HUGO_COMPATIBLE &&
    targetType === FolderStructureType.LEGACY
  ) {
    // Moving from Link folder to _Link folder
    return Object.entries(REVERSE_FOLDER_MAPPINGS)
      .filter(([source]) => source.startsWith(HUGO_ROOT))
      .map(([source, target]) => [source, target])
  }

  // Fallback to empty array if no mapping found
  return []
}

/**
 * Get the root folder based on folder structure type
 */
function getTargetRoot(type: FolderStructureType): string {
  switch (type) {
    case FolderStructureType.LEGACY:
      return LEGACY_ROOT
    case FolderStructureType.HUGO_COMPATIBLE:
      return HUGO_ROOT
    case FolderStructureType.VAULT_ROOT:
      return ''
  }
}

/**
 * Get the source root folder based on folder structure type
 */
function getSourceRoot(type: FolderStructureType): string {
  switch (type) {
    case FolderStructureType.LEGACY:
      return LEGACY_ROOT
    case FolderStructureType.HUGO_COMPATIBLE:
      return HUGO_ROOT
    case FolderStructureType.VAULT_ROOT:
      return ''
  }
}

/**
 * Migrates files from source to target folder
 */
async function migrateFiles(
  app: App,
  sourcePath: string,
  targetPath: string,
  migrationLog: string[]
): Promise<void> {
  const vault = app.vault

  try {
    // Check if source exists
    if (!(await vault.adapter.exists(sourcePath))) {
      migrationLog.push(`Source path does not exist: ${sourcePath}`)
      return
    }

    // Get source folder listing
    const sourceListing = await vault.adapter.list(sourcePath)
    migrationLog.push(`Processing folder: ${sourcePath} → ${targetPath}`)

    // Process files
    if (sourceListing.files && sourceListing.files.length > 0) {
      migrationLog.push(`Found ${sourceListing.files.length} files to migrate`)

      for (const file of sourceListing.files) {
        try {
          const fileName = file.split('/').pop() || ''
          const targetFilePath = `${targetPath}/${fileName}`

          // Check if target file already exists
          if (await vault.adapter.exists(targetFilePath)) {
            migrationLog.push(
              `File already exists, skipping: ${targetFilePath}`
            )
            continue
          }

          // Copy file content from source to target
          const content = await vault.adapter.read(file)
          await vault.create(targetFilePath, content)

          // Delete original file after successful creation
          const originalFile = app.vault.getAbstractFileByPath(file)
          if (originalFile instanceof TFile) {
            await vault.delete(originalFile)
            migrationLog.push(`Moved file: ${file} → ${targetFilePath}`)
          } else {
            migrationLog.push(
              `Created copy (couldn't delete original): ${file} → ${targetFilePath}`
            )
          }
        } catch (fileError) {
          migrationLog.push(
            `Error processing file ${file}: ${fileError.message}`
          )
          console.error(`Error processing file ${file}:`, fileError)
          // Continue with other files
        }
      }
    } else {
      migrationLog.push(`No files found in ${sourcePath}`)
    }

    // Process subfolders recursively
    if (sourceListing.folders && sourceListing.folders.length > 0) {
      migrationLog.push(
        `Found ${sourceListing.folders.length} subfolders to process`
      )

      for (const subfolder of sourceListing.folders) {
        try {
          const subfolderName = subfolder.split('/').pop() || ''
          const targetSubfolderPath = `${targetPath}/${subfolderName}`

          // Create target subfolder
          if (!(await vault.adapter.exists(targetSubfolderPath))) {
            await vault.createFolder(targetSubfolderPath)
            migrationLog.push(`Created subfolder: ${targetSubfolderPath}`)
          }

          // Recursively migrate files in subfolder
          await migrateFiles(app, subfolder, targetSubfolderPath, migrationLog)

          // After migrating contents, try to delete the original subfolder if it's empty
          try {
            const checkFolder = await vault.adapter.list(subfolder)
            if (
              checkFolder.files.length === 0 &&
              checkFolder.folders.length === 0
            ) {
              const folderObj = app.vault.getAbstractFileByPath(subfolder)
              if (folderObj instanceof TFolder) {
                await vault.delete(folderObj)
                migrationLog.push(`Removed empty source folder: ${subfolder}`)
              }
            } else {
              migrationLog.push(
                `Source folder not empty, keeping: ${subfolder}`
              )
            }
          } catch (deleteError) {
            migrationLog.push(
              `Error checking/deleting folder ${subfolder}: ${deleteError.message}`
            )
          }
        } catch (subfolderError) {
          migrationLog.push(
            `Error processing subfolder ${subfolder}: ${subfolderError.message}`
          )
          console.error(
            `Error processing subfolder ${subfolder}:`,
            subfolderError
          )
          // Continue with other subfolders
        }
      }
    }

    // Try to delete the original root folder if empty and migration was successful
    if (sourcePath.includes(LEGACY_ROOT) || sourcePath.includes(HUGO_ROOT)) {
      try {
        const checkSourceFolder = await vault.adapter.list(sourcePath)
        if (
          checkSourceFolder.files.length === 0 &&
          checkSourceFolder.folders.length === 0
        ) {
          const sourceRootFolder = app.vault.getAbstractFileByPath(sourcePath)
          if (sourceRootFolder instanceof TFolder) {
            await vault.delete(sourceRootFolder)
            migrationLog.push(`Removed empty source root folder: ${sourcePath}`)
          }
        }
      } catch (rootDeleteError) {
        migrationLog.push(
          `Could not delete root folder ${sourcePath}: ${rootDeleteError.message}`
        )
      }
    }
  } catch (error) {
    migrationLog.push(
      `Error migrating files from ${sourcePath} to ${targetPath}: ${error.message}`
    )
    console.error(
      `Error migrating files from ${sourcePath} to ${targetPath}:`,
      error
    )
    throw error
  }
}

/**
 * Ensures that the Archive folder exists in the specified structure
 */
export async function ensureArchiveFolder(
  app: App,
  structureType: FolderStructureType
): Promise<void> {
  const vault = app.vault
  const rootFolder =
    structureType === FolderStructureType.LEGACY ? LEGACY_ROOT : HUGO_ROOT
  const archivePath = `${rootFolder}/Archive`

  try {
    // Create root folder if it doesn't exist
    if (!(await vault.adapter.exists(rootFolder))) {
      await vault.createFolder(rootFolder)
    }

    // Create Archive folder if it doesn't exist
    if (!(await vault.adapter.exists(archivePath))) {
      await vault.createFolder(archivePath)
    }

    // Create standard Archive subfolders if they don't exist
    const archiveSubfolders = [
      'Completed-Projects',
      'Old-References',
      'Old-Templates'
    ]

    for (const subfolder of archiveSubfolders) {
      const subfolderPath = `${archivePath}/${subfolder}`
      if (!(await vault.adapter.exists(subfolderPath))) {
        await vault.createFolder(subfolderPath)
      }
    }
  } catch (error) {
    console.error(`Error ensuring Archive folder exists:`, error)
    throw error
  }
}
