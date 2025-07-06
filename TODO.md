# Mappy Development TODO

## Active Plans

### 🔍 Search Optimization (`/plans/search-optimization.md`)
- **Priority**: High | **Effort**: 6-12h | **Assignee**: @opencode
- **Status**: In Progress (2/6 milestones completed)
- **Next**: Implement incremental index updates
- **Milestones**: 
  - ✅ Remove duplicate string storage (50% memory reduction)
  - ✅ Consolidate useMemo hooks (200% performance improvement)
  - ⏳ Implement incremental index updates
  - ⏳ Add multi-term search support
  - ⏳ Implement relevance scoring
  - ⏳ Add Web Workers for large datasets

---

## Completed Plans
*No completed plans yet*

---

## Quick Tasks
- [ ] Fix status inconsistency in search-optimization.md
- [ ] Add plan validation to CI/CD pipeline
- [ ] Create plan creation documentation

### ✅ Entry Editor Transformation Button Fix (`/plans/entry-editor-button-fix.md`)
- **Priority**: High | **Effort**: 30min | **Assignee**: @opencode
- **Status**: Completed
- **Issue**: "Apply to X entries" transformation button never activates due to case sensitivity bug
- **Solution**: Fixed hex validation regex to support both uppercase and lowercase hex digits

### 🐛 Entry Field Editing Fix (`/plans/entry-field-editing-fix.md`)
- **Priority**: High | **Effort**: 1-2h | **Assignee**: @opencode
- **Status**: Not Started
- **Issue**: TextField editing immediately deactivates when clicking on fields in EntryEditModal
- **Root Cause**: Event bubbling conflict between TextField clicks and row selection handlers

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`

---

**Last Updated**: 2025-07-06