import { Component } from 'react';
import { Typography, Box } from '@mui/material';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('UI Error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4 }}>
          <Typography color="error">Something went wrong.</Typography>
        </Box>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

