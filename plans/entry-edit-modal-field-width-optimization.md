# Entry Edit Modal Field Width Optimization

## Plan Metadata
- **Status**: Not Started
- **Assignee**: @opencode
- **Type**: Enhancement

## Current State Analysis

The EntryEditModal component (`client/src/components/Editor/EntryEditModal.jsx`) currently uses fixed percentage widths for the editable fields:

### Current Layout (lines 334-399):
```jsx
<TextField value={row.key} sx={{ width: '40%' }} />     // Key field
<TextField value={row.value} sx={{ width: '40%' }} />   // Value field  
<Box sx={{ width: '20%' }}>{row.offset}</Box>           // Offset display
```

### Content Format Analysis:
- **Key format**: `NN.NNNN` (e.g., "01.0001") = 7 characters
- **Value format**: `NNNNNNNN` (e.g., "FF00FF00") = 8 characters
- **Font**: JetBrains Mono (monospace)

### Current Issues:
1. **Oversized fields**: 40% width is much wider than needed for 7-8 character content
2. **Poor content-to-field ratio**: Large empty space within bordered fields
3. **Visual imbalance**: Fields appear unnecessarily wide with recent border addition

## Proposed Solution

Optimize field widths to better match content while maintaining horizontal positioning through strategic use of flexbox spacing.

### Implementation Strategy:

1. **Calculate optimal field widths** based on character count + padding:
   - Key field: ~7 characters + padding = approximately 120-140px
   - Value field: ~8 characters + padding = approximately 130-150px
   - Offset display: Keep current 20% for right alignment

2. **Maintain horizontal positioning** using flexbox with strategic spacing:
   - Use `flex-grow` and `margin` properties to maintain field positions
   - Add spacer elements if needed to preserve layout alignment

3. **Responsive considerations**:
   - Ensure fields don't become too narrow on smaller screens
   - Maintain readability across different viewport sizes

### Detailed Implementation Plan:

#### Option A: Fixed Pixel Widths with Flex Spacing
```jsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
  <TextField 
    value={row.key}
    sx={{ width: '140px' }}  // Fixed width for key
  />
  <Box sx={{ flexGrow: 1 }} />  // Spacer to maintain position
  <TextField 
    value={row.value}
    sx={{ width: '150px' }}  // Fixed width for value
  />
  <Box sx={{ flexGrow: 1 }} />  // Spacer to maintain position
  <Box sx={{ width: '20%', textAlign: 'right' }}>
    {row.offset}
  </Box>
</Box>
```

#### Option B: Character-based Width with CSS `ch` Units
```jsx
<TextField 
  value={row.key}
  sx={{ width: '9ch' }}  // 7 chars + 2ch padding
/>
<TextField 
  value={row.value}
  sx={{ width: '10ch' }}  // 8 chars + 2ch padding
/>
```

#### Option C: Hybrid Approach with Min/Max Constraints
```jsx
<TextField 
  value={row.key}
  sx={{ 
    width: '9ch',
    minWidth: '120px',
    maxWidth: '160px'
  }}
/>
```

## Files to Modify

- `client/src/components/Editor/EntryEditModal.jsx` (lines 334-399)
  - Update TextField width styling for key field
  - Update TextField width styling for value field
  - Adjust container layout if needed to maintain positioning

## Success Criteria

- [ ] Key and value fields are appropriately sized for their content (7-8 characters)
- [ ] Horizontal positioning of fields remains unchanged from current layout
- [ ] Fields maintain proper spacing and alignment
- [ ] Borders around fields appear proportional to content
- [ ] Layout remains responsive and readable on different screen sizes
- [ ] No regression in functionality (editing, validation, focus states)

## Implementation Priority

This enhancement improves the visual balance and user experience by making the editable fields more proportional to their content, reducing visual clutter from oversized bordered fields.

## Risk Assessment

**Low Risk**: This is a purely cosmetic change that doesn't affect functionality. The main consideration is ensuring the layout remains visually balanced and the fields stay properly positioned.

## Testing Considerations

- Test with various key/value combinations
- Verify layout on different screen sizes
- Ensure focus states and error states still work correctly
- Check that field positioning matches current layout