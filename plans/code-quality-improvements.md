# Code Quality Improvements Plan

## Plan Metadata
- **Status**: Not Started
- **Assignee**: @opencode
- **Type**: Enhancement

## Executive Summary

After analyzing the Mappy codebase, I've identified several opportunities for code quality improvements focusing on code reuse, UI component consolidation, and implementation enhancements. The codebase is well-structured with good separation of concerns through the Agent pattern, but there are opportunities to reduce duplication and improve maintainability.

## Current State Analysis

### Strengths
- **Clean Agent Pattern**: Well-implemented separation of concerns with FileAgent, ParserAgent, LayersAgent, etc.
- **Good Component Structure**: Logical organization with Layout, Editor, and Common component folders
- **Consistent Styling**: Good use of Material-UI with consistent theming
- **Performance Optimizations**: VirtualizedList, memoization, Web Workers for search
- **Type Safety**: Good use of prop validation and consistent interfaces

### Areas for Improvement
- **Code Duplication**: Similar patterns repeated across components
- **UI Component Reuse**: Opportunities to extract reusable components
- **Agent Consolidation**: TargetsAgent and SourcesAgent are nearly identical
- **Styling Consistency**: Some inline styles could be centralized
- **Error Handling**: Could be more consistent across components

## Detailed Improvement Opportunities

### 1. Agent Pattern Consolidation

**Current Issue**: TargetsAgent.js and SourcesAgent.js are nearly identical:
```javascript
// TargetsAgent.js
export function groupTargetsByLayer(data) {
  return groupByLayer(data.Targets || {});
}
export function removeLayerTargets(data, layer) {
  if (data.Targets) removeLayerEntries(data.Targets, layer);
}

// SourcesAgent.js  
export function groupSourcesByLayer(data) {
  return groupByLayer(data.Sources || {});
}
export function removeLayerSources(data, layer) {
  if (data.Sources) removeLayerEntries(data.Sources, layer);
}
```

**Improvement**: Create a generic EntryAgent that handles both targets and sources:
```javascript
// EntryAgent.js
export function groupEntriesByLayer(data, entryType) {
  return groupByLayer(data[entryType] || {});
}
export function removeLayerEntries(data, layer, entryType) {
  if (data[entryType]) removeLayerEntries(data[entryType], layer);
}
```

### 2. UI Component Reuse Opportunities

#### A. TextField with Monospace Font
**Current**: Repeated TextField configurations in EntryEditModal.jsx:
```javascript
<TextField
  // ... props
  InputProps={{
    disableUnderline: true,
    sx: { 
      fontFamily: '"JetBrains Mono", monospace',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      px: 1,
      // ... more styles
    },
  }}
/>
```

**Improvement**: Create MonospaceTextField component:
```javascript
// components/Common/MonospaceTextField.jsx
const MonospaceTextField = ({ error, ...props }) => (
  <TextField
    {...props}
    variant="standard"
    InputProps={{
      disableUnderline: true,
      sx: { 
        fontFamily: '"JetBrains Mono", monospace',
        border: '1px solid',
        borderColor: error ? 'error.main' : 'divider',
        borderRadius: 1,
        px: 1,
        '&:hover': { borderColor: 'text.secondary' },
        '&.Mui-focused': { borderColor: 'primary.main' },
        '&.Mui-error': { borderColor: 'error.main' },
      },
    }}
  />
);
```

#### B. Search Highlighting Logic
**Current**: Search highlighting logic repeated in EntryList.jsx, LayerList.jsx, and EntryEditModal.jsx

**Improvement**: Create useSearchHighlight hook:
```javascript
// hooks/useSearchHighlight.js
export function useSearchHighlight(item) {
  const { query, matchSet, currentResult } = useSearch() || {};
  const { highlight, currentHighlight } = useHighlightColors();
  
  const isMatch = matchSet?.has(item.key);
  const isCurrent = currentResult?.key === item.key;
  
  const styles = {
    ...(isMatch && { bgcolor: highlight }),
    ...(query && !isMatch && { opacity: 0.7 }),
    ...(isCurrent && { bgcolor: currentHighlight }),
  };
  
  return { isMatch, isCurrent, styles };
}
```

#### C. Entry Row Component
**Current**: Similar row rendering logic in multiple components

**Improvement**: Create reusable EntryRow component:
```javascript
// components/Common/EntryRow.jsx
const EntryRow = ({ 
  item, 
  style, 
  selected = false, 
  onClick, 
  editable = false,
  onEdit,
  children 
}) => {
  const { styles } = useSearchHighlight(item);
  
  return (
    <Box style={style} key={item.key}>
      <Box
        onClick={onClick}
        sx={{
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: 0.5,
          borderRadius: 1,
          transition: 'background-color 0.3s',
          cursor: onClick ? 'pointer' : 'default',
          ...(selected && { boxShadow: '0 0 0 2px primary.main inset' }),
          ...styles,
        }}
      >
        {children || (
          <Box sx={{ display: 'flex', width: '100%', px: 2 }}>
            <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>
              {item.key}
            </Box>
            <Box sx={{ width: '40%', fontFamily: '"JetBrains Mono", monospace' }}>
              {item.value}
            </Box>
            <Box sx={{
              width: '20%',
              textAlign: 'right',
              fontFamily: '"JetBrains Mono", monospace',
              color: item.offset === 0 ? 'success.dark' : 'error.dark',
            }}>
              {item.offset}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
```

### 3. Style Consistency Improvements

#### A. Theme Extensions
**Current**: Repeated font family declarations

**Improvement**: Extend MUI theme:
```javascript
// theme.js
const theme = createTheme({
  typography: {
    monospace: {
      fontFamily: '"JetBrains Mono", monospace',
    },
    brand: {
      fontFamily: '"Baloo 2", sans-serif',
      fontWeight: 'bold',
    },
  },
  components: {
    MuiTextField: {
      variants: [
        {
          props: { variant: 'monospace' },
          style: {
            '& .MuiInputBase-root': {
              fontFamily: '"JetBrains Mono", monospace',
            },
          },
        },
      ],
    },
  },
});
```

#### B. Common Style Constants
**Current**: Magic numbers and repeated style objects

**Improvement**: Create style constants:
```javascript
// utils/styleConstants.js
export const SPACING = {
  ITEM_HEIGHT: 36,
  BORDER_RADIUS: 1,
  PADDING: {
    SMALL: 1,
    MEDIUM: 2,
  },
};

export const COLORS = {
  HIGHLIGHT: {
    LIGHT: 'rgba(255, 245, 157, 0.3)',
    DARK: 'rgba(249, 168, 37, 0.15)',
  },
  CURRENT_HIGHLIGHT: {
    LIGHT: 'rgba(255, 245, 157, 0.8)',
    DARK: 'rgba(249, 168, 37, 0.45)',
  },
};
```

### 4. Error Handling Improvements

#### A. Error Boundary Enhancement
**Current**: Basic ErrorBoundary component

**Improvement**: Enhanced error handling with recovery options:
```javascript
// components/Common/ErrorBoundary.jsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    // Log to external service if needed
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Typography>
          <Button variant="contained" onClick={this.handleRetry}>
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}
```

#### B. Async Error Handling
**Current**: Basic try-catch in useMappingEditor

**Improvement**: Centralized error handling with user feedback:
```javascript
// hooks/useErrorHandler.js
export function useErrorHandler() {
  const [error, setError] = useState(null);
  
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: Date.now(),
    });
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
}
```

### 5. Performance Optimizations

#### A. Memoization Improvements
**Current**: Some components could benefit from better memoization

**Improvement**: Strategic use of useMemo and useCallback:
```javascript
// In EntryEditModal.jsx
const validationRegex = useMemo(() => ({
  key: /^\d{2}\.\d{4}$/,
  value: /^[0-9A-Fa-f]{8}$/,
}), []);

const transformedRows = useMemo(() => 
  transformRows(rows), 
  [rows, selected, transformType, adjustAmount, seqStart, seqIncrement, fixedValue, shiftAmount]
);
```

#### B. Bundle Size Optimization
**Current**: All MUI icons imported individually

**Improvement**: Tree-shaking verification and lazy loading:
```javascript
// Use dynamic imports for large components
const EntryEditModal = lazy(() => import('./EntryEditModal.jsx'));

// In component usage
<Suspense fallback={<CircularProgress />}>
  <EntryEditModal {...props} />
</Suspense>
```

## Implementation Priority

### High Priority (Immediate Impact)
1. **Agent Consolidation**: Merge TargetsAgent and SourcesAgent into EntryAgent
2. **MonospaceTextField Component**: Extract reusable text field component
3. **Search Highlighting Hook**: Centralize search highlighting logic
4. **Style Constants**: Extract magic numbers and repeated styles

### Medium Priority (Quality of Life)
1. **EntryRow Component**: Create reusable row component
2. **Error Handling Enhancement**: Improve error boundaries and async error handling
3. **Theme Extensions**: Extend MUI theme with custom variants
4. **Performance Optimizations**: Add strategic memoization

### Low Priority (Nice to Have)
1. **Bundle Size Optimization**: Implement lazy loading for large components
2. **Testing Infrastructure**: Add unit tests for new components
3. **Documentation**: Add JSDoc comments to new utilities
4. **Accessibility**: Enhance keyboard navigation and screen reader support

## Success Criteria

1. **Reduced Code Duplication**: Eliminate duplicate code in agents and components
2. **Improved Maintainability**: Centralized styling and common patterns
3. **Better Performance**: Optimized rendering and bundle size
4. **Enhanced User Experience**: Better error handling and feedback
5. **No Regressions**: All existing functionality preserved

## Risk Assessment

- **Low Risk**: Agent consolidation and component extraction
- **Medium Risk**: Theme modifications and performance optimizations
- **Mitigation**: Thorough testing and gradual rollout of changes

## Estimated Timeline

- **Phase 1** (High Priority): 2-3 days
- **Phase 2** (Medium Priority): 3-4 days  
- **Phase 3** (Low Priority): 2-3 days

**Total Estimated Time**: 7-10 days

## Conclusion

These improvements will significantly enhance code quality, maintainability, and developer experience while preserving all existing functionality. The modular approach allows for incremental implementation with minimal risk of regressions.