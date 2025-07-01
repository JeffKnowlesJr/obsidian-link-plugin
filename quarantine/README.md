# Quarantine Directory

This directory contains deprecated features that have been removed from the main codebase during the MVP simplification process.

## Purpose

As we move towards a solid MVP, features are being systematically deprecated and quarantined here to:
1. Keep them separate from the running codebase
2. Allow for potential future reintegration if needed
3. Maintain a clear audit trail of what was removed

## Structure

- `shortcodes/` - Complete shortcode system implementation
- `settings/` - Shortcode-related settings and validation
- `types.ts` - Type definitions for quarantined features

## Deprecated Features

### Shortcodes (Deprecated: December 2024) ✅
- **Reason**: Complexity reduction for MVP
- **Status**: Complete
- **Files moved**: 
  - `src/shortcodes/` → `quarantine/shortcodes/`
  - `src/settings/shortcodeSettings.ts` → `quarantine/settings/`
- **Impact**: ~500 lines of code removed from main codebase
- **Build Status**: ✅ Clean build after removal

#### What Was Quarantined
- **Core Engine**: Tokenizer, Parser, Transformer, Registry
- **Settings**: ShortcodeSettings class and validation
- **UI Components**: Settings panels, ribbon buttons, dialogs
- **Types**: Token, ASTNode, ShortcodeDefinition interfaces
- **Constants**: SHORTCODE_PATTERNS, SHORTCODE_HELP button config

#### Main Codebase Changes
- Commented out all shortcode references in `src/types.ts`
- Removed ShortcodeManager from `src/main.ts`
- Disabled shortcode settings in `src/ui/settingsTab.ts`
- Removed shortcode ribbon button from `src/ui/ribbonManager.ts`
- Updated all settings files to exclude shortcode functionality

## Restoration Process

If any of these features need to be restored:

### For Shortcodes
1. **Move Files**: Copy files from `quarantine/` back to `src/`
2. **Update Types**: Uncomment shortcode interfaces in `src/types.ts`
3. **Restore Main Plugin**: Uncomment ShortcodeManager in `src/main.ts`
4. **Restore Settings**: Uncomment shortcode settings throughout settings system
5. **Restore UI**: Uncomment shortcode UI components
6. **Update Constants**: Uncomment shortcode constants
7. **Test**: Run build and fix any remaining TypeScript errors

See `SHORTCODE_DEPRECATION_SUMMARY.md` for detailed restoration instructions.

## Notes

- Files are preserved as-is to maintain their original functionality
- No modifications made during quarantine process (except import path fixes)
- All TypeScript interfaces and types preserved
- Complete documentation provided for restoration process
- Build tested and confirmed clean after deprecation 