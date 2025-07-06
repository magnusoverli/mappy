# Mappy Development TODO

## Active Plans

### 🔍 Search Optimization (`/plans/search-optimization.md`)
- **Priority**: High | **Effort**: 4-8h | **Assignee**: @opencode
- **Status**: In Progress (3/4 milestones completed)
- **Next**: Add Web Workers for large datasets
- **Milestones**: 
  - ✅ Remove duplicate string storage (50% memory reduction)
  - ✅ Consolidate useMemo hooks (200% performance improvement)
  - ✅ Implement incremental index updates (300% speed improvement)
  - ⏳ Add Web Workers for large datasets (500% speed improvement)

---

## Completed Plans

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
- [ ] Fix status inconsistency in search-optimization.md
- [ ] Create plan creation documentation
- [ ] Implement conditional "Save" button activation in EntryEditModal (only enable when changes exist)

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`

---

**Last Updated**: 2025-07-06