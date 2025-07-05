import { AppBar, Toolbar } from '@mui/material';

const AppToolbar = ({ position = 'static', children }) => (
  <AppBar
    position={position}
    sx={{ background: 'linear-gradient(90deg,#283593,#8e24aa)', borderBottom: 1, borderColor: 'divider' }}
  >
    <Toolbar sx={{ gap: 2, minHeight: 64 }}>{children}</Toolbar>
  </AppBar>
);

export default AppToolbar;
