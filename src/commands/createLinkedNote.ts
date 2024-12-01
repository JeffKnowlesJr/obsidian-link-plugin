/**
 * @file createLinkedNote.ts
 * @description Creates a new note and links to it from the current selection.
 */

import { Editor, Notice, TFile } from 'obsidian'
import { sanitizeFileName } from '../utils/fileUtils'
import { NewNoteModal } from '../modals/newNoteModal'
import type { LinkPlugin } from '../main'
import { LinkPluginError, ErrorCode, handleError } from '../utils/errorUtils'

export async function createLinkedNote(
  plugin: LinkPlugin,
  editor: Editor
): Promise<void> {
  try {
    console.debug('Creating linked note...')
    let noteName = editor.getSelection()

    if (!noteName) {
      noteName = await promptForNoteName(plugin)
      if (!noteName) {
        console.debug('Note creation cancelled')
        return
      }
    }

    // Validate note name
    if (!isValidNoteName(noteName)) {
      throw new LinkPluginError(
        'Invalid note name',
        ErrorCode.INVALID_NOTE_NAME,
        { noteName }
      )
    }

    const fileName = sanitizeFileName(noteName)
    const newNote = await createNote(plugin, fileName, noteName)

    if (newNote) {
      console.debug('Note created successfully:', newNote.path)
      insertNoteLink(editor, fileName)
      new Notice(`Created new note: ${fileName}`)
    }
  } catch (error) {
    const pluginError = handleError(error)
    console.error('Error creating linked note:', pluginError)
    new Notice(pluginError.message)
  }
}

async function promptForNoteName(plugin: LinkPlugin): Promise<string | null> {
  return new Promise((resolve) => {
    const modal = new NewNoteModal(plugin.app, (result) => {
      resolve(result)
    })
    modal.open()
  })
}

async function createNote(
  plugin: LinkPlugin,
  fileName: string,
  noteName: string
): Promise<TFile> {
  const fullPath = `${fileName}.md`

  // Check if note already exists
  const exists = await plugin.app.vault.adapter.exists(fullPath)
  if (exists) {
    throw new LinkPluginError(
      `Note "${fileName}" already exists`,
      ErrorCode.FILE_ALREADY_EXISTS,
      { path: fullPath }
    )
  }

  // Create the note with a simple header
  const content = `# ${noteName}\n\n`
  return await plugin.app.vault.create(fullPath, content)
}

function insertNoteLink(editor: Editor, fileName: string): void {
  editor.replaceSelection(`[[${fileName}]]`)
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
