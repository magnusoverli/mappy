import { useState, useCallback } from 'react';

export function useErrorHandler() {
  const [error, setError] = useState(null);
  
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    setError({
      message: error.message || 'An unexpected error occurred',
      context,
      timestamp: Date.now(),
    });
  }, []);
  
  const clearError = useCallback(() => setError(null), []);
  
  return { error, handleError, clearError };
}