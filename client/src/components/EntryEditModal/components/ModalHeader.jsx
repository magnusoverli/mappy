import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { FONTS } from '../../../utils/styleConstants.js';

export default function ModalHeader({ 
  layerName, 
  entryType, 
  onClose
}) {
  return (
    <Box
      sx={{
        height: 64,
        background: 'linear-gradient(135deg, #283593 0%, #8e24aa 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        px: 3,
        position: 'relative',
      }}
    >
      {/* Brand Logo */}
      <Typography
        variant="h4"
        sx={{
          fontFamily: FONTS.BRAND,
          fontWeight: 'bold',
          mr: 4,
        }}
      >
        Mappy
      </Typography>

      {/* Layer Information - Centered */}
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 500 }}>
          {layerName} - Editing {entryType}
        </Typography>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {/* Close Button */}
      <IconButton
        onClick={onClose}
        sx={{
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
          },
        }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  );
}