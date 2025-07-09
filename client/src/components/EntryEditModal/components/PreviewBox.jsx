import { Box, Typography, Button, Divider } from '@mui/material';
import { ArrowForward as ArrowIcon } from '@mui/icons-material';
import { FONTS } from '../../../utils/styleConstants.js';

export default function PreviewBox({ preview, onApply, disabled }) {
  const displayCount = Math.min(preview.length, 10);
  const hasMore = preview.length > 5;
  const showCount = hasMore ? 5 : displayCount;
  
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
        What will happen:
      </Typography>
      
      <Box
        sx={{
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          p: 2,
          backgroundColor: 'background.paper',
          maxHeight: 200,
          overflow: 'auto',
          mb: 2,
        }}
      >
        {preview.slice(0, showCount).map((item, index) => (
          <Box key={index}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                py: 0.5,
                fontFamily: FONTS.MONOSPACE,
                fontSize: '0.875rem',
              }}
            >
              <Box sx={{ color: 'text.secondary' }}>
                {item.oldKey} = {item.oldValue}
              </Box>
              <ArrowIcon sx={{ fontSize: 16, color: 'primary.main' }} />
              <Box sx={{ color: 'primary.main', fontWeight: 'medium' }}>
                {item.newKey} = {item.newValue}
              </Box>
            </Box>
            {index < showCount - 1 && <Divider sx={{ my: 0.5 }} />}
          </Box>
        ))}
        
        {hasMore && (
          <Box sx={{ mt: 1, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              ...and {preview.length - showCount} more entries
            </Typography>
          </Box>
        )}
      </Box>
      
      <Button
        variant="contained"
        onClick={onApply}
        disabled={disabled}
        fullWidth
        sx={{ fontWeight: 'bold' }}
      >
        Apply to {preview.length} entries
      </Button>
    </Box>
  );
}