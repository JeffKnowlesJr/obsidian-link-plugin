import { App, TFile, TFolder } from 'obsidian'
import { LinkPluginSettings } from '../settings/settings'

// Define folder structure types
export enum FolderStructureType {
  LEGACY = 'legacy', // Structure with underscores (_Link, _Journal, etc.)
  HUGO_COMPATIBLE = 'hugo_compatible' // Structure without underscores for Hugo compatibility
}

// Legacy root folder (with underscore)
export const LEGACY_ROOT = '_Link'

// Hugo-compatible root folder (no underscore)
export const HUGO_ROOT = 'Link'

// Base folder mappings between the two structures
export const FOLDER_MAPPINGS = {
  // Legacy → Hugo-compatible
  [`${LEGACY_ROOT}/_Journal`]: `${HUGO_ROOT}/Journal`,
  [`${LEGACY_ROOT}/_References`]: `${HUGO_ROOT}/References`,
  [`${LEGACY_ROOT}/_Workspace`]: `${HUGO_ROOT}/Workspace`,
  [`${LEGACY_ROOT}/Documents`]: `${HUGO_ROOT}/Documents`,
  [`${LEGACY_ROOT}/Templates`]: `${HUGO_ROOT}/Templates`,
  [`${LEGACY_ROOT}/Archive`]: `${HUGO_ROOT}/Archive`,

  // Additional mappings for reverse direction (needed for proper bidirectional mapping)
  [`${HUGO_ROOT}/Journal`]: `${LEGACY_ROOT}/_Journal`,
  [`${HUGO_ROOT}/References`]: `${LEGACY_ROOT}/_References`,
  [`${HUGO_ROOT}/Workspace`]: `${LEGACY_ROOT}/_Workspace`,
  [`${HUGO_ROOT}/Documents`]: `${LEGACY_ROOT}/Documents`,
  [`${HUGO_ROOT}/Templates`]: `${LEGACY_ROOT}/Templates`
  // Archive mapping for Hugo→Legacy is already included above
}

/**
 * Determines the current folder structure type being used
 */
export async function detectFolderStructureType(
  vault: any
): Promise<FolderStructureType> {
  // Check if legacy root exists
  const legacyRootExists = await vault.adapter.exists(LEGACY_ROOT)

  // Check if hugo-compatible root exists
  const hugoRootExists = await vault.adapter.exists(HUGO_ROOT)

  // If both exist, determine which has more content
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
  return legacyRootExists
    ? FolderStructureType.LEGACY
    : FolderStructureType.HUGO_COMPATIBLE
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
 * Migrates folder structure between legacy and Hugo-compatible formats
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

    // Create source and target mappings based on direction
    const sourceMappings = Object.entries(FOLDER_MAPPINGS).filter(
      ([source, target]) =>
        (currentType === FolderStructureType.LEGACY &&
          source.startsWith(LEGACY_ROOT)) ||
        (currentType === FolderStructureType.HUGO_COMPATIBLE &&
          source.startsWith(HUGO_ROOT))
    )

    // Create root folder
    const targetRoot =
      targetType === FolderStructureType.LEGACY ? LEGACY_ROOT : HUGO_ROOT
    if (!(await vault.adapter.exists(targetRoot))) {
      await vault.createFolder(targetRoot)
      migrationLog.push(`Created root folder: ${targetRoot}`)
    }

    // Process each folder mapping
    for (const [sourcePath, targetPath] of sourceMappings) {
      const mappedSource =
        currentType === FolderStructureType.LEGACY ? sourcePath : targetPath
      const mappedTarget =
        currentType === FolderStructureType.LEGACY ? targetPath : sourcePath

      // Skip if source doesn't exist
      if (!(await vault.adapter.exists(mappedSource))) {
        migrationLog.push(`Source folder does not exist: ${mappedSource}`)
        continue
      }

      // Create target folder if it doesn't exist
      if (!(await vault.adapter.exists(mappedTarget))) {
        await vault.createFolder(mappedTarget)
        migrationLog.push(`Created target folder: ${mappedTarget}`)
      }

      if (preserveFiles) {
        // Migrate files from source to target
        await migrateFiles(app, mappedSource, mappedTarget, migrationLog)
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
    // Get source folder listing
    const sourceListing = await vault.adapter.list(sourcePath)

    // Process files
    if (sourceListing.files && sourceListing.files.length > 0) {
      for (const file of sourceListing.files) {
        const fileName = file.split('/').pop()
        const targetFilePath = `${targetPath}/${fileName}`

        // Check if target file already exists
        if (await vault.adapter.exists(targetFilePath)) {
          migrationLog.push(`File already exists, skipping: ${targetFilePath}`)
          continue
        }

        // Copy file content from source to target
        const content = await vault.adapter.read(file)
        await vault.create(targetFilePath, content)
        migrationLog.push(`Migrated file: ${file} → ${targetFilePath}`)
      }
    }

    // Process subfolders recursively
    if (sourceListing.folders) {
      for (const subfolder of sourceListing.folders) {
        const sourceSubfolderPath = subfolder
        const subfolderName = subfolder.split('/').pop()
        const targetSubfolderPath = `${targetPath}/${subfolderName}`

        // Create target subfolder
        if (!(await vault.adapter.exists(targetSubfolderPath))) {
          await vault.createFolder(targetSubfolderPath)
          migrationLog.push(`Created subfolder: ${targetSubfolderPath}`)
        }

        // Recursively migrate files in subfolder
        await migrateFiles(
          app,
          sourceSubfolderPath,
          targetSubfolderPath,
          migrationLog
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
