# Bug Fix: Entry Edit Modal Column Alignment

## Plan Metadata
- **Status**: Completed
- **Assignee**: @opencode
- **Type**: Bug Fix

## Bug Description
### Current Behavior
Header labels do not line up with the editable fields. The first and last
columns sit flush against the paper edges while each row has internal padding.
There is also no dedicated column for the `=` separator, so spacing between the
key and value fields looks uneven.

### Expected Behavior
Column headers align exactly with the content below. The list has equal padding
on the left and right. The `=` separator is displayed in its own column with
consistent spacing so keys and values appear balanced.

### Steps to Reproduce
1. Open a layer and click "Edit Targets" or "Edit Sources".
2. Look at the header row above the entry list.
3. Notice misaligned columns and inconsistent spacing between key and value.

### Environment
- Browser: Chrome/Firefox
- OS: Windows/macOS/Linux
- Version: Current development build

## Root Cause Analysis
### Investigation Findings
Styles for the header row differ from the row styles. Rows use horizontal
padding but the header does not, leaving the text offset from the inputs.
Additionally the layout omits a column for the `=` sign, causing uneven
distribution of space between the key and value fields.

### Root Cause
Missing padding and separator column in `EntryEditModal.jsx`.

### Affected Components
- EntryEditModal.jsx: list header and editable row markup

## Proposed Solution
### Fix Strategy
Add matching horizontal padding to the header row so its text aligns with row
content. Insert a narrow column containing an `=` character between the key and
value fields for both the header and each editable row. Use `mx: 1` spacing on
the separator to keep it centered. Ensure the outer columns have the same left
and right padding as the rows.

### Code Changes
```jsx
// In EntryEditModal.jsx
<Box sx={{ display: 'flex', fontWeight: 'bold', px: SPACING.PADDING.SMALL }}>
  <Box sx={{ width: '11ch', minWidth: '11ch' }}>Key</Box>
  <Box sx={{ mx: 1 }}>=</Box>
  <Box sx={{ width: '11ch', minWidth: '11ch' }}>Value</Box>
  <Box sx={{ flex: 1, textAlign: 'right', ml: 2 }}>Offset</Box>
</Box>

// Row markup adds the same '=' Box between the fields
```

## Implementation Milestones
- [ ] Milestone 1: Reproduce bug in development
- [ ] Milestone 2: Implement fix
- [ ] Milestone 3: Test fix thoroughly
- [ ] Milestone 4: Deploy and verify

## Testing Plan
- [ ] Verify fix resolves the reported issue
- [ ] Test edge cases and related functionality
- [ ] Regression testing for affected areas
- [ ] Performance impact assessment

## Success Criteria
- [ ] Bug no longer reproducible
- [ ] No new bugs introduced
- [ ] Performance maintained or improved
- [ ] All tests pass

## Prevention Measures
[Describe how to prevent similar bugs in the future]
