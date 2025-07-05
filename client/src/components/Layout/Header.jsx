import { AppBar, Toolbar, Button, IconButton, Box, Typography } from '@mui/material';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import FileUpload from '../Common/FileUpload.jsx';

export const HeaderBar = ({ children, toolbarProps = {}, ...appBarProps }) => (
  <AppBar
    position="static"
    sx={{
      background: 'linear-gradient(90deg,#283593,#8e24aa)',
      borderBottom: 1,
      borderColor: 'divider',
      ...(appBarProps.sx || {}),
    }}
    {...appBarProps}
  >
    <Toolbar sx={{ gap: 2, minHeight: 64, ...(toolbarProps.sx || {}) }} {...toolbarProps}>
      {children}
    </Toolbar>
  </AppBar>
);

const Header = ({ mode, toggleMode, iniData, onFileSelect, onDownload, onReset, loading }) => (
  <HeaderBar>
    <Typography
      variant="h4"
      component="div"
      sx={{ fontFamily: '"Baloo 2", sans-serif', fontWeight: 'bold', mr: 2 }}
    >
      Mappy
    </Typography>
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
  </HeaderBar>
);

export default Header;

