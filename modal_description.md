# EntryEditModal - Complete User Interface Description

## Overview
The EntryEditModal is a sophisticated data editing interface designed for managing key-value pairs with hexadecimal values in a mapping application. It provides comprehensive tools for viewing, selecting, adding, deleting, and transforming entries in an intuitive and efficient manner.
**The modal must use the theme for application and follow the user-set light/dark theme from the main UI.

## Modal Structure and Layout

### Modal Dimensions and Appearance
- **Size**: 65% viewport width × 85% viewport height
- **Background**: Semi-transparent dark backdrop with blur effect (backdrop-filter: blur(4px))
- **Animation**: Smooth slide-down entrance animation (300ms transition)
- **Border**: Rounded corners with modern Material Design styling

### Three-Panel Layout
The modal is divided into three distinct sections:
1. **Header Bar** (top)
2. **Main Content Area** (middle, split into left and right panels)
3. **Footer Bar** (bottom)

## Header Bar

### Visual Design
- **Background**: Purple gradient (from #283593 to #8e24aa)
- **Height**: 64px fixed height
- **Text Color**: White text throughout

### Header Components (left to right) - Reuse main ui header if possible.
1. **Brand Logo**: "Mappy" in bold brand font
2. **Layer Information**:
   - Centered text showing current layer name and entry type
   - Format: "{LayerName} - Editing {Targets/Sources}"
3. **Close Button**:
   - White X icon
   - Positioned at far right
   - Cancels all changes and closes modal

## Main Content Area

### Left Panel - Data Table

#### Empty State
When no entries exist:
- **Message**: "No entries to edit" (large text)
- **Subtitle**: "Add some entries using the controls on the right to get started."
- **Layout**: Centered vertically and horizontally

#### Data Table Structure
When entries exist, displays a virtualized table with:

**Table Header**:
- **Key Column** (35% width): Shows entry keys in monospace font
- **Value Column** (35% width): Shows hexadecimal values in monospace font
- **Offset Column** (30% width): Shows calculated offset values
  - Green text for offset = 0
  - Red text for offset ≠ 0
  - Right-aligned

**Selection Instructions**:
Small gray text below header: "Click to select • Ctrl+click to toggle • Shift+click to select range"

**Data Rows**:
- **Height**: Fixed height for performance (virtualized scrolling)
- **Selection Visual**:
  - Selected rows have blue background and border
  - Checkmark (✓) appears in selection column when selected
  - Hover effect on all rows
- **Font**: Monospace font for all data columns
- **Interaction**:
  - Single click: Select only this entry
  - Ctrl+click: Toggle this entry's selection
  - Shift+click: Select range from last selected to this entry

**Performance Features**:
- Virtualized scrolling for handling large datasets
- Smooth scrolling with custom scrollbar styling
- Auto-hiding scrollbars that appear on hover

### Right Panel - Control Panel (450px width)

#### Add Entries Section

**Section Header**: "Add Entries" with subtitle "Suggested values based on existing entries"

**Form Fields**:
1. **Quantity Field**:
   - Number input with validation
   - Range: 0-1000 entries
   - Default: 1
   - Monospace font

2. **First Key Field**:
   - Number input for starting key index
   - Range: 0-9999
   - Auto-populated with smart default (next available key)
   - Monospace font

3. **Offset Field**:
   - Number input for value offset calculation
   - Auto-populated based on existing entry patterns
   - Monospace font

**Error Display**:
- Red alert box appears below fields if validation fails
- Shows specific error messages (conflicts, range violations, etc.)

**Action Buttons**:
- **ADD BATCH Button**:
  - Blue contained button with plus icon
  - Disabled when quantity is 0 or processing
  - Creates new entries with sequential keys and calculated values
- **DELETE SELECTED Button**:
  - Red outlined button with delete icon
  - Disabled when no entries selected or processing
  - Removes all selected entries

#### Transform Selected Entries Section

**Section Header**: "Transform Selected Entries (X selected)" where X is the count

**Minimum Selection Requirement**:
When fewer than 2 entries selected:
- Shows message: "Select 2 or more entries to enable transformations."
- All transform controls are hidden

**Transform Type Selector**:
Dropdown menu with options:
- "Shift Keys Up/Down" - Move entry keys by specified amount. Direction defined by negative/positive number.
- "Shift Values Up/Down" - Add/subtract from hex values. Direction defined by negative/positive number.
- "Number Values in Order" - Set sequential numeric values
- "Set Same Value for All" - Apply identical hex value to all

**Help Text**:
Context-sensitive explanation appears below dropdown based on selected transform type.

**Dynamic Parameter Fields**:

*For Shift Keys/Values*:
- **Move by** field: Number input for shift amount (positive or negative)

*For Number Values in Order*:
- **Start counting from** field: Starting value for sequence
  - Shows hex equivalent below field
- **Count by** field: Increment amount for sequence
  - Shows hex equivalent below field

*For Set Same Value*:
- **Hex value** field: 8-character hex input with validation
- **Validation**: Red border and error message for invalid hex format. Must be real time updated.

**Conflict Detection**:
- Red alert box appears when conflicts are detected. Must be real time updated
- Lists specific conflict messages
- Prevents transformation until resolved

**Preview Section**:
- **Header**: "What will happen:"
- **Preview Box**:
  - Monospace font
  - Shows up to 10 transformation previews
  - Format: "oldKey = oldValue → newKey = newValue"
  - Arrow icons between old and new values
  - Scrollable if many changes
  - Shows "...and X more entries" if over 5 changes
- **Apply Button**:
  - Full-width blue button
  - Text: "Apply to X entries" where X is selection count
  - Disabled if no preview or conflicts exist
  - Disabled during processing

## Footer Bar

### Layout and Styling
- **Border**: Top border separator
- **Padding**: Consistent spacing around content
- **Alignment**: Right-aligned button group with left-aligned progress indicator

### Progress Indicator
Appears only during processing operations:
- **Circular Progress**: 40px diameter with 4px thickness
- **Percentage Display**: Centered text showing completion percentage
- **Color**: Primary blue theme color
- **Position**: Left side of footer

### Action Buttons (right-aligned)
1. **Cancel Button**:
   - Gray outlined button
   - Discards all changes and closes modal
   - Disabled during processing operations

2. **Save Button**:
   - Blue contained button
   - Applies all changes and closes modal
   - Disabled when no changes made or during processing
   - Only enabled when modifications exist

## User Interaction Patterns

### Search and Filtering
- **Real-time Search**: Filters entries as user types in header search field
- **Search Scope**: Searches across keys, values, and offset columns
- **Case Insensitive**: Search is not case-sensitive
- **Visual Feedback**: Filtered results update immediately in table

### Selection Management
- **Visual Feedback**: Selected entries have distinct blue highlighting
- **Multi-selection**: Supports various selection patterns (single, multi, range)
- **Count Display**: Current selection count shown in transform section header

### Batch Operations
- **Smart Defaults**: Form fields auto-populate with intelligent suggestions
- **Validation**: Real-time validation with immediate error feedback
- **Progress Tracking**: Visual progress indicator for long-running operations
- **Conflict Prevention**: Prevents operations that would create duplicate keys

### Data Transformation
- **Preview System**: Shows exact changes before applying transformations
- **Conflict Detection**: Identifies and prevents problematic transformations
- **Undo Prevention**: No undo system - users must use Cancel to discard changes
- **Batch Processing**: Handles large transformations with progress indication

### Performance Optimizations
- **Virtualized Scrolling**: Handles thousands of entries efficiently
- **Debounced Operations**: Search and validation operations are optimized
- **Memory Management**: Efficient data structures for large datasets
- **Responsive Updates**: UI remains responsive during heavy operations

## Error Handling and Validation

### Input Validation
- **Hex Values**: Must be exactly 8 characters, valid hexadecimal
- **Key Ranges**: Entry keys must be within 0-9999 range
- **Quantity Limits**: Batch operations limited to 1000 entries maximum
- **Duplicate Prevention**: Prevents creation of duplicate entry keys

### Error Display
- **Inline Errors**: Field-level validation with red borders and helper text
- **Alert Boxes**: Section-level errors with detailed messages
- **Conflict Lists**: Specific enumeration of conflicting operations
- **User-Friendly Messages**: Clear, actionable error descriptions

### Processing States
- **Loading Indicators**: Progress circles with percentage completion
- **Disabled States**: Buttons and inputs disabled during processing
- **Cancellation**: Users can cancel operations that haven't been saved
- **Recovery**: Graceful handling of operation failures