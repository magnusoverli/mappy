export const SPACING = {
  ITEM_HEIGHT: 36,
  BORDER_RADIUS: 1,
  BORDER_RADIUS_LARGE: 2,
  MARGIN_SMALL: 0.5,
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

export const FONTS = {
  MONOSPACE: '"JetBrains Mono", monospace',
  BRAND: '"Baloo 2", sans-serif',
};

export const FIELD_STYLES = {
  MONOSPACE_INPUT: {
    fontFamily: FONTS.MONOSPACE,
    border: '1px solid transparent',
    borderRadius: SPACING.BORDER_RADIUS,
    px: SPACING.PADDING.SMALL,
    py: '4px',
    backgroundColor: 'transparent',
    cursor: 'text',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'action.hover',
      borderColor: 'divider',
    },
    '&.Mui-focused': {
      backgroundColor: 'action.selected',
      borderColor: 'primary.main',
      outline: 'none',
      boxShadow: theme => `0 0 0 1px ${theme.palette.primary.main}25`,
    },
    '&.Mui-error': {
      borderColor: 'error.main',
      backgroundColor: theme => theme.palette.mode === 'dark' 
        ? 'rgba(244, 67, 54, 0.05)' 
        : 'rgba(244, 67, 54, 0.02)',
      '&:hover': {
        borderColor: 'error.main',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(244, 67, 54, 0.08)' 
          : 'rgba(244, 67, 54, 0.04)',
      },
      '&.Mui-focused': {
        borderColor: 'error.main',
        backgroundColor: theme => theme.palette.mode === 'dark' 
          ? 'rgba(244, 67, 54, 0.1)' 
          : 'rgba(244, 67, 54, 0.06)',
        boxShadow: theme => `0 0 0 1px ${theme.palette.error.main}25`,
      },
    },
  },
};

export const VALIDATION = {
  PATTERNS: {
    ENTRY_KEY: /^\d{2}\.\d{4}$/,
    HEX_VALUE: /^[0-9A-Fa-f]{8}$/,
    LAYER_KEY: /^\d{2}$/,
  }
};