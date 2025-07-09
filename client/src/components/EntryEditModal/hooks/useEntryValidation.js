import { useState, useCallback } from 'react';
import { 
  validateEntry, 
  validateEntryBatch, 
  detectKeyConflicts,
  validateQuantityLimits 
} from '../utils/entryValidation.js';

export default function useEntryValidation() {
  const [validationErrors, setValidationErrors] = useState([]);
  const [isValidating, setIsValidating] = useState(false);

  const validateSingleEntry = useCallback((entry) => {
    const errors = validateEntry(entry);
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const validateBatch = useCallback(async (entries) => {
    setIsValidating(true);
    
    try {
      // Simulate async validation for large batches
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const errors = validateEntryBatch(entries);
      setValidationErrors(errors);
      
      return {
        isValid: errors.length === 0,
        errors
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  const validateNewEntries = useCallback((newEntries, existingEntries) => {
    const batchErrors = validateEntryBatch(newEntries);
    const conflicts = detectKeyConflicts(newEntries, existingEntries);
    
    const allErrors = [
      ...batchErrors,
      ...conflicts.map(conflict => ({
        field: 'key',
        message: conflict.message,
        severity: 'error',
        entryIndex: conflict.entryIndex,
        entryKey: conflict.key
      }))
    ];
    
    return {
      isValid: allErrors.length === 0,
      errors: allErrors
    };
  }, []);

  const validateQuantity = useCallback((quantity, max = 1000) => {
    return validateQuantityLimits(quantity, max);
  }, []);

  const clearValidationErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  const getErrorsForEntry = useCallback((entryKey) => {
    return validationErrors.filter(error => error.entryKey === entryKey);
  }, [validationErrors]);

  const hasErrors = validationErrors.length > 0;
  const errorCount = validationErrors.length;

  return {
    validationErrors,
    isValidating,
    hasErrors,
    errorCount,
    validateSingleEntry,
    validateBatch,
    validateNewEntries,
    validateQuantity,
    clearValidationErrors,
    getErrorsForEntry,
  };
}