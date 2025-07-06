# Planning System Synchronization Fix

## Plan Metadata
- **Status**: Completed
- **Priority**: High

- **Created**: 2025-07-06
- **Last Updated**: 2025-07-06
- **Assignee**: @opencode
- **Type**: System Improvement

## Current State Analysis

### Issues Identified

1. **Completed Plans Not Archived**
   - `search-optimization.md`, `entry-editor-button-fix.md`, `entry-field-editing-fix.md` are marked as completed but still in active plans folder
   - Should be moved to `/plans/completed/` directory
   - TODO.md shows them as completed but files are in wrong location

2. **Status Field Format Inconsistencies**
   - Validation script expects `**Status**:` format
   - Some plans use different formats or missing metadata sections
   - `reset-button-freeze-fix.md` missing proper metadata section

3. **TODO.md and Plan File Sync Issues**
   - Manual updates required for both files when status changes
   - No automated synchronization between TODO.md and individual plan files
   - Risk of inconsistencies when only one file is updated

4. **Missing Plan References**
   - `reset-button-freeze-fix.md` not referenced in TODO.md
   - New plans not automatically added to TODO.md

5. **Validation Script Limitations**
   - Hardcoded exception for `search-optimization.md`
   - Doesn't handle all status format variations
   - No automatic fixing capabilities

## Proposed Solutions

### Phase 1: Immediate Fixes (30 minutes)

#### 1.1 Archive Completed Plans
Move completed plans to proper location:
```bash
./scripts/plan-tools.sh archive-plan search-optimization
./scripts/plan-tools.sh archive-plan entry-editor-button-fix  
./scripts/plan-tools.sh archive-plan entry-field-editing-fix
```

#### 1.2 Fix Plan Metadata Format
Standardize metadata sections in all plan files:
```markdown
## Plan Metadata
- **Status**: [Status]
- **Priority**: [Priority]
- **Created**: [Date]
- **Last Updated**: [Date]
- **Assignee**: @opencode
- **Type**: [Type]
```

#### 1.3 Update TODO.md Structure
- Move completed plans to "Completed Plans" section
- Add missing plan references
- Update status information to match plan files

### Phase 2: System Improvements (1 hour)

#### 2.1 Enhanced Validation Script
Improve `validate-plans.sh` to:
- Handle multiple status format variations
- Provide specific fix suggestions
- Check for missing plan references in TODO.md
- Validate completed plans are in correct directory

#### 2.2 Automated Sync Tool
Create `sync-plans.sh` script to:
- Automatically update TODO.md when plan status changes
- Move completed plans to archive directory
- Add new plans to TODO.md active section
- Maintain consistent formatting

#### 2.3 Plan Status Update Workflow
Enhance `plan-tools.sh update-status` to:
- Update both plan file and TODO.md simultaneously
- Auto-archive when status changes to "Completed"
- Validate changes before applying
- Provide rollback capability

### Phase 3: Process Documentation (30 minutes)

#### 3.1 Update AGENTS.md
Add planning workflow guidelines:
- When to create plans vs quick tasks
- How to update plan status properly
- Automated vs manual sync procedures
- Validation and consistency checks

#### 3.2 Create Planning Checklist
Document required steps for:
- Creating new plans
- Updating plan status
- Completing and archiving plans
- Maintaining TODO.md consistency

## Implementation Plan

### Step 1: Archive Completed Plans
```bash
# Move completed plans to archive
mkdir -p plans/completed
mv plans/search-optimization.md plans/completed/
mv plans/entry-editor-button-fix.md plans/completed/
mv plans/entry-field-editing-fix.md plans/completed/
```

### Step 2: Fix Plan Metadata
Update each plan file to include proper metadata section with consistent formatting.

### Step 3: Update TODO.md
- Move completed plans to "Completed Plans" section
- Add `reset-button-freeze-fix.md` to active plans
- Add `planning-system-sync-fix.md` to active plans
- Ensure all references are accurate

### Step 4: Enhance Scripts
- Fix validation script to handle format variations
- Add automated sync capabilities
- Improve error handling and user feedback

### Step 5: Test and Validate
- Run validation script to ensure consistency
- Test plan creation and status update workflows
- Verify automated archiving works correctly

## Success Criteria

### Functional Requirements
- [ ] All completed plans moved to `/plans/completed/` directory
- [ ] TODO.md accurately reflects current plan status and locations
- [ ] Validation script passes without errors
- [ ] Plan metadata follows consistent format across all files

### Process Requirements
- [ ] Status updates automatically sync between plan files and TODO.md
- [ ] Completed plans automatically archived
- [ ] New plans automatically added to TODO.md
- [ ] Validation runs successfully on all plans

### Documentation Requirements
- [ ] Updated AGENTS.md with planning workflow
- [ ] Planning checklist created and accessible
- [ ] Script usage documented with examples
- [ ] Process for maintaining consistency documented

## Risk Assessment

### Low Risk
- Moving completed plans to archive directory
- Updating metadata format in plan files
- Enhancing validation script

### Medium Risk
- Automated sync between TODO.md and plan files
- Script modifications that affect existing workflows

### Mitigation Strategies
- Backup current state before making changes
- Test scripts on sample data first
- Implement changes incrementally
- Maintain manual override capabilities
- Document rollback procedures

## Testing Strategy

### Manual Testing
- Create test plan and verify workflow
- Update plan status and check sync
- Archive plan and verify TODO.md updates
- Run validation on all scenarios

### Automated Testing
- Script unit tests for edge cases
- Integration tests for full workflow
- Validation tests for all plan formats
- Performance tests for large plan sets

## Dependencies
- Bash scripting environment
- Git for version control
- Standard Unix tools (grep, sed, awk)
- Existing plan templates and structure