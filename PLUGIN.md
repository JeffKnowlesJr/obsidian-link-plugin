# Link Plugin for Obsidian

## Features

### Automatic Folder Structure

The plugin automatically maintains a structured folder hierarchy:

```
/_Link
  /_Journal
    /y_2024
      /m_12_Dec
        /2024-12-02 Monday.md
        /2024-12-03 Tuesday.md
        ...
    /y_2025
  /Documents
    /Images
    /Videos
    /Audio
    /Other
  /Templates
    /Daily Note Template.md
    /Weekly Review Template.md
    /Project Plan Template.md
    ...
  /_Workspace
    /Client-X
      /Project-Alpha
        /SRS.md
        /Requirements.md
        ...
    /Client-Y
      /Project-Beta
        ...
    /Client-Self
      /Project-Zen
        ...
  /_References
    /Books
      /Technology
      /Business
    /Articles
      /Blog-Posts
      /Research
    /Courses
      /Online
      /Certifications
  /Archive
    /Completed-Projects
    /Old-References
    /Old-Templates
```

### Daily Notes Management

- Automatically creates and maintains year/month folders in the Journal section
- Creates and manages a default daily note template if none exists
- Automatically updates daily notes location based on current month
- Updates Obsidian's core daily notes settings to match the current structure
- Default template includes sections for tasks, notes, journal entries, and links

### Note Creation

- Create new notes with a modern modal interface
- Choose the destination folder from a dropdown menu
- Pre-fills note name if text is selected
- Creates proper wiki-style links with full paths
- Validates note names and handles duplicates
- Supports keyboard navigation (Enter to create)

### Templates

Default daily note template structure:

```markdown
---
created: {{date:YYYY-MM-DD}} {{time:HH:mm}}
---

# {{date:dddd, MMMM D, YYYY}}

## Tasks

- [ ]

## Notes

## Journal

## Links
```

### Auto-Updates

- Hourly checks for month changes to update daily notes location
- Creates new year/month folders as needed
- Maintains consistent folder structure across vault

### Error Handling

- Graceful handling of duplicate files
- Clear error messages for invalid note names
- Fallback behaviors for missing templates
- Comprehensive error logging for troubleshooting

## Usage

### Creating New Notes

1. Select text (optional) to use as note name
2. Use the command palette or hotkey to create a new note
3. In the modal:
   - Enter note name (pre-filled if text was selected)
   - Choose destination folder from dropdown
   - Click Create or press Enter

### Daily Notes

- Daily notes are automatically created in the correct year/month folder
- Template is automatically applied
- Folder structure is maintained automatically

## Installation

1. Install the plugin from Obsidian's Community Plugins
2. Enable the plugin in Settings → Community Plugins
3. The plugin will automatically create the necessary folder structure
4. Daily notes settings will be configured automatically

## Configuration

- The plugin maintains its own settings and coordinates with Obsidian's core daily notes settings
- Folder structure is created and maintained automatically
- Templates are created if they don't exist

```

```
