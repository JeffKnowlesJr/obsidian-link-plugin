import { Vault } from 'obsidian'

export function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
}

export async function createNote(
  vault: Vault,
  fileName: string,
  content: string
): Promise<void> {
  const exists = await vault.adapter.exists(`${fileName}.md`)
  if (exists) {
    throw new Error(`Note "${fileName}" already exists!`)
  }
  await vault.create(`${fileName}.md`, content)
}
