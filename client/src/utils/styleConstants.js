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

export const FONTS = {
  MONOSPACE: '"JetBrains Mono", monospace',
  BRAND: '"Baloo 2", sans-serif',
};

export const FIELD_STYLES = {
  MONOSPACE_INPUT: {
    fontFamily: FONTS.MONOSPACE,
    border: '1px solid',
    borderColor: 'divider',
    borderRadius: SPACING.BORDER_RADIUS,
    px: SPACING.PADDING.SMALL,
    '&:hover': {
      borderColor: 'text.secondary',
    },
    '&.Mui-focused': {
      borderColor: 'primary.main',
    },
    '&.Mui-error': {
      borderColor: 'error.main',
    },
  },
};