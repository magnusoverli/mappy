# Entry Field Editing Fix

## Plan Metadata
- **Status**: Not Started
- **Priority**: High
- **Effort**: 1-2 hours
- **Created**: 2025-07-06
- **Last Updated**: 2025-07-06
- **Assignee**: @opencode
- **Type**: Bug Fix

## Bug Description
### Current Behavior
When trying to edit a single field (key or value) in the EntryEditModal, clicking on a TextField activates edit mode but immediately deactivates it, preventing users from typing or making changes.

### Expected Behavior
Users should be able to:
1. Click on a TextField to focus it
2. Type and edit the content
3. Navigate between fields with Tab or mouse clicks
4. Complete editing without unexpected focus loss

### Steps to Reproduce
1. Open EntryEditModal with targets/sources
2. Click on any TextField (key or value field)
3. Observe that the field briefly gains focus then immediately loses it
4. Unable to type or edit the field content

## Root Cause Analysis
### Investigation Findings
Based on code analysis of `/client/src/components/Editor/EntryEditModal.jsx`:

**CRITICAL ISSUE**: Event handling conflict between row selection and field editing

**Line 282-283**: `onMouseDown={handleRowMouseDown}` and `onClick={e => handleRowClick(i, e)}`
**Line 306-327**: TextFields are inside the clickable Paper container

### Root Cause
1. **Event Bubbling Conflict**: TextField clicks bubble up to Paper container
2. **Row Selection Handler**: `handleRowClick` is triggered when clicking TextFields
3. **Focus Interference**: Row selection logic interferes with TextField focus
4. **Event Prevention**: `handleRowMouseDown` with `preventDefault()` on shift-click affects normal clicks

### Affected Components
- `EntryEditModal.jsx`: TextField editing within virtualized list rows
- User workflow: Cannot edit individual field values

## Proposed Solution
### Fix Strategy
Prevent event bubbling from TextFields to parent row click handlers, allowing normal field editing while preserving row selection functionality.

### Code Changes
```javascript
// Add event handling to TextFields to prevent bubbling
const handleFieldClick = (e) => {
  e.stopPropagation(); // Prevent bubbling to row click handler
};

const handleFieldMouseDown = (e) => {
  e.stopPropagation(); // Prevent bubbling to row mousedown handler
};

// Update TextField components
<TextField
  value={row.key}
  onChange={e => handleCellChange(i, 'key', e.target.value)}
  onClick={handleFieldClick}
  onMouseDown={handleFieldMouseDown}
  variant="standard"
  error={!keyRegex.test(row.key)}
  sx={{ width: '40%' }}
  InputProps={{
    disableUnderline: true,
    sx: { fontFamily: '"JetBrains Mono", monospace' },
  }}
/>

<TextField
  value={row.value}
  onChange={e => handleCellChange(i, 'value', e.target.value)}
  onClick={handleFieldClick}
  onMouseDown={handleFieldMouseDown}
  variant="standard"
  error={!valRegex.test(row.value)}
  sx={{ width: '40%' }}
  InputProps={{
    disableUnderline: true,
    sx: { fontFamily: '"JetBrains Mono", monospace' },
  }}
/>
```

## Implementation Milestones
- [ ] Milestone 1: Add event handlers to prevent TextField event bubbling
- [ ] Milestone 2: Test field editing functionality
- [ ] Milestone 3: Verify row selection still works when clicking outside fields
- [ ] Milestone 4: Test keyboard navigation and focus management

## Testing Plan
- [ ] Verify TextField focus works when clicking on fields
- [ ] Test typing and editing field content
- [ ] Verify Tab navigation between fields
- [ ] Test row selection still works when clicking on row background
- [ ] Test shift-click row selection functionality
- [ ] Verify Ctrl+A select all functionality still works

## Success Criteria
- [ ] TextFields can be focused by clicking
- [ ] Users can type and edit field content
- [ ] Tab navigation works between fields
- [ ] Row selection works when clicking outside TextFields
- [ ] No regression in existing selection functionality
- [ ] Keyboard shortcuts continue to work

## Performance Impact
- Minimal: Only adds event handlers to prevent bubbling
- No memory or CPU overhead
- Improves user experience by enabling field editing

## Dependencies
- No external dependencies required
- Uses standard React event handling patterns

## Risks and Mitigation
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Breaking row selection | Medium | Low | Test clicking outside TextFields |
| Keyboard shortcuts affected | Medium | Low | Verify Ctrl+A and other shortcuts |
| Focus management issues | Low | Low | Test Tab navigation thoroughly |