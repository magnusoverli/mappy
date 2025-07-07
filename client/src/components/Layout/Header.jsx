import { Button, IconButton, Box, Typography } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import FileUpload from '../Common/FileUpload.jsx';
import SearchField from '../Common/SearchField.jsx';
import AppToolbar from './AppToolbar.jsx';
import { FONTS } from '../../utils/styleConstants.js';

const Header = ({ mode, toggleMode, iniData, onFileSelect, onDownload, onReset, loading }) => (
  <AppToolbar>
    <Typography
      variant="h4"
      component="div"
      sx={{ fontFamily: FONTS.BRAND, fontWeight: 'bold', mr: 2 }}
    >
      Mappy
    </Typography>
    <SearchField />
    <Box sx={{ flexGrow: 1 }} />
    <FileUpload onFileSelect={onFileSelect} />
    <Button variant="contained" onClick={onDownload} disabled={!iniData || loading}>
      Download
    </Button>
    <Button color="inherit" onClick={onReset} disabled={loading}>
      Reset
    </Button>
    <IconButton color="inherit" onClick={toggleMode} aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
      {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  </AppToolbar>
);

export default Header;

