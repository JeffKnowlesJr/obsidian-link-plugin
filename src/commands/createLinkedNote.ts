import { Editor, Notice } from 'obsidian'
import { createMarkdownLink, createWikiLink } from '../utils/linkUtils'
import { sanitizeFileName } from '../utils/fileUtils'
import { NewNoteModal } from '../modals/newNoteModal'
import type { LinkPlugin } from '../main'

export async function createLinkedNote(
  plugin: LinkPlugin,
  editor: Editor
): Promise<void> {
  let noteName = editor.getSelection()
  if (!noteName) {
    noteName = await promptForNoteName(plugin)
    if (!noteName) return
  }

  const fileName = sanitizeFileName(noteName)
  try {
    await createNote(plugin, fileName, noteName)
    insertNoteLink(plugin, editor, fileName, noteName)
    new Notice(`Created new note: ${fileName}`)
  } catch (error) {
    new Notice(`Error creating note: ${error}`)
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
): Promise<void> {
  const exists = await plugin.app.vault.adapter.exists(`${fileName}.md`)
  if (exists) {
    throw new Error(`Note "${fileName}" already exists!`)
  }
  await plugin.app.vault.create(`${fileName}.md`, `# ${noteName}\n\n`)
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
