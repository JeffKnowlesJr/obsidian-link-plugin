/**
 * @file createLinkedNote.ts
 * @description Creates a new note and links to it from the current selection.
 */

import { Editor, Notice, TFile, App } from 'obsidian'
import type { Moment } from 'moment'
import { sanitizeFileName } from '../utils/fileUtils'
import { NewNoteModal } from '../modals/newNoteModal'
import {
  handlePluginError,
  LinkPluginError,
  ErrorCode
} from '../utils/errorHandler'
import {
  ROOT_FOLDER,
  ensureFutureDailyNoteFolder,
  BASE_FOLDERS
} from '../utils/folderUtils'
import LinkPlugin from '../main'
import {
  subtractDay,
  addDay,
  formatTime,
  getCurrentMoment
} from '../utils/momentHelper'

interface NoteCreationResult {
  name: string
  folder: string
  isFutureDaily?: boolean
  date?: Moment
}

export interface LinkPlugin {
  app: App
}

export async function createLinkedNote(plugin: LinkPlugin, editor: Editor) {
  try {
    // Get selected text
    const selectedText = editor.getSelection()
    if (!selectedText) {
      console.debug('No text selected')
      return
    }

    // Get current date
    const date = getCurrentMoment()
    const prevDate = subtractDay(date)
    const nextDate = addDay(date)

    // Create note content
    const content = `---
title: ${selectedText}
created: ${formatTime()}
prev: '[[${prevDate.format('YYYY-MM-DD')}]]'
next: '[[${nextDate.format('YYYY-MM-DD')}]]'
---

# ${selectedText}

## Notes

## References

## Tasks
- [ ] First task

## Related
- [[${prevDate.format('YYYY-MM-DD')}]]
- [[${nextDate.format('YYYY-MM-DD')}]]
`

    // Create the note
    const file = await plugin.app.vault.create(`${selectedText}.md`, content)

    // Open the new note
    await plugin.app.workspace.getLeaf(false).openFile(file)
  } catch (error) {
    console.error('Error creating linked note:', error)
  }
}

async function getNoteName(
  editor: Editor,
  plugin: LinkPlugin
): Promise<NoteCreationResult | null> {
  const selection = editor.getSelection()

  return new Promise((resolve) => {
    const modal = new NewNoteModal(plugin.app, (result) => {
      if (result) {
        resolve(result)
      } else {
        resolve(null)
      }
    })
    modal.open()

    // If there's a selection, pre-fill the note name
    if (selection) {
      // @ts-ignore - We know the modal has this property
      modal.inputEl.value = selection
      // @ts-ignore - We know the modal has this property
      modal.result.name = selection
    }
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
  fullPath: string,
  noteName: string,
  options: NoteCreationResult
): Promise<TFile> {
  try {
    const exists = await plugin.app.vault.adapter.exists(`${fullPath}.md`)
    if (exists) {
      throw new LinkPluginError(
        `Note "${fullPath}" already exists`,
        ErrorCode.FILE_ALREADY_EXISTS
      )
    }

    let content: string
    if (options.isFutureDaily) {
      content = await createDailyNoteContent(plugin.app, noteName, options.date)
    } else {
      content = `# ${noteName}\n\n`
    }

    return await plugin.app.vault.create(`${fullPath}.md`, content)
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

async function createDailyNoteContent(
  app: App,
  noteName: string,
  date?: Moment
): Promise<string> {
  try {
    // Try to get the template content
    const templatePath = `${BASE_FOLDERS.TEMPLATES}/Daily Note Template.md`
    let templateContent = await app.vault.adapter.read(templatePath)

    if (date) {
      // Create previous and next dates
      const prevDate = moment(date).subtract(1, 'day')
      const nextDate = moment(date).add(1, 'day')

      // Format the dates for links
      const prevLink = `${prevDate.format('YYYY-MM-DD')} ${prevDate.format(
        'dddd'
      )}`
      const nextLink = `${nextDate.format('YYYY-MM-DD')} ${nextDate.format(
        'dddd'
      )}`

      // Replace template variables
      templateContent = templateContent
        .replace(/previous: ''/g, `previous: '[[${prevLink}]]'`)
        .replace(/next: ''/g, `next: '[[${nextLink}]]'`)
        .replace(/{{date:YYYY-MM-DD}}/g, date.format('YYYY-MM-DD'))
        .replace(/{{time:HH:mm}}/g, moment().format('HH:mm'))
        .replace(
          /{{date:dddd, MMMM D, YYYY}}/g,
          date.format('dddd, MMMM D, YYYY')
        )

      // Update the month log and list references
      const monthName = date.format('MMMM')
      templateContent = templateContent
        .replace(/\[\[December Log\]\]/g, `[[${monthName} Log]]`)
        .replace(/\[\[December List\]\]/g, `[[${monthName} List]]`)
    }

    return templateContent
  } catch (error) {
    console.error('Error reading template:', error)
    // Fallback to basic content if template can't be read
    return `# ${noteName}\n\nCreated: ${moment
      .moment()
      .format('YYYY-MM-DD HH:mm')}\n\n`
  }
}

async function insertNoteLinkInEditor(
  editor: Editor,
  fullPath: string
): Promise<void> {
  try {
    // Extract the filename without extension for the display text
    const displayName =
      fullPath.split('/').pop()?.replace('.md', '') || fullPath
    editor.replaceSelection(`[[${fullPath}|${displayName}]]`)
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
