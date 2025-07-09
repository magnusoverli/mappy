import { Box, Button, CircularProgress, Typography } from '@mui/material';

export default function ModalFooter({ 
  hasChanges, 
  processing, 
  onCancel, 
  onSave,
  progressPercent = 0 
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
            <Box sx={{ position: 'relative', mr: 2 }}>
              <CircularProgress
                size={40}
                thickness={4}
                variant="determinate"
                value={progressPercent}
                sx={{ color: 'primary.main' }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  bottom: 0,
                  right: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography
                  variant="caption"
                  component="div"
                  color="text.secondary"
                  sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}
                >
                  {`${Math.round(progressPercent)}%`}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Processing...
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