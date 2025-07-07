import { useSearch } from './useSearch.jsx';
import useHighlightColors from '../utils/useHighlightColors.js';

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