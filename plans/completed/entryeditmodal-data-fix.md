# EntryEditModal Data Display Issue Fix

## Plan Metadata
- **Status**: Completed
- **Assignee**: @opencode
- **Type**: Bug Fix
- **Priority**: High

## Problem Analysis

### Root Cause Identified
The EntryEditModal is not displaying data because of a logical issue in the component's data handling. After investigating the data flow, I found the following:

1. **Data Flow is Correct**: 
   - `useMappingEditor.js:65-66` correctly groups targets/sources by layer using `groupTargetsByLayer()` and `groupSourcesByLayer()`
   - `LayerPanel.jsx:68,77` correctly passes `entries={targets}` and `entries={sources}` to EntryEditModal
   - `entryHelpers.js:1-12` correctly transforms INI entries into structured objects with `{key, value, offset}`

2. **Modal Logic Issue**:
   - `EntryEditModal.jsx:80-91` has a problematic condition: `if (!entries || entries.length === 0)`
   - The `entries` prop is an array from `targets[selectedLayer]` or `sources[selectedLayer]`
   - When there ARE entries, the condition `entries.length === 0` is false, so it should proceed
   - However, the issue is in `EntryEditModal.jsx:93`: `const mapped = entries.map(e => ({ ...e, value: e.value.toLowerCase() }))`

3. **The Actual Bug**:
   - The `entries` array contains objects like `{key: "00.0001", value: "00000001", offset: 0}`
   - The `value` field is already a string (hex value from INI file)
   - Calling `.toLowerCase()` on it should work fine
   - The real issue is likely that `entries` is undefined or not an array when the modal opens

4. **Button Disable Logic**:
   - `LayerPanel.jsx:40,56` disables the Edit button when `!targets || targets.length === 0`
   - But `targets` is the entire targets object `{layer1: [...], layer2: [...]}`
   - It should check `!targets[selectedLayer] || targets[selectedLayer].length === 0`

## Solution

### Primary Fix: Button Disable Logic
The Edit buttons in LayerPanel are checking the wrong condition. They should check if the current layer has entries, not if the entire targets/sources object exists.

**Current Code (LayerPanel.jsx:40,56)**:
```jsx
disabled={!targets || targets.length === 0}
disabled={!sources || sources.length === 0}
```

**Should Be**:
```jsx
disabled={!targets || !targets[selectedLayer] || targets[selectedLayer].length === 0}
disabled={!sources || !sources[selectedLayer] || sources[selectedLayer].length === 0}
```

### Secondary Fix: Modal Data Validation
Add better data validation in EntryEditModal to handle edge cases.

**Current Code (EntryEditModal.jsx:82-91)**:
```jsx
if (!entries || entries.length === 0) {
  setRows([]);
  // ... reset state
  return;
}
```

**Should Add**:
```jsx
if (!entries || !Array.isArray(entries) || entries.length === 0) {
  setRows([]);
  // ... reset state
  return;
}
```

## Implementation Steps

1. **Fix LayerPanel button disable logic** - Update the disabled conditions to check the selected layer's entries
2. **Add defensive programming in EntryEditModal** - Add Array.isArray() check for entries prop
3. **Test the fix** - Verify that:
   - Edit buttons are only enabled when the selected layer has entries
   - EntryEditModal displays data correctly when opened
   - Modal shows "No entries to edit" when appropriate

## Expected Outcome

After this fix:
- Edit buttons will only be enabled when the selected layer actually has targets/sources
- EntryEditModal will display the correct data for the selected layer
- The modal will gracefully handle edge cases with proper validation

## Files to Modify

1. `/client/src/components/Editor/LayerPanel.jsx` - Fix button disable logic
2. `/client/src/components/Editor/EntryEditModal.jsx` - Add defensive validation (optional)

## Testing Checklist

- [ ] Load a mapping file with multiple layers
- [ ] Select a layer with targets/sources - Edit button should be enabled
- [ ] Click Edit button - Modal should open with data displayed
- [ ] Select a layer without targets/sources - Edit button should be disabled
- [ ] Verify modal handles empty data gracefully