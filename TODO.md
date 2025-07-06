# Mappy Development TODO

## Active Plans



---

## Completed Plans

### ✅ Search Optimization (`/plans/search-optimization.md`)
- **Priority**: High | **Effort**: 4-8h | **Assignee**: @opencode
- **Status**: Completed (4/4 milestones)
- **Achievement**: Comprehensive search performance optimization with 2-5x improvements
- **Milestones**: 
  - ✅ Remove duplicate string storage (50% memory reduction)
  - ✅ Consolidate useMemo hooks (200% performance improvement)
  - ✅ Implement incremental index updates (300% speed improvement)
  - ✅ Add Web Workers for large datasets (500% speed improvement)

### ✅ Entry Editor Transformation Button Fix (`/plans/entry-editor-button-fix.md`)
- **Priority**: High | **Effort**: 30min | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: "Apply to X entries" transformation button never activates due to case sensitivity bug
- **Solution**: Fixed hex validation regex to support both uppercase and lowercase hex digits

### ✅ Entry Field Editing Fix (`/plans/entry-field-editing-fix.md`)
- **Priority**: High | **Effort**: 1-2h | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: TextField editing immediately deactivates when clicking on fields in EntryEditModal
- **Solution**: Added event handlers to prevent TextField event bubbling to row selection handlers

---

## Quick Tasks
- [x] Create plan creation documentation
- [x] Implement conditional "Save" button activation in EntryEditModal (only enable when changes exist)

### 🐛 Entry Range Selection Fix (`/plans/entry-range-selection-fix.md`)
- **Priority**: High | **Effort**: 30min | **Assignee**: @opencode
- **Status**: Not Started
- **Issue**: Range selection (shift-click) broken in EntryEditModal after field editing fix
- **Root Cause**: Event handlers prevent ALL propagation, including shift-clicks needed for range selection

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`

---

**Last Updated**: 2025-07-06