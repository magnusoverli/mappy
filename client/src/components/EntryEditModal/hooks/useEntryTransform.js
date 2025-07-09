import { useState, useCallback } from 'react';
import { 
  applyTransformation, 
  generateTransformPreview, 
  detectTransformConflicts 
} from '../utils/entryTransformations.js';

export default function useEntryTransform() {
  const [isTransforming, setIsTransforming] = useState(false);
  const [transformProgress, setTransformProgress] = useState(0);

  const generatePreview = useCallback((selectedEntries, transformType, params) => {
    return generateTransformPreview(selectedEntries, transformType, params);
  }, []);

  const checkConflicts = useCallback((preview, allEntries, selectedKeys) => {
    return detectTransformConflicts(preview, allEntries, selectedKeys);
  }, []);

  const applyTransform = useCallback(async (entries, selectedKeys, transformType, params, onProgress) => {
    setIsTransforming(true);
    setTransformProgress(0);
    
    try {
      const selectedEntries = entries.filter(entry => selectedKeys.has(entry.key));
      const unselectedEntries = entries.filter(entry => !selectedKeys.has(entry.key));
      
      // Simulate progress for large transformations
      const batchSize = Math.max(1, Math.floor(selectedEntries.length / 10));
      const transformedEntries = [];
      
      for (let i = 0; i < selectedEntries.length; i += batchSize) {
        const batch = selectedEntries.slice(i, i + batchSize);
        const transformedBatch = applyTransformation(batch, transformType, params);
        transformedEntries.push(...transformedBatch);
        
        const progress = Math.min(100, ((i + batchSize) / selectedEntries.length) * 100);
        setTransformProgress(progress);
        
        if (onProgress) {
          onProgress(progress);
        }
        
        // Small delay for UI responsiveness
        if (selectedEntries.length > 100) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      }
      
      // Combine transformed and untransformed entries
      const result = [...unselectedEntries, ...transformedEntries];
      
      setTransformProgress(100);
      return result;
      
    } finally {
      setTimeout(() => {
        setIsTransforming(false);
        setTransformProgress(0);
      }, 500);
    }
  }, []);

  const validateTransformParams = useCallback((transformType, params) => {
    const errors = [];
    
    switch (transformType) {
      case 'shift_keys':
      case 'shift_values':
        if (typeof params.moveBy !== 'number') {
          errors.push('Move by value must be a number');
        }
        break;
        
      case 'number_values':
        if (typeof params.startValue !== 'number' || params.startValue < 0) {
          errors.push('Start value must be a positive number');
        }
        if (typeof params.countBy !== 'number' || params.countBy === 0) {
          errors.push('Count by value must be a non-zero number');
        }
        break;
        
      case 'set_same_value':
        if (!/^[0-9A-Fa-f]{8}$/.test(params.hexValue)) {
          errors.push('Hex value must be exactly 8 hexadecimal characters');
        }
        break;
        
      default:
        errors.push('Invalid transformation type');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    isTransforming,
    transformProgress,
    generatePreview,
    checkConflicts,
    applyTransform,
    validateTransformParams,
  };
}