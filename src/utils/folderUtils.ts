import { Vault, App, moment } from 'obsidian'

export const ROOT_FOLDER = '_Link'

export const BASE_FOLDERS = {
  JOURNAL: `${ROOT_FOLDER}/_Journal`,
  DOCUMENTS: `${ROOT_FOLDER}/Documents`,
  TEMPLATES: `${ROOT_FOLDER}/Templates`,
  WORKSPACE: `${ROOT_FOLDER}/_Workspace`,
  REFERENCES: `${ROOT_FOLDER}/_References`,
  ARCHIVE: `${ROOT_FOLDER}/Archive`
} as const

export const SUB_FOLDERS = {
  [BASE_FOLDERS.DOCUMENTS]: ['Images', 'Videos', 'Audio', 'Other'],
  [BASE_FOLDERS.REFERENCES]: [
    'Books/Technology',
    'Books/Business',
    'Articles/Blog-Posts',
    'Articles/Research',
    'Courses/Online',
    'Courses/Certifications'
  ],
  [BASE_FOLDERS.ARCHIVE]: [
    'Completed-Projects',
    'Old-References',
    'Old-Templates'
  ]
} as const

const DEFAULT_TEMPLATE_CONTENT = `---
previous: ''
next: ''
tags: []
resources: []
stakeholders: []
---

## Routine Checklist

- [ ] **Daily Checks**

  - [ ] Bed and Clothes 🛏️🧺
  - [ ] Self Care🛀🧴
  - [ ] Clean Kitchen 🍽✨
  - [ ] Pet Care 🐕🚶🏻‍♂️
  - [ ] Get Focused 🖥️💊

- [ ] **Technology Check**
  - [ ] Wear Watch ⌚️
  - [ ] Manage [Calendar](https://calendar.google.com) 📆
  - [ ] Check [Mail](https://mail.google.com) ✉️
  - [ ] Review [[December Log]] 🗓️
  - [ ] Review [[December List]] ✅

---

## Log

### To Do

- [ ]

### Stream

>

### Events

-

### Work

- ***

## Daily Planning Tips

1. **Set Clear Goals**: Identify three major tasks (🟩🟨🟥), prioritizing one high-impact task (🟥).
2. **Break Down Tasks**: Divide projects into manageable, specific steps.
3. **Use Focus Sessions**: 40 mins work + 10 mins review/break.
4. **Prioritize Early**: Start with critical tasks for peak productivity.
5. **End with Review**: Reflect on accomplishments; outline tomorrow's goals.
6. **Limit Distractions**: Turn off notifications; avoid multitasking.
7. **Organize Visually**: Use Obsidian as a "second brain" reference.
8. **Plan Extra Time**: Buffer for complex tasks to avoid rushing.
9. **Weekly Review**: Adjust goals based on progress and priorities.

### Tip

Incorporate one of these each day to build a strong, consistent planning habit.

---

## Challenges

`

async function ensureTemplateExists(vault: Vault): Promise<string> {
  const templatePath = `${BASE_FOLDERS.TEMPLATES}/Daily Note Template.md`
  try {
    const exists = await vault.adapter.exists(templatePath)
    if (!exists) {
      await vault.create(templatePath, DEFAULT_TEMPLATE_CONTENT)
      console.debug(`Created template file: ${templatePath}`)
    }
    return templatePath
  } catch (error) {
    console.error('Error ensuring template exists:', error)
    throw error
  }
}

export async function updateDailyNotesLocation(app: App): Promise<string> {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    const monthName = new Intl.DateTimeFormat('en-US', {
      month: 'short'
    }).format(now)

    const yearFolder = `${BASE_FOLDERS.JOURNAL}/y_${year}`
    const monthFolder = `${yearFolder}/m_${String(month).padStart(
      2,
      '0'
    )}_${monthName}`

    // Ensure the folders exist
    await createFolderIfNotExists(app.vault, yearFolder)
    await createFolderIfNotExists(app.vault, monthFolder)

    // Ensure template exists and get its path
    const templatePath = await ensureTemplateExists(app.vault)

    // Update Obsidian's core daily notes settings
    try {
      const dailyNotesSettings = await app.vault.adapter
        .read('.obsidian/daily-notes.json')
        .catch(() => '{}')
      const settings = JSON.parse(dailyNotesSettings)

      settings.folder = monthFolder
      settings.template = templatePath
      settings.format = 'YYYY-MM-DD dddd'

      await app.vault.adapter.write(
        '.obsidian/daily-notes.json',
        JSON.stringify(settings, null, 2)
      )

      // If the daily-notes plugin is enabled, update its settings
      const dailyNotesPlugin = (app as any).internalPlugins?.plugins[
        'daily-notes'
      ]
      if (dailyNotesPlugin?.enabled) {
        dailyNotesPlugin.instance.options = settings
      }
    } catch (error) {
      console.error('Error updating daily notes settings:', error)
      // Continue execution even if settings update fails
    }

    return monthFolder
  } catch (error) {
    console.error('Error updating daily notes location:', error)
    throw new Error('Failed to update daily notes location')
  }
}

export async function ensureFolderStructure(app: App): Promise<void> {
  try {
    // Create root folder first
    await createFolderIfNotExists(app.vault, ROOT_FOLDER)

    // Create base folders
    for (const folder of Object.values(BASE_FOLDERS)) {
      await createFolderIfNotExists(app.vault, folder)
    }

    // Create sub-folders
    for (const [baseFolder, subFolders] of Object.entries(SUB_FOLDERS)) {
      for (const subFolder of subFolders) {
        const fullPath = `${baseFolder}/${subFolder}`
        await createFolderIfNotExists(app.vault, fullPath)
      }
    }

    // Update daily notes location
    await updateDailyNotesLocation(app)
  } catch (error) {
    console.error('Error ensuring folder structure:', error)
    throw new Error('Failed to create folder structure')
  }
}

async function createFolderIfNotExists(
  vault: Vault,
  path: string
): Promise<void> {
  try {
    const exists = await vault.adapter.exists(path)
    if (!exists) {
      await vault.createFolder(path)
      console.debug(`Created folder: ${path}`)
    }
  } catch (error) {
    console.error(`Error creating folder ${path}:`, error)
    throw error
  }
}

export async function ensureFutureDailyNoteFolder(
  app: App,
  date: moment.Moment
): Promise<string> {
  try {
    const year = date.year()
    const month = date.month() + 1 // moment months are 0-based
    const monthName = date.format('MMM')

    const yearFolder = `${BASE_FOLDERS.JOURNAL}/y_${year}`
    const monthFolder = `${yearFolder}/m_${String(month).padStart(
      2,
      '0'
    )}_${monthName}`

    // Create folders if they don't exist
    await createFolderIfNotExists(app.vault, yearFolder)
    await createFolderIfNotExists(app.vault, monthFolder)

    return monthFolder
  } catch (error) {
    console.error('Error creating future daily note folder:', error)
    throw new Error('Failed to create future daily note folder')
  }
}

export async function createDailyNoteContent(
  app: App,
  noteName: string,
  date?: moment.Moment
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
    return `# ${noteName}\n\nCreated: ${moment().format(
      'YYYY-MM-DD HH:mm'
    )}\n\n`
  }
}
