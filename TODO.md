# Mappy Development TODO

## Active Plans

### 🎨 Entry Edit Modal Field Borders (`/plans/entry-edit-modal-field-borders.md`)
- **Priority**: Medium | **Assignee**: @opencode
- **Status**: Not Started
- **Enhancement**: Add subtle borders around editable fields in EntryEditModal to improve UX
- **Goal**: Make editable fields clearly distinguishable while maintaining clean aesthetic

### ✅ Layer Context Menu Removal (`/plans/completed/layer-context-menu-removal.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Achievement**: Successfully removed context menu and added red delete button next to "Add Layer" button
- **Benefits**: Simplified UX, better discoverability, reduced code complexity



---

## Completed Plans

### ✅ Search Optimization (`/plans/completed/search-optimization.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed (4/4 milestones)
- **Achievement**: Comprehensive search performance optimization with 2-5x improvements
- **Milestones**: 
  - ✅ Remove duplicate string storage (50% memory reduction)
  - ✅ Consolidate useMemo hooks (200% performance improvement)
  - ✅ Implement incremental index updates (300% speed improvement)
  - ✅ Add Web Workers for large datasets (500% speed improvement)

### ✅ Entry Editor Transformation Button Fix (`/plans/completed/entry-editor-button-fix.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: "Apply to X entries" transformation button never activates due to case sensitivity bug
- **Solution**: Fixed hex validation regex to support both uppercase and lowercase hex digits

### ✅ Entry Field Editing Fix (`/plans/completed/entry-field-editing-fix.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: TextField editing immediately deactivates when clicking on fields in EntryEditModal
- **Solution**: Added event handlers to prevent TextField event bubbling to row selection handlers

### ✅ Planning System Sync Fix (`/plans/completed/planning-system-sync-fix.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: Plans not properly archived when completed, TODO.md and plan files out of sync
- **Solution**: Automated sync tools, improved validation, and consistent metadata format

### ✅ Reset Button Freeze Fix (`/plans/completed/reset-button-freeze-fix.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: Reset button causes browser tab to freeze and become unresponsive
- **Solution**: Added reset-specific optimization to bypass expensive change detection when clearing all data

### ✅ File Upload Reset Bug (`/plans/completed/fileupload-reset-bug.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: File input not triggering second onChange after reset
- **Solution**: Clear the file input's value after file selection

---

## Quick Tasks
- [x] Create plan creation documentation
- [x] Implement conditional "Save" button activation in EntryEditModal (only enable when changes exist)

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`
- **Auto-Archive**: `./scripts/sync-plans.sh auto-archive`
- **Check Consistency**: `./scripts/sync-plans.sh check-consistency`

---

**Last Updated**: 2025-01-07