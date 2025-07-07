# Mappy Development TODO

## Active Plans

---

## Completed Plans

### 🎨 Entry Field Editability Improvements (`/plans/completed/entry-field-editability-improvements.md`)
- **Priority**: Medium | **Assignee**: @opencode
- **Status**: Completed
- **Description**: Replace bordered text fields with modern hover-reveal pattern or subtle visual cues to improve both visual design and user understanding of field editability
- **Goal**: Cleaner interface design and better user discovery of editable fields through standard UX patterns



### 🎨 Large Centered Modal UI Enhancement (`/plans/completed/large-centered-modal-ui.md`)
- **Priority**: High | **Assignee**: @opencode
- **Status**: Completed
- **Enhancement**: Transform fullscreen modal to large centered modal (75% width, 85% height) with blurred background, smooth animations, and multiple exit methods
- **Goal**: Improve visual focus, better content proportions, clear context boundaries, and enhanced readability while preserving all functionality



### ✅ Layer Context Menu Removal
Successfully removed context menu and added red delete button next to "Add Layer" button. Simplified UX, better discoverability, reduced code complexity.

### ✅ Entry Edit Modal Field Borders
Added subtle borders around editable fields in EntryEditModal with hover and focus states. Improved UX by making editable fields clearly distinguishable while maintaining clean aesthetic.

### ✅ Search Optimization
Comprehensive search performance optimization with 2-5x improvements across 4 milestones: duplicate string storage removal (50% memory reduction), consolidated useMemo hooks (200% performance improvement), incremental index updates (300% speed improvement), and Web Workers for large datasets (500% speed improvement).

### ✅ Entry Editor Transformation Button Fix
Fixed "Apply to X entries" transformation button that never activated due to case sensitivity bug. Updated hex validation regex to support both uppercase and lowercase hex digits.

### ✅ Entry Field Editing Fix
Fixed TextField editing that immediately deactivated when clicking on fields in EntryEditModal. Added event handlers to prevent TextField event bubbling to row selection handlers.

### ✅ Planning System Sync Fix
Fixed plans not being properly archived when completed and TODO.md/plan files being out of sync. Implemented automated sync tools, improved validation, and consistent metadata format.

### ✅ Reset Button Freeze Fix
Fixed reset button causing browser tab to freeze and become unresponsive. Added reset-specific optimization to bypass expensive change detection when clearing all data.

### ✅ File Upload Reset Bug
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

