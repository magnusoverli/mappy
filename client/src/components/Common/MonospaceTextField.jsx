import { TextField } from '@mui/material';
import { FIELD_STYLES } from '../../utils/styleConstants.js';

const MonospaceTextField = ({ error, sx, InputProps, ...props }) => (
  <TextField
    {...props}
    variant="standard"
    error={error}
    InputProps={{
      disableUnderline: true,
      sx: {
        ...FIELD_STYLES.MONOSPACE_INPUT,
        ...(error && { borderColor: 'error.main' }),
        ...(InputProps?.sx || {}),
      },
      ...(InputProps || {}),
    }}
    sx={sx}
  />
);

export default MonospaceTextField;