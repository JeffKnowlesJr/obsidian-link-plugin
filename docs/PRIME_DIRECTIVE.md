# Prime Directive: MVP DateFolders Plugin

This document defines the guiding principles and scope for the Minimum Viable Product (MVP) version of the DateFolders for DailyNotes plugin. All code and documentation must adhere to these principles until further revision.

## Core Principles

- **Simplicity**: The plugin should provide only the essential features required for daily journal management.
- **Reliability**: All features must work consistently and predictably, with minimal configuration.
- **Minimalism**: No extra features, settings, or integrations beyond the core journal management workflow.

## MVP Scope

1. **Journal Folder Structure**
   - Automatically create and maintain a year/month/day folder structure for journal entries.
   - Allow configuration of the base folder and date formats for folders and notes.
   - Only create 'journal' folder - no reference, workspace, or other non-essential folders.

2. **Daily Note Creation**
   - Provide commands and UI to create or open today's journal note.
   - Support creation of future-dated notes.
   - Create empty notes - no template content or dynamic generation.

3. **Daily Notes Integration**
   - Optionally integrate with Obsidian's Daily Notes plugin to use the same folder and naming conventions.
   - Provide safe backup and restore of Daily Notes plugin settings.

4. **No Templates or Templater Integration**
   - The plugin does not provide, manage, or reference any template files or templating systems.
   - All template-related code, settings, and documentation must be removed.

5. **Minimal UI and Settings**
   - Only include settings and UI necessary for the above features.
   - No extra toggles, fields, or options unrelated to core journal management.
   - Removed: restrictedDirectories, documentDirectory, workspace/reference folders, and other non-MVP settings.

## Current Status

### ✅ Completed MVP Simplifications
- Removed all template-related code and settings
- Removed reference and files folder structures from constants
- Simplified settings to only include essential journal management options
- Removed restrictedDirectories and documentDirectory settings
- Cleaned up constants to only include MVP functionality
- Removed workspace/reference folder options from settings UI
- Updated documentation to remove non-MVP references
- Simplified folder structure examples in documentation

### 🔄 Still Needs Attention
- Some documentation may still contain references to removed features
- Daily Notes integration settings could be simplified further
- Complex folder structure examples in some docs need final cleanup
- Ensure all settings UI only shows MVP-relevant options

## Out of Scope

- Templates, templater, or any dynamic content generation.
- Reference, workspace, or other non-journal folders.
- Advanced automation, scripting, or plugin interoperability.
- Complex folder structures beyond year/month organization.
- Settings for restricted directories or document directories.
- Template setup, management, or configuration.

## 📋 File Review Checklist

### Root Directory Files
- [✅] `README.md` - ✅ Reviewed and updated with DateFolders name
- [✅] `manifest.json` - ✅ Reviewed and updated with DateFolders name
- [ ] `package.json` - Verify dependencies are MVP-only
- [ ] `tsconfig.json` - Ensure configuration is minimal
- [ ] `esbuild.config.mjs` - Check build configuration
- [ ] `jest.config.js` - Verify test configuration
- [ ] `LICENSE` - No changes needed
- [ ] `versions.json` - Check version tracking
- [ ] `data.json` - Review for deprecated settings

### Source Files (`src/`)

#### Core Files
- [✅] `src/main.ts` - ✅ Reviewed and updated with DateFolders name and property updates
- [✅] `src/types.ts` - ✅ Reviewed and updated property names for DateFolders
- [✅] `src/constants.ts` - ✅ Reviewed and updated with DateFolders name and structure
- [✅] `src/settings.ts` - ✅ Reviewed and updated exports

#### Managers (`src/managers/`)
- [ ] `src/managers/directoryManager.ts` - Check for template/reference folder logic
- [ ] `src/managers/journalManager.ts` - Review for template content generation

#### Settings (`src/settings/`)
- [✅] `src/settings/defaultSettings.ts` - ✅ Reviewed and updated with new property names
- [✅] `src/settings/settingsValidator.ts` - ✅ Reviewed and updated validation
- [✅] `src/settings/directorySettings.ts` - ✅ Reviewed and updated with DateFolders structure
- [✅] `src/settings/journalSettings.ts` - ✅ Reviewed and renamed to DailyNotesSettings
- [ ] `src/settings/generalSettings.ts` - Check for unnecessary options
- [ ] `src/settings/dailyNotesSettings.ts` - Review integration settings
- [ ] `src/settings/index.ts` - Check exports
- [ ] `src/settings/README.md` - Review documentation

#### UI (`src/ui/`)
- [ ] `src/ui/settingsTab.ts` - Check for template/non-MVP UI elements
- [ ] `src/ui/ribbonManager.ts` - Review ribbon button functionality

#### Services (`src/services/`)
- [ ] `src/services/dateService.ts` - Verify date handling is MVP-only

#### Utils (`src/utils/`)
- [ ] `src/utils/dateUtils.ts` - Check for template-related utilities
- [ ] `src/utils/debugUtils.ts` - Review debug functionality
- [ ] `src/utils/errorHandler.ts` - Verify error handling
- [ ] `src/utils/pathUtils.ts` - Check path utilities

### Documentation (`docs/`)
- [✅] `docs/README.md` - ✅ Reviewed and updated with DateFolders name
- [✅] `docs/USER_GUIDE.md` - ✅ Reviewed and updated with DateFolders name
- [ ] `docs/ARCHITECTURE.md` - Review technical documentation
- [ ] `docs/COMPONENT_DOCUMENTATION.md` - Check component docs
- [ ] `docs/APPLICATION_DOCUMENTATION.md` - Review application docs
- [ ] `docs/DEVELOPMENT.md` - Check development guidelines
- [ ] `docs/DOCUMENTATION_SUMMARY.md` - Review documentation structure
- [✅] `docs/PRIME_DIRECTIVE.md` - ✅ This file - keep updated

### Configuration Files
- [ ] `.cursorignore` - Review ignore patterns
- [ ] `.gitignore` - Check git ignore patterns

## Review Guidelines

For each file, check for:
1. **Template References**: Any mention of templates, templater, or dynamic content
2. **Non-MVP Features**: References to reference/workspace folders, complex folder structures
3. **Deprecated Settings**: restrictedDirectories, documentDirectory, template settings
4. **Unnecessary Complexity**: Over-engineered solutions for simple MVP needs
5. **Documentation Accuracy**: Ensure docs match current MVP implementation

## Status Tracking

- ✅ **Reviewed**: File has been checked and is MVP-compliant
- 🔄 **Needs Review**: File needs to be examined for deprecated code
- ❌ **Has Issues**: File contains non-MVP code that needs removal
- ⚠️ **Partial**: File has some issues but mostly MVP-compliant

---

This document will be revised and expanded as the codebase evolves. All contributors must review and update this directive before adding new features or making significant changes. 