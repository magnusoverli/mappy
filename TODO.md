# Mappy Development TODO

## Active Plans

### 🔍 Search Optimization (`/plans/search-optimization.md`)
- **Priority**: High | **Effort**: 6-12h | **Assignee**: @opencode
- **Status**: In Progress (1/6 milestones completed)
- **Next**: Consolidate useMemo hooks for better performance
- **Milestones**: 
  - ✅ Remove duplicate string storage (50% memory reduction)
  - ⏳ Consolidate useMemo hooks
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

---

## Planning Tools
- **Create Plan**: `./scripts/plan-tools.sh create-plan <name> [type]`
- **Validate**: `./scripts/validate-plans.sh`
- **Update Status**: `./scripts/plan-tools.sh update-status <plan> <status>`
- **Archive Plan**: `./scripts/plan-tools.sh archive-plan <name>`

---

**Last Updated**: 2025-07-06