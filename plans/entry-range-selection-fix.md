# Entry Range Selection Fix

## Plan Metadata
- **Status**: Not Started
- **Priority**: High

- **Created**: 2025-07-06
- **Last Updated**: 2025-07-06
- **Assignee**: @opencode
- **Type**: Bug Fix

## Bug Description
### Current Behavior
After implementing the entry field editing fix, range selection (shift-click) no longer works in the EntryEditModal. Users cannot select multiple entries to enable batch transformations in the sidebar.

### Expected Behavior
Users should be able to:
1. Click on individual entries to select them
2. Shift-click to select ranges of entries
3. Edit individual TextField values without losing selection
4. Use batch transformations on selected ranges

### Steps to Reproduce
1. Open EntryEditModal with targets/sources
2. Click on one entry (should select it)
3. Shift-click on another entry (should select range)
4. Observe that range selection doesn't work - only single selection occurs

## Root Cause Analysis
### Investigation Findings
Based on code analysis of `/client/src/components/Editor/EntryEditModal.jsx`:

**CRITICAL ISSUE**: Overly aggressive event propagation blocking

**Lines 137-143**: `handleFieldClick` and `handleFieldMouseDown` call `e.stopPropagation()` unconditionally
**Lines 317-318, 330-331**: TextFields use these handlers for both onClick and onMouseDown

### Root Cause
1. **Blanket Event Blocking**: `e.stopPropagation()` prevents ALL events from reaching row handlers
2. **Shift-Click Prevention**: Shift-clicks on TextFields are blocked from reaching `handleRowClick`
3. **Range Selection Broken**: `handleRowClick` never receives shift-click events to trigger range selection logic
4. **Over-Correction**: The original fix was too broad - it should only prevent non-shift clicks

### Affected Functionality
- Range selection via shift-click
- Batch transformation features (require 2+ selected entries)
- Multi-entry operations in the sidebar

## Proposed Solution
### Fix Strategy
Modify event handlers to allow shift-clicks to bubble up while still preventing regular clicks from interfering with field editing.

### Code Changes
```javascript
// Replace blanket stopPropagation with conditional logic
const handleFieldClick = (e) => {
  // Only prevent propagation for non-shift clicks
  if (!e.shiftKey) {
    e.stopPropagation();
  }
};

const handleFieldMouseDown = (e) => {
  // Only prevent propagation for non-shift clicks
  if (!e.shiftKey) {
    e.stopPropagation();
  }
};
```

### Alternative Approach (if needed)
If the above doesn't work perfectly, we could implement a more sophisticated approach:

```javascript
const handleFieldClick = (e) => {
  if (e.shiftKey) {
    // For shift-clicks, let the event bubble to enable range selection
    // but blur the field first to prevent editing conflicts
    e.target.blur();
  } else {
    // For regular clicks, prevent bubbling to allow field editing
    e.stopPropagation();
  }
};
```

## Implementation Milestones
- [ ] Milestone 1: Modify handleFieldClick to allow shift-click propagation
- [ ] Milestone 2: Modify handleFieldMouseDown to allow shift-click propagation  
- [ ] Milestone 3: Test range selection functionality
- [ ] Milestone 4: Test field editing still works for regular clicks
- [ ] Milestone 5: Test batch transformations work with selected ranges

## Testing Plan
- [ ] Verify regular clicks on TextFields still allow editing without row selection
- [ ] Test shift-click range selection works across multiple entries
- [ ] Verify batch transformation sidebar activates with 2+ selected entries
- [ ] Test Ctrl+A select all functionality still works
- [ ] Verify field editing and range selection can coexist

## Success Criteria
- [ ] Shift-click range selection works in EntryEditModal
- [ ] Regular TextField editing works without triggering row selection
- [ ] Batch transformations are enabled when 2+ entries are selected
- [ ] No regression in existing field editing functionality
- [ ] Keyboard shortcuts (Ctrl+A) continue to work

## Performance Impact
- Minimal: Only changes conditional logic in event handlers
- No memory or CPU overhead
- Improves user experience by restoring range selection

## Dependencies
- No external dependencies required
- Uses standard React event handling patterns

## Risks and Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Field editing conflicts with selection | Medium | Low | Test thoroughly and use field blur if needed |
| Complex event handling edge cases | Low | Medium | Keep solution simple and test all scenarios |
| Breaking existing functionality | High | Low | Comprehensive testing of all interaction modes |