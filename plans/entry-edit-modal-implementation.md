# EntryEditModal Implementation Plan

## Plan Metadata
- **Status**: In Progress
- **Assignee**: @opencode
- **Type**: Feature
- **Priority**: High
- **Estimated Effort**: 3-4 days

## Overview
Implement a sophisticated EntryEditModal component for managing key-value pairs with hexadecimal values in the mapping application. The modal provides comprehensive tools for viewing, selecting, adding, deleting, and transforming entries with an intuitive three-panel layout.

## Current State Analysis

### Existing Reusable Components
- **DataTable.jsx**: Perfect foundation for left panel data display with key-value-offset columns
- **VirtualizedList.jsx**: Handles performance requirements for large datasets
- **SearchField.jsx**: Can be adapted for real-time entry filtering
- **MonospaceTextField.jsx**: Ideal for hex value inputs and key fields
- **Header.jsx**: Brand styling and layout patterns to reuse
- **AppToolbar.jsx**: Consistent toolbar styling approach

### Theme Integration
- App already has light/dark theme support via `mode` and `toggleMode` props
- Material-UI theme system is properly configured
- Existing components follow theme conventions

### Validation Infrastructure
- `validationUtils.js` exists for format-specific validation rules
- `conversionUtils.js` available for data transformations
- `entryHelpers.js` provides common operations

## Implementation Strategy

### Phase 1: Core Modal Structure (Day 1)
1. **Create EntryEditModal Component**
   - Modal container with 65% × 85% viewport dimensions
   - Semi-transparent backdrop with blur effect
   - Smooth slide-down animation (300ms)
   - Three-panel layout structure

2. **Header Bar Implementation**
   - Reuse Header.jsx brand styling for "Mappy" logo
   - Purple gradient background (#283593 to #8e24aa)
   - 64px fixed height
   - White text throughout
   - Layer information display: "{LayerName} - Editing {Targets/Sources}" (centered)
   - Close button with white X icon (far right, cancels all changes)

3. **Footer Bar Implementation**
   - Top border separator with consistent padding
   - Progress indicator (left-aligned, appears only during processing):
     - 40px diameter circular with 4px thickness
     - Centered percentage text
     - Primary blue theme color
   - Action buttons (right-aligned):
     - Cancel: Gray outlined, discards changes, disabled during processing
     - Save: Blue contained, applies changes, disabled when no changes or processing
     - Save only enabled when modifications exist

### Phase 2: Left Panel - Data Display (Day 1-2)
1. **Enhanced DataTable Integration**
   - Extend existing DataTable.jsx for selection capabilities
   - Table header with specific column widths: Key (35%), Value (35%), Offset (30%)
   - Selection instructions: "Click to select • Ctrl+click to toggle • Shift+click to select range" (small gray text)
   - Add multi-selection support (single, ctrl+click, shift+click)
   - Implement selection visual feedback (blue highlighting, checkmarks ✓ in selection column)
   - Custom row renderer with selection state and hover effects
   - Fixed row height for virtualized scrolling performance
   - Monospace font for all data columns
   - Offset column: green text for offset = 0, red text for offset ≠ 0, right-aligned
   - Custom scrollbar styling with auto-hiding scrollbars that appear on hover

2. **Empty State Component**
   - "No entries to edit" message (large text)
   - Subtitle: "Add some entries using the controls on the right to get started."
   - Centered vertically and horizontally when no data exists

3. **Search Integration**
   - Real-time search field in header that filters entries as user types
   - Search across keys, values, and offset columns
   - Case-insensitive filtering with immediate visual feedback
   - Filtered results update immediately in table

### Phase 3: Right Panel - Control Panel (Day 2-3)
**Fixed width: 450px**

1. **Add Entries Section**
   - Section header: "Add Entries" with subtitle "Suggested values based on existing entries"
   - Form fields (all with monospace font):
     - Quantity: Number input, range 0-1000, default 1
     - First Key: Number input, range 0-9999, auto-populated with next available key
     - Offset: Number input, auto-populated based on existing patterns
   - Error display: Red alert box with specific error messages (conflicts, range violations)
   - ADD BATCH button: Blue contained with plus icon, disabled when quantity=0 or processing
   - DELETE SELECTED button: Red outlined with delete icon, disabled when no selection or processing

2. **Transform Selected Entries Section**
   - Section header: "Transform Selected Entries (X selected)" where X is count
   - Minimum selection requirement: Show "Select 2 or more entries to enable transformations." when <2 selected
   - Hide all transform controls when <2 entries selected
   - Transform type dropdown with exact options:
     - "Shift Keys Up/Down" - Move entry keys by specified amount. Direction defined by negative/positive number.
     - "Shift Values Up/Down" - Add/subtract from hex values. Direction defined by negative/positive number.
     - "Number Values in Order" - Set sequential numeric values
     - "Set Same Value for All" - Apply identical hex value to all
   - Context-sensitive help text below dropdown
   - Dynamic parameter fields:
     - For Shift: "Move by" field (positive/negative number)
     - For Number Values: "Start counting from" + "Count by" fields (show hex equivalents below)
     - For Set Same Value: "Hex value" field (8-character hex with real-time validation, red border for invalid)
   - Real-time conflict detection with red alert box listing specific conflicts

3. **Preview System**
   - Header: "What will happen:"
   - Preview box with monospace font
   - Shows up to 10 transformation previews
   - Format: "oldKey = oldValue → newKey = newValue" with arrow icons
   - Scrollable if many changes
   - Shows "...and X more entries" if over 5 changes
   - Apply button: Full-width blue, text "Apply to X entries", disabled if conflicts or no preview
   - Disabled during processing

### Phase 4: Advanced Features (Day 3-4)
1. **Selection Management**
   - Multi-selection state management
   - Selection persistence during operations
   - Visual feedback and count tracking

2. **Batch Operations**
   - Progress tracking for long-running operations
   - Conflict detection and resolution
   - Smart defaults and auto-population

3. **Validation & Error Handling**
   - **Hex Values**: Must be exactly 8 characters, valid hexadecimal
   - **Key Ranges**: Entry keys must be within 0-9999 range
   - **Quantity Limits**: Batch operations limited to 1000 entries maximum
   - **Duplicate Prevention**: Prevents creation of duplicate entry keys
   - **Error Display Types**:
     - Inline errors: Field-level validation with red borders and helper text
     - Alert boxes: Section-level errors with detailed messages
     - Conflict lists: Specific enumeration of conflicting operations
   - **Processing States**: Loading indicators, disabled states, cancellation support
   - **Recovery**: Graceful handling of operation failures

4. **Performance Optimizations**
   - Virtualized scrolling for large datasets
   - Debounced search and validation
   - Efficient re-rendering strategies

## Technical Implementation Details

### Component Architecture
```
EntryEditModal/
├── EntryEditModal.jsx (main container)
├── components/
│   ├── ModalHeader.jsx (header bar)
│   ├── ModalFooter.jsx (footer with buttons)
│   ├── DataPanel.jsx (left panel - enhanced DataTable)
│   ├── ControlPanel.jsx (right panel container)
│   ├── AddEntriesSection.jsx
│   ├── TransformSection.jsx
│   ├── PreviewBox.jsx
│   └── SelectableDataRow.jsx (custom row with selection)
├── hooks/
│   ├── useEntrySelection.js (selection state management)
│   ├── useEntryTransform.js (transformation logic)
│   └── useEntryValidation.js (validation rules)
└── utils/
    ├── entryTransformations.js (transform algorithms)
    └── entryConflictDetection.js (conflict checking)
```

### Data Flow
1. **Props Interface**: `{ open, onClose, layerData, entryType, onSave }`
2. **State Management**: Local state for selections, transformations, and form data
3. **Agent Integration**: Use existing LayersAgent for data operations
4. **Validation Pipeline**: Real-time validation with immediate feedback

### Reusable Component Extensions

#### Enhanced DataTable
- Add selection capabilities to existing DataTable.jsx
- Maintain backward compatibility with current usage
- New props: `selectable`, `selectedItems`, `onSelectionChange`

#### Selectable Row Component
- Extend DefaultRow from DataTable.jsx
- Add selection visual feedback
- Handle click events for multi-selection patterns

#### Modal Search Field
- Create variant of SearchField.jsx for modal context
- Remove global search context dependency
- Add local filtering capabilities

### Integration Points

#### Theme Integration
- Use existing theme mode from App.jsx
- Follow Material-UI theme conventions
- Consistent color scheme with main application

#### Agent Integration
- **LayersAgent**: CRUD operations for entries
- **ParserAgent**: Data validation and formatting
- **StorageAgent**: Session persistence if needed

#### Validation Integration
- Extend `validationUtils.js` with entry-specific rules
- Use `conversionUtils.js` for hex/decimal conversions
- Leverage `entryHelpers.js` for common operations

## Detailed Specifications

### Modal Appearance Requirements
- **Dimensions**: Exactly 65% viewport width × 85% viewport height
- **Background**: Semi-transparent dark backdrop with blur effect (backdrop-filter: blur(4px))
- **Animation**: Smooth slide-down entrance animation (300ms transition)
- **Border**: Rounded corners with modern Material Design styling
- **Theme**: Must follow user-set light/dark theme from main UI

### Header Bar Specifications
- **Background**: Purple gradient (from #283593 to #8e24aa)
- **Height**: 64px fixed height
- **Text Color**: White text throughout
- **Layout**: Brand logo (left) → Layer info (center) → Close button (right)

### Left Panel Data Table Specifications
- **Column Widths**: Key (35%), Value (35%), Offset (30%)
- **Selection Instructions**: "Click to select • Ctrl+click to toggle • Shift+click to select range"
- **Selection Visual**: Blue background/border, checkmark (✓) in selection column
- **Offset Colors**: Green for offset = 0, red for offset ≠ 0, right-aligned
- **Font**: Monospace for all data columns
- **Performance**: Virtualized scrolling with custom scrollbar styling

### Right Panel Control Specifications
- **Width**: Fixed 450px width
- **Add Entries**: Quantity (0-1000, default 1), First Key (0-9999), Offset fields
- **Transform Types**: Exact 4 options with specific descriptions
- **Minimum Selection**: Hide transforms when <2 entries selected
- **Preview Format**: "oldKey = oldValue → newKey = newValue" with arrows
- **Preview Limits**: Up to 10 previews, "...and X more" if over 5
- **Real-time Validation**: Hex values, conflicts, all must update immediately

### Footer Bar Specifications
- **Progress Indicator**: 40px diameter, 4px thickness, percentage display
- **Button States**: Cancel (gray outlined), Save (blue contained)
- **Save Enablement**: Only when modifications exist, disabled during processing

### Interaction Pattern Requirements
- **Search**: Real-time filtering across all columns, case-insensitive
- **Selection**: Single click, Ctrl+click toggle, Shift+click range
- **Validation**: All validation must be real-time with immediate feedback
- **Conflict Detection**: Real-time updates with specific conflict messages
- **Processing States**: Progress indicators, disabled states, cancellation support

## Success Criteria

### Functional Requirements
- ✅ Modal opens with correct dimensions and animations
- ✅ Three-panel layout matches specification exactly
- ✅ Multi-selection works with all interaction patterns
- ✅ All four transformation types function correctly
- ✅ Real-time validation prevents invalid operations
- ✅ Preview system shows accurate transformation results
- ✅ Batch operations handle large datasets efficiently
- ✅ Theme integration works in both light and dark modes

### Performance Requirements
- ✅ Handles 1000+ entries without performance degradation
- ✅ Search filtering responds within 100ms
- ✅ Transformation previews update in real-time
- ✅ Virtualized scrolling maintains smooth performance

### User Experience Requirements
- ✅ Intuitive selection patterns match standard conventions
- ✅ Error messages are clear and actionable
- ✅ Progress indicators show during long operations
- ✅ Smart defaults reduce user input requirements
- ✅ Conflict detection prevents data corruption

## Risk Assessment

### Technical Risks
- **Performance**: Large dataset handling - *Mitigated by virtualization*
- **Complexity**: Multi-selection state management - *Use proven patterns*
- **Validation**: Real-time conflict detection - *Incremental validation approach*

### Integration Risks
- **Theme Compatibility**: Ensure consistent styling - *Follow existing patterns*
- **Agent Dependencies**: Maintain clean interfaces - *Use existing agent patterns*
- **Component Reuse**: Avoid breaking existing functionality - *Backward compatibility*

## Testing Strategy

### Unit Tests
- Selection state management
- Transformation algorithms
- Validation rules
- Conflict detection

### Integration Tests
- Modal opening/closing
- Data flow between panels
- Agent integration
- Theme switching

### User Acceptance Tests
- Complete user workflows
- Performance with large datasets
- Error handling scenarios
- Accessibility compliance

## Deployment Considerations

### Code Organization
- Follow existing project structure
- Maintain component modularity
- Use consistent naming conventions

### Documentation
- Component API documentation
- Usage examples
- Integration guidelines

### Backward Compatibility
- Ensure existing DataTable usage continues working
- Maintain agent interface contracts
- Preserve theme system integration

## Future Enhancements

### Phase 2 Features (Future)
- Undo/Redo functionality
- Keyboard shortcuts
- Export/Import capabilities
- Advanced filtering options
- Bulk validation tools

### Performance Optimizations
- Web Workers for heavy computations
- Incremental rendering
- Memory usage optimization
- Caching strategies

This implementation plan provides a comprehensive roadmap for creating the EntryEditModal while maximizing reuse of existing components and maintaining consistency with the current application architecture.