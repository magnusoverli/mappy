import { Box, Button, CircularProgress, Typography } from '@mui/material';

export default function ModalFooter({ 
  hasChanges, 
  processing, 
  onCancel, 
  onSave,
  processingMessage = "Processing..."
}) {
  return (
    <Box
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        p: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Progress Indicator - Left aligned */}
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 120 }}>
        {processing && (
          <>
            <CircularProgress
              size={20}
              thickness={4}
              sx={{ 
                color: 'primary.main',
                mr: 1.5,
                opacity: 0.8
              }}
            />
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: '0.875rem' }}
            >
              {processingMessage}
            </Typography>
          </>
        )}
      </Box>

      {/* Action Buttons - Right aligned */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onCancel}
          disabled={processing}
          sx={{ minWidth: 100 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={onSave}
          disabled={!hasChanges || processing}
          sx={{ minWidth: 100 }}
        >
          Save
        </Button>
      </Box>
    </Box>
  );
}