import { Box, Checkbox, useTheme, alpha } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';
import { SPACING, FONTS } from '../../../utils/styleConstants.js';

export default function SelectableDataRow({ 
  item, 
  style, 
  isSelected, 
  onSelection, 
  index 
}) {
  const theme = useTheme();
  
  const handleClick = (event) => {
    onSelection(item, index, event);
  };

  return (
    <Box 
      style={style} 
      key={item.key}
      onClick={handleClick}
      sx={{
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          py: 0,
          mb: SPACING.MARGIN_SMALL,
          borderRadius: SPACING.BORDER_RADIUS,
          transition: 'all 0.2s ease',
          backgroundColor: isSelected ? alpha(theme.palette.primary.light, 0.8) : 'transparent',
          border: isSelected ? 2 : 1,
          borderColor: isSelected ? 'primary.main' : 'transparent',
          '&:hover': {
            backgroundColor: isSelected ? alpha(theme.palette.primary.light, 0.8) : 'action.hover',
            borderColor: isSelected ? 'primary.main' : 'action.hover',
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          width: '100%', 
          height: '100%',
          px: SPACING.PADDING.MEDIUM,
          alignItems: 'center',
        }}>
          {/* Selection indicator */}
          <Box sx={{ width: '5%', display: 'flex', justifyContent: 'center' }}>
            {isSelected && (
              <CheckIcon 
                sx={{ 
                  fontSize: 16, 
                  color: 'primary.main',
                }} 
              />
            )}
          </Box>
          
          {/* Key column */}
          <Box sx={{ 
            width: '35%', 
            fontFamily: FONTS.MONOSPACE,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.key}
          </Box>
          
          {/* Value column */}
          <Box sx={{ 
            width: '35%', 
            fontFamily: FONTS.MONOSPACE,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {item.value}
          </Box>
          
          {/* Offset column */}
          <Box
            sx={{
              width: '25%',
              textAlign: 'right',
              fontFamily: FONTS.MONOSPACE,
              color: item.offset === 0 ? 'success.dark' : 'error.dark',
              fontWeight: 'medium',
            }}
          >
            {item.offset}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}