# Code Cleanup and Refactoring Plan

## Plan Metadata
- **Status**: Completed
- **Assignee**: @opencode
- **Type**: Enhancement

## Executive Summary

After analyzing the Mappy codebase for unused code, redundant patterns, and refactoring opportunities, I've identified several areas for improvement that will reduce code size, eliminate redundancy, and improve maintainability while maintaining 100% backward compatibility.

## Analysis Results

### 🗑️ Unused Code Identified

1. **Unused Components**:
   - `EntryRow.jsx` - Created but never imported/used
   - `useErrorHandler.js` - Hook created but never used

2. **Unused Imports**:
   - Various components have imports that aren't used

3. **Dead Code**:
   - Some variables and functions that are defined but never used

### 🔄 Redundant Code Patterns

1. **Repeated Hex/Decimal Conversion Logic**:
   - `parseInt(value, 16)` patterns repeated 15+ times
   - `toString(16).toLowerCase().padStart(8, '0')` patterns repeated 10+ times
   - `String(value).padStart(4, '0')` for layer keys repeated 5+ times

2. **Repeated Validation Patterns**:
   - Key validation regex `/^\d{2}\.\d{4}$/` 
   - Value validation regex `/^[0-9A-Fa-f]{8}$/`
   - Hex validation patterns scattered across files

3. **Hardcoded Magic Numbers**:
   - `mb: 0.5` repeated 7+ times
   - `borderRadius: 2` in LayerPathRow
   - Various spacing values not using constants

4. **Repeated Offset Calculation**:
   - `decIndex - hexValue` pattern repeated multiple times

### 🏗️ Refactoring Opportunities

1. **EntryEditModal Complexity** (602 lines):
   - Transform logic can be extracted into custom hooks
   - Validation logic can be centralized
   - UI sections can be split into smaller components

2. **Utility Functions Missing**:
   - Hex/decimal conversion utilities
   - Validation utilities
   - Formatting utilities

3. **Component Optimization**:
   - Some components could benefit from better memoization
   - Event handlers could be optimized

## Detailed Cleanup Plan

### Phase 1: Remove Unused Code

#### A. Remove Unused Files
```bash
# Files to remove:
- src/components/Common/EntryRow.jsx (unused)
- src/hooks/useErrorHandler.js (unused)
```

#### B. Clean Up Unused Imports
- Review all import statements and remove unused ones
- Use ESLint to identify unused variables

### Phase 2: Create Utility Functions

#### A. Hex/Decimal Conversion Utilities
```javascript
// utils/conversionUtils.js
export const formatHexValue = (value) => 
  (value >>> 0).toString(16).toLowerCase().padStart(8, '0');

export const formatLayerKey = (value) => 
  String(value).padStart(4, '0');

export const formatEntryKey = (layer, index) => 
  `${formatLayerKey(layer)}.${formatLayerKey(index)}`;

export const parseHexValue = (hexString) => 
  parseInt(hexString, 16) || 0;

export const parseDecimalValue = (decString) => 
  parseInt(decString, 10) || 0;

export const calculateOffset = (decIndex, hexValue) => 
  decIndex - (typeof hexValue === 'string' ? parseHexValue(hexValue) : hexValue);
```

#### B. Validation Utilities
```javascript
// utils/validationUtils.js
export const VALIDATION_PATTERNS = {
  ENTRY_KEY: /^\d{2}\.\d{4}$/,
  HEX_VALUE: /^[0-9A-Fa-f]{8}$/,
  LAYER_KEY: /^\d{2}$/,
};

export const validateEntryKey = (key) => VALIDATION_PATTERNS.ENTRY_KEY.test(key);
export const validateHexValue = (value) => VALIDATION_PATTERNS.HEX_VALUE.test(value);
export const validateLayerKey = (key) => VALIDATION_PATTERNS.LAYER_KEY.test(key);

export const isValidEntry = (entry) => 
  validateEntryKey(entry.key) && validateHexValue(entry.value);
```

#### C. Entry Transformation Utilities
```javascript
// utils/entryTransformUtils.js
export const transformEntries = {
  shift: (entries, amount) => entries.map(entry => ({
    ...entry,
    key: shiftEntryKey(entry.key, amount)
  })),
  
  adjust: (entries, amount) => entries.map(entry => ({
    ...entry,
    value: formatHexValue(parseHexValue(entry.value) + amount)
  })),
  
  sequential: (entries, start, increment) => 
    entries.map((entry, index) => ({
      ...entry,
      value: formatHexValue(start + (index * increment))
    })),
    
  fixed: (entries, value) => entries.map(entry => ({
    ...entry,
    value: value.toLowerCase()
  }))
};
```

### Phase 3: Extract Custom Hooks

#### A. Entry Transformation Hook
```javascript
// hooks/useEntryTransform.js
export function useEntryTransform(entries, selected) {
  const [transformType, setTransformType] = useState('shift');
  const [transformParams, setTransformParams] = useState({});
  
  const preview = useMemo(() => {
    // Transform logic here
  }, [entries, selected, transformType, transformParams]);
  
  const apply = useCallback(() => {
    // Apply transformation
  }, [entries, selected, transformType, transformParams]);
  
  return {
    transformType,
    setTransformType,
    transformParams,
    setTransformParams,
    preview,
    apply,
    canApply: preview.length > 0
  };
}
```

#### B. Entry Validation Hook
```javascript
// hooks/useEntryValidation.js
export function useEntryValidation(entries) {
  return useMemo(() => {
    const errors = [];
    const warnings = [];
    
    entries.forEach((entry, index) => {
      if (!validateEntryKey(entry.key)) {
        errors.push({ index, field: 'key', message: 'Invalid key format' });
      }
      if (!validateHexValue(entry.value)) {
        errors.push({ index, field: 'value', message: 'Invalid hex value' });
      }
    });
    
    return { errors, warnings, isValid: errors.length === 0 };
  }, [entries]);
}
```

### Phase 4: Split Large Components

#### A. EntryEditModal Breakdown
```javascript
// Split into smaller components:
- EntryEditHeader.jsx (toolbar section)
- EntryEditList.jsx (virtualized list section)  
- EntryEditSidebar.jsx (right sidebar with controls)
- EntryTransformPanel.jsx (transformation controls)
- EntryBatchPanel.jsx (batch add controls)
```

### Phase 5: Update Style Constants

#### A. Add Missing Constants
```javascript
// utils/styleConstants.js - additions
export const SPACING = {
  // ... existing
  MARGIN_SMALL: 0.5,
  BORDER_RADIUS_LARGE: 2,
};

export const VALIDATION = {
  PATTERNS: {
    ENTRY_KEY: /^\d{2}\.\d{4}$/,
    HEX_VALUE: /^[0-9A-Fa-f]{8}$/,
    LAYER_KEY: /^\d{2}$/,
  }
};
```

### Phase 6: Performance Optimizations

#### A. Better Memoization
- Add `useMemo` for expensive calculations
- Optimize `useCallback` usage
- Add `memo` to pure components

#### B. Event Handler Optimization
- Extract event handlers to avoid recreation
- Use stable references where possible

## Implementation Priority

### High Priority (Immediate Cleanup)
1. **Remove unused files** - EntryRow.jsx, useErrorHandler.js
2. **Create utility functions** - conversion, validation, transformation
3. **Update style constants** - eliminate remaining magic numbers
4. **Clean unused imports** - remove dead code

### Medium Priority (Refactoring)
1. **Extract transformation logic** - create custom hooks
2. **Split EntryEditModal** - break into smaller components
3. **Add validation utilities** - centralize validation logic
4. **Performance optimizations** - better memoization

### Low Priority (Polish)
1. **Component optimization** - fine-tune performance
2. **Code documentation** - add JSDoc comments
3. **Type safety improvements** - better prop validation

## Success Criteria

1. **Reduced Bundle Size**: Eliminate unused code (estimated 5-10% reduction)
2. **Improved Maintainability**: Centralized utilities and validation
3. **Better Performance**: Optimized rendering and calculations
4. **Code Consistency**: All magic numbers replaced with constants
5. **No Regressions**: All existing functionality preserved

## Risk Assessment

- **Low Risk**: Utility creation and unused code removal
- **Medium Risk**: Component splitting and hook extraction
- **Mitigation**: Incremental changes with thorough testing

## Estimated Impact

- **Lines of Code Reduction**: ~200-300 lines
- **File Count Reduction**: 2 unused files removed
- **Maintainability**: Significantly improved
- **Performance**: 5-15% improvement in complex operations
- **Bundle Size**: 3-8% reduction

## Timeline

- **Phase 1** (Cleanup): 1 day
- **Phase 2** (Utilities): 1-2 days
- **Phase 3** (Hooks): 1-2 days
- **Phase 4** (Component Split): 2-3 days
- **Phase 5** (Constants): 0.5 days
- **Phase 6** (Performance): 1-2 days

**Total Estimated Time**: 6-10 days

## Conclusion

This cleanup and refactoring plan will significantly improve code quality, reduce redundancy, and enhance maintainability while preserving all existing functionality. The modular approach allows for safe, incremental implementation with minimal risk.