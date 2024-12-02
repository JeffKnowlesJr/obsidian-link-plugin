/**
 * @file createLinkedNote.ts
 * @description Creates a new note and links to it from the current selection.
 */

import { Editor, Notice, TFile, App } from 'obsidian'
import { sanitizeFileName } from '../utils/fileUtils'
import { NewNoteModal } from '../modals/newNoteModal'
import {
  handlePluginError,
  LinkPluginError,
  ErrorCode
} from '../utils/errorHandler'

export interface LinkPlugin {
  app: App
}

export async function createLinkedNote(
  plugin: LinkPlugin,
  editor: Editor
): Promise<void> {
  try {
    const noteName = await getNoteName(editor, plugin)
    if (!noteName) {
      return
    }

    const fileName = await validateAndSanitizeFileName(noteName)
    const newNote = await createNoteFile(plugin, fileName, noteName)
    await insertNoteLinkInEditor(editor, fileName)

    new Notice(`Created new note: ${fileName}`)
  } catch (error) {
    handlePluginError(error, 'Failed to create linked note')
  }
}

async function getNoteName(
  editor: Editor,
  plugin: LinkPlugin
): Promise<string | null> {
  const selection = editor.getSelection()
  if (selection) {
    return selection
  }

  return new Promise((resolve) => {
    const modal = new NewNoteModal(plugin.app, (result) => {
      resolve(result)
    })
    modal.open()
  })
}

async function validateAndSanitizeFileName(name: string): Promise<string> {
  if (!isValidNoteName(name)) {
    throw new LinkPluginError('Invalid note name', ErrorCode.INVALID_NOTE_NAME)
  }
  return sanitizeFileName(name)
}

async function createNoteFile(
  plugin: LinkPlugin,
  fileName: string,
  noteName: string
): Promise<TFile> {
  const fullPath = `${fileName}.md`

  try {
    const exists = await plugin.app.vault.adapter.exists(fullPath)
    if (exists) {
      throw new LinkPluginError(
        `Note "${fileName}" already exists`,
        ErrorCode.FILE_ALREADY_EXISTS
      )
    }

    const content = `# ${noteName}\n\n`
    return await plugin.app.vault.create(fullPath, content)
  } catch (error) {
    if (error instanceof LinkPluginError) {
      throw error
    }
    throw new LinkPluginError(
      'Failed to create note file',
      ErrorCode.FILE_OPERATION_FAILED,
      error instanceof Error ? error : undefined
    )
  }
}

async function insertNoteLinkInEditor(
  editor: Editor,
  fileName: string
): Promise<void> {
  try {
    editor.replaceSelection(`[[${fileName}]]`)
  } catch (error) {
    throw new LinkPluginError(
      'Failed to insert note link',
      ErrorCode.LINK_INSERTION_FAILED,
      error instanceof Error ? error : undefined
    )
  }
}

function isValidNoteName(name: string): boolean {
  return Boolean(
    name &&
      name.length > 0 &&
      name.length <= 255 &&
      !name.includes('/') &&
      !name.includes('\\')
  )
}
