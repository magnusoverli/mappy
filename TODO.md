# Mappy Development TODO

## Active Plans

### 🎨 Entry Edit Modal Field Width Optimization (`/plans/entry-edit-modal-field-width-optimization.md`)
- **Priority**: Medium | **Assignee**: @opencode
- **Status**: Not Started
- **Enhancement**: Reduce the width of editable fields to better match content while maintaining horizontal positioning
- **Goal**: Make bordered fields more proportional to their 7-8 character content, improving visual balance

---

## Completed Plans

### ✅ Layer Context Menu Removal (`/plans/completed/layer-context-menu-removal.md`)
Successfully removed context menu and added red delete button next to "Add Layer" button. Simplified UX, better discoverability, reduced code complexity.

### ✅ Entry Edit Modal Field Borders (`/plans/completed/entry-edit-modal-field-borders.md`)
Added subtle borders around editable fields in EntryEditModal with hover and focus states. Improved UX by making editable fields clearly distinguishable while maintaining clean aesthetic.

### ✅ Search Optimization (`/plans/completed/search-optimization.md`)
Comprehensive search performance optimization with 2-5x improvements across 4 milestones: duplicate string storage removal (50% memory reduction), consolidated useMemo hooks (200% performance improvement), incremental index updates (300% speed improvement), and Web Workers for large datasets (500% speed improvement).

### ✅ Entry Editor Transformation Button Fix (`/plans/completed/entry-editor-button-fix.md`)
Fixed "Apply to X entries" transformation button that never activated due to case sensitivity bug. Updated hex validation regex to support both uppercase and lowercase hex digits.

### ✅ Entry Field Editing Fix (`/plans/completed/entry-field-editing-fix.md`)
Fixed TextField editing that immediately deactivated when clicking on fields in EntryEditModal. Added event handlers to prevent TextField event bubbling to row selection handlers.

### ✅ Planning System Sync Fix (`/plans/completed/planning-system-sync-fix.md`)
Fixed plans not being properly archived when completed and TODO.md/plan files being out of sync. Implemented automated sync tools, improved validation, and consistent metadata format.

### ✅ Reset Button Freeze Fix (`/plans/completed/reset-button-freeze-fix.md`)
Fixed reset button causing browser tab to freeze and become unresponsive. Added reset-specific optimization to bypass expensive change detection when clearing all data.

### ✅ File Upload Reset Bug (`/plans/completed/fileupload-reset-bug.md`)
Fixed file input not triggering second onChange after reset. Clear the file input's value after file selection.

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`
- **Auto-Archive**: `./scripts/sync-plans.sh auto-archive`
- **Move to Completed**: `./scripts/sync-plans.sh move-to-completed <plan>`
- **Check Consistency**: `./scripts/sync-plans.sh check-consistency`

---

