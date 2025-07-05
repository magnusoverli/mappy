import { useTheme } from '@mui/material/styles';

export default function useHighlightColors() {
  const theme = useTheme();
  const highlight = theme.palette.mode === 'light'
    ? 'rgba(255, 245, 157, 0.3)'
    : 'rgba(249, 168, 37, 0.15)';
  const currentHighlight = theme.palette.mode === 'light'
    ? 'rgba(255, 245, 157, 0.8)'
    : 'rgba(249, 168, 37, 0.45)';
  return { highlight, currentHighlight };
}
