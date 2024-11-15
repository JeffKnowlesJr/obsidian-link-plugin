import { Editor, Notice, TFile } from 'obsidian'
import { createMarkdownLink, createWikiLink } from '../utils/linkUtils'
import { sanitizeFileName } from '../utils/fileUtils'
import { NewNoteModal } from '../modals/newNoteModal'
import type { LinkPlugin } from '../main'
import {
  LinkPluginError,
  ErrorCode,
  handleError,
  getUserFriendlyMessage
} from '../utils/errorUtils'

interface NoteType {
  type: 'daily' | 'project' | 'resource' | 'archive'
  template: string
  folder: string
  tags: string[]
}

const NOTE_TYPES: Record<string, NoteType> = {
  daily: {
    type: 'daily',
    template: 'DailyNoteTemplate',
    folder: 'DailyNotes',
    tags: ['daily', 'journal']
  },
  project: {
    type: 'project',
    template: 'ProjectTemplate',
    folder: 'Projects',
    tags: ['project', 'active']
  },
  resource: {
    type: 'resource',
    template: 'ResourceTemplate',
    folder: 'Resources',
    tags: ['resource', 'reference']
  }
}

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

    const noteType = await determineNoteType(plugin, noteName)
    const fileName = sanitizeFileName(noteName)

    const newNote = await createNote(plugin, fileName, noteName, noteType)

    if (newNote) {
      console.debug('Note created successfully:', newNote.path)
      insertNoteLink(plugin, editor, fileName, noteName)
      new Notice(`Created new note: ${fileName}`)
    }
  } catch (error) {
    const pluginError = handleError(error)
    console.error('Error creating linked note:', pluginError)
    new Notice(getUserFriendlyMessage(pluginError))
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

async function determineNoteType(
  plugin: LinkPlugin,
  noteName: string
): Promise<NoteType> {
  // TODO: Add logic to determine note type based on name or user selection
  // For now, default to project type
  return NOTE_TYPES.project
}

async function createNote(
  plugin: LinkPlugin,
  fileName: string,
  noteName: string,
  noteType: NoteType
): Promise<TFile> {
  try {
    // Check if folder exists, create if it doesn't
    const folderPath = noteType.folder
    if (!(await plugin.app.vault.adapter.exists(folderPath))) {
      try {
        await plugin.app.vault.createFolder(folderPath)
      } catch (error) {
        throw new LinkPluginError(
          `Failed to create folder: ${folderPath}`,
          ErrorCode.FOLDER_CREATION_FAILED,
          error
        )
      }
    }

    // Check if note already exists
    const fullPath = `${folderPath}/${fileName}.md`
    const exists = await plugin.app.vault.adapter.exists(fullPath)
    if (exists) {
      throw new LinkPluginError(
        `Note "${fileName}" already exists`,
        ErrorCode.FILE_ALREADY_EXISTS,
        { path: fullPath }
      )
    }

    // Get and validate template content
    const content = await getTemplateContent(plugin, noteType, noteName)

    // Create the note
    return await plugin.app.vault.create(fullPath, content)
  } catch (error) {
    throw handleError(error)
  }
}

async function getTemplateContent(
  plugin: LinkPlugin,
  noteType: NoteType,
  noteName: string
): Promise<string> {
  try {
    const templatePath = `Templates/${noteType.template}.md`
    const templateFile = plugin.app.vault.getAbstractFileByPath(templatePath)

    if (templateFile instanceof TFile) {
      const content = await plugin.app.vault.read(templateFile)
      return processTemplate(content, noteName, noteType)
    }

    console.debug('Template not found, using default')
    return getDefaultTemplate(noteName, noteType)
  } catch (error) {
    console.warn('Error loading template:', error)
    return getDefaultTemplate(noteName, noteType)
  }
}

function getDefaultTemplate(noteName: string, noteType: NoteType): string {
  // Implement logic to generate default template content based on note type
  // For now, return a simple template
  return `# ${noteName}\n\n`
}

function insertNoteLink(
  plugin: LinkPlugin,
  editor: Editor,
  fileName: string,
  noteName: string
): void {
  const linkText =
    plugin.settings.defaultLinkStyle === 'wiki'
      ? createWikiLink(fileName)
      : createMarkdownLink(fileName, noteName)
  editor.replaceSelection(linkText)
}

function isValidNoteName(name: string): boolean {
  // Add validation rules for note names
  return Boolean(
    name && name.length > 0 && name.length <= 255 && !name.includes('/') // Add other invalid characters as needed
  )
}
