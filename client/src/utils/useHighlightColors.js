import { useTheme } from '@mui/material/styles';
import { COLORS } from './styleConstants.js';

export default function useHighlightColors() {
  const theme = useTheme();
  const highlight = theme.palette.mode === 'light'
    ? COLORS.HIGHLIGHT.LIGHT
    : COLORS.HIGHLIGHT.DARK;
  const currentHighlight = theme.palette.mode === 'light'
    ? COLORS.CURRENT_HIGHLIGHT.LIGHT
    : COLORS.CURRENT_HIGHLIGHT.DARK;
  return { highlight, currentHighlight };
}
