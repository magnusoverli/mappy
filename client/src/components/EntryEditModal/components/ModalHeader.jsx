import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import SearchField from '../../Common/SearchField.jsx';

export default function ModalHeader({ 
  layerName, 
  entryType, 
  onClose, 
  searchQuery, 
  onSearchChange 
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
        variant="h6"
        sx={{
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

      {/* Search Field */}
      <Box sx={{ ml: 'auto', mr: 2, minWidth: 200 }}>
        <SearchField
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search entries..."
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
              '&::placeholder': {
                color: 'rgba(255, 255, 255, 0.7)',
                opacity: 1,
              },
            },
          }}
        />
      </Box>

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