# Layer Context Menu Removal and Delete Button Addition

## Plan Metadata
- **Status**: Completed
- **Priority**: High
- **Created**: 2025-01-07
- **Last Updated**: 2025-01-07
- **Assignee**: @opencode
- **Type**: Feature

## Current State Analysis

The LayerList component (`client/src/components/Editor/LayerList.jsx`) currently implements a context menu system for layer deletion:

### Current Implementation:
- **Context menu trigger**: Three-dot icon button (MoreVertIcon) on hover (lines 69-91)
- **Menu component**: Material-UI Menu with delete option (lines 196-208)
- **Confirmation dialog**: Delete confirmation dialog (lines 209-223)
- **State management**: `menuPosition`, `activeMenuLayer`, `confirmLayer` states (lines 28-30)

### Current Delete Flow:
1. User hovers over layer → three-dot button appears
2. User clicks three-dot button → context menu opens
3. User clicks "Delete Layer" → confirmation dialog opens
4. User confirms → layer is deleted

## Proposed Solution

Replace the context menu system with a dedicated red delete button positioned next to the "Add Layer" button in the LayerPathRow component.

### New Delete Flow:
1. User sees red delete button next to "Add Layer" button
2. User clicks delete button → confirmation dialog opens
3. User confirms → currently selected layer is deleted

## Implementation Details

### 1. Remove Context Menu from LayerList
**File**: `client/src/components/Editor/LayerList.jsx`

**Remove the following:**
- Import statements: `Menu`, `MenuItem`, `ListItemIcon`, `MoreVertIcon` (lines 6-8, 16)
- State variables: `menuPosition`, `activeMenuLayer` (lines 28-29)
- Three-dot icon button in renderRow (lines 69-91)
- Menu component (lines 196-208)
- Menu-related handlers: `handleMenuClose`, `handleDeleteClick` (lines 140-153)

**Keep:**
- `confirmLayer` state and confirmation dialog (lines 30, 209-223)
- `confirmDelete` function (lines 155-158)
- `onDelete` prop and error handling

### 2. Add Delete Button to LayerPathRow
**File**: `client/src/components/Editor/LayerPathRow.jsx`

**Modifications:**
- Add new prop: `onDelete` function
- Add new prop: `selectedLayer` for context
- Add red delete button next to "Add Layer" button
- Import DeleteIcon from Material-UI

**New button implementation:**
```jsx
<Button
  variant="contained"
  color="error"
  onClick={onDelete}
  startIcon={<DeleteIcon />}
  sx={{ whiteSpace: 'nowrap' }}
  disabled={!selectedLayer} // Disable if no layer selected
>
  Delete Layer
</Button>
```

### 3. Update Parent Components
**File**: `client/src/components/Editor/LayerPanel.jsx`
- Pass `onDeleteLayer` prop to LayerPathRow
- Pass `selectedLayer` prop to LayerPathRow

**File**: `client/src/App.jsx`
- Ensure `handleRemoveLayer` is properly connected

### 4. Move Confirmation Dialog
**Option A**: Keep dialog in LayerList, trigger via prop
**Option B**: Move dialog to LayerPathRow for better locality

Recommend **Option A** to minimize changes and maintain existing error handling.

## Files to Modify

1. **`client/src/components/Editor/LayerList.jsx`**
   - Remove context menu imports and components
   - Remove menu-related state and handlers
   - Simplify renderRow function
   - Keep confirmation dialog and delete logic

2. **`client/src/components/Editor/LayerPathRow.jsx`**
   - Add onDelete and selectedLayer props
   - Add DeleteIcon import
   - Add red delete button next to Add Layer button

3. **`client/src/components/Editor/LayerPanel.jsx`**
   - Pass onDeleteLayer to LayerPathRow
   - Pass selectedLayer to LayerPathRow

## Code Cleanup Scope

### Remove from LayerList.jsx:
- Lines 6-8, 16: Menu-related imports
- Lines 28-29: `menuPosition`, `activeMenuLayer` state
- Lines 69-91: Three-dot icon button in renderRow
- Lines 140-153: `handleMenuClose`, `handleDeleteClick` functions
- Lines 196-208: Menu component

### Simplify in LayerList.jsx:
- renderRow function (remove menu button and hover effects)
- Component state (only keep `confirmLayer`)

## Success Criteria

- [ ] Context menu system completely removed from LayerList
- [ ] Red delete button appears next to "Add Layer" button
- [ ] Delete button is properly styled and positioned
- [ ] Delete functionality works for currently selected layer
- [ ] Confirmation dialog still appears before deletion
- [ ] Error handling preserved (cannot delete last layer)
- [ ] No unused imports or dead code remaining
- [ ] UI layout remains clean and intuitive

## Benefits

1. **Simplified UX**: Direct delete action instead of hidden context menu
2. **Better discoverability**: Delete button is always visible
3. **Reduced complexity**: Eliminates hover states and menu positioning
4. **Consistent placement**: Delete action near other layer controls
5. **Cleaner code**: Removes complex menu state management

## Implementation Priority

High priority as this simplifies the user interface and removes unnecessary complexity while maintaining all functionality.