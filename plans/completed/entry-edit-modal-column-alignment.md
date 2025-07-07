# Bug Fix: Entry Edit Modal Column Alignment

## Plan Metadata
- **Status**: Completed
- **Assignee**: @opencode
- **Type**: Bug Fix

## Bug Description
### Current Behavior
The header labels in the entry list do not line up with the editable fields. The spacing on the left and right edges is inconsistent and the `=` separator in preview rows appears off‑center.

### Expected Behavior
Headers should align perfectly with the columns below. There should be consistent padding on the outer edges and the `=` character in preview rows should be centered between the key and value.

### Steps to Reproduce
1. Open a layer in the editor.
2. Select "Edit Entries".
3. Observe misaligned columns and spacing issues.

### Environment
- Browser: Chrome
- OS: Ubuntu
- Version: latest

## Root Cause Analysis
### Investigation Findings
Styles for header and rows use different padding. Preview uses a grid layout where the `=` sign is part of the text, causing irregular spacing.

### Root Cause
Mismatched padding and missing dedicated column for the `=` sign.

### Affected Components
- EntryEditModal.jsx

## Proposed Solution
### Fix Strategy
Unify layout using grid with four columns (key, `=`, value, offset). Apply the same padding for header and rows.

### Code Changes
```javascript
// Before
<Box sx={{ display: 'flex' }}> ... </Box>

// After
<Box sx={{ display: 'grid', gridTemplateColumns: '11ch 1ch 11ch 1fr' }}> ... </Box>
```

## Implementation Milestones
- [ ] Milestone 1: Implement grid layout and spacing adjustments
- [ ] Milestone 2: Verify headers and rows align in light and dark themes
- [ ] Milestone 3: Update plan to Completed

## Testing Plan
- [ ] Run `npm run lint` to ensure code style
- [ ] Manual visual verification in the browser

## Success Criteria
- [ ] Columns line up and padding is consistent
- [ ] `=` separator is centered

## Prevention Measures
Use shared constants/components for list layouts to avoid divergence.
