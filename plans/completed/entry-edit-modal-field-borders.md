# Entry Edit Modal Field Borders Enhancement

## Plan Metadata
- **Status**: Completed
- **Priority**: Medium
- **Created**: 2025-01-07
- **Last Updated**: 2025-01-07
- **Assignee**: @opencode
- **Type**: Enhancement

## Current State Analysis

The EntryEditModal component (`client/src/components/Editor/EntryEditModal.jsx`) currently uses TextField components with `variant="standard"` and `disableUnderline: true` for the editable key and value fields (lines 334-358). This creates a clean look but makes it difficult for users to distinguish between editable and non-editable content.

### Current Field Implementation:
```jsx
<TextField
  value={row.key}
  onChange={e => handleCellChange(i, 'key', e.target.value)}
  variant="standard"
  error={!keyRegex.test(row.key)}
  sx={{ width: '40%' }}
  InputProps={{
    disableUnderline: true,
    sx: { fontFamily: '"JetBrains Mono", monospace' },
  }}
/>
```

## Proposed Solution

Add subtle borders around the editable fields to clearly indicate they are interactive while maintaining the clean aesthetic.

### Implementation Details:

1. **Modify TextField styling** in `EntryEditModal.jsx:334-358`:
   - Add border styling to InputProps
   - Use subtle border color that matches the theme
   - Add focus states for better UX
   - Maintain monospace font family

2. **Border styling approach**:
   ```jsx
   InputProps={{
     disableUnderline: true,
     sx: { 
       fontFamily: '"JetBrains Mono", monospace',
       border: '1px solid',
       borderColor: 'divider',
       borderRadius: 1,
       px: 1,
       '&:hover': {
         borderColor: 'text.secondary',
       },
       '&.Mui-focused': {
         borderColor: 'primary.main',
       },
       '&.Mui-error': {
         borderColor: 'error.main',
       },
     },
   }}
   ```

3. **Consistency considerations**:
   - Apply same styling to both key and value fields
   - Ensure error states are clearly visible
   - Maintain existing validation highlighting

## Files to Modify

- `client/src/components/Editor/EntryEditModal.jsx` (lines 334-358)
  - Update TextField InputProps for key field
  - Update TextField InputProps for value field

## Success Criteria

- [x] Editable fields have visible borders that clearly indicate interactivity
- [x] Border styling is consistent with Material-UI theme
- [x] Focus states provide clear visual feedback
- [x] Error states remain clearly visible
- [x] Monospace font family is preserved
- [x] Overall aesthetic remains clean and professional

## Implementation Priority

This enhancement improves user experience by making the interface more intuitive, helping users quickly identify which fields are editable in the modal.