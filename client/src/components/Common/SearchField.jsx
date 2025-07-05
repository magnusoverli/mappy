import { useState } from 'react';
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useSearch } from '../../hooks/useSearch.js';

export default function SearchField() {
  const search = useSearch();
  const [open, setOpen] = useState(false);

  if (!search) return null;
  const { query, setQuery, results, current, next, prev } = search;

  const handleAway = () => {
    if (!query) setOpen(false);
  };

  return (
    <ClickAwayListener onClickAway={handleAway}>
      <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        {open ? (
          <Paper
            sx={theme => ({
              width: 300,
              px: 1,
              py: 0.5,
              display: 'flex',
              alignItems: 'center',
              transition: 'width 0.2s',
              backgroundColor:
                theme.palette.mode === 'light' ? '#fff' : theme.palette.grey[800],
            })}
          >
            <SearchIcon sx={{ mr: 1 }} />
            <InputBase
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search layers, targets, sources..."
              sx={{ flex: 1 }}
            />
            {query && (
              <IconButton size="small" onClick={() => setQuery('')}>
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Paper>
        ) : (
          <IconButton color="inherit" onClick={() => setOpen(true)}>
            <SearchIcon />
          </IconButton>
        )}
        {open && results.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
            <Typography variant="caption" sx={{ px: 1 }}>
              {`${current + 1} of ${results.length}`}
            </Typography>
            <IconButton size="small" onClick={prev}>
              <KeyboardArrowUpIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={next}>
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>
    </ClickAwayListener>
  );
}
