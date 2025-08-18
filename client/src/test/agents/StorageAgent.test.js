import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadState, saveState, clearState } from '../../StorageAgent.js';

describe('StorageAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('loadState', () => {
    it('should return parsed state from localStorage', () => {
      const mockState = { text: 'test content', fileName: 'test.ini', newline: '\n' };
      localStorage.getItem.mockReturnValue(JSON.stringify(mockState));
      
      const result = loadState();
      
      expect(localStorage.getItem).toHaveBeenCalledWith('mappy_state');
      expect(result).toEqual(mockState);
    });

    it('should return null when no state exists', () => {
      localStorage.getItem.mockReturnValue(null);
      
      const result = loadState();
      
      expect(result).toBeNull();
    });

    it('should return null on JSON parse error', () => {
      localStorage.getItem.mockReturnValue('invalid json {');
      
      const result = loadState();
      
      expect(result).toBeNull();
    });

    it('should handle localStorage access errors', () => {
      localStorage.getItem.mockImplementation(() => {
        throw new Error('Storage access denied');
      });
      
      const result = loadState();
      
      expect(result).toBeNull();
    });

    it('should handle complex nested state', () => {
      const complexState = {
        text: 'content',
        fileName: 'complex.ini',
        newline: '\r\n',
        nested: {
          layers: ['00', '01'],
          targets: { '00.0000': '00000000' }
        }
      };
      localStorage.getItem.mockReturnValue(JSON.stringify(complexState));
      
      const result = loadState();
      
      expect(result).toEqual(complexState);
    });
  });

  describe('saveState', () => {
    it('should save state to localStorage as JSON', () => {
      const state = { text: 'test content', fileName: 'test.ini', newline: '\n' };
      
      saveState(state);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mappy_state',
        JSON.stringify(state)
      );
    });

    it('should handle empty state', () => {
      saveState({});
      
      expect(localStorage.setItem).toHaveBeenCalledWith('mappy_state', '{}');
    });

    it('should handle null values in state', () => {
      const state = { text: null, fileName: 'test.ini', newline: '\n' };
      
      saveState(state);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mappy_state',
        JSON.stringify(state)
      );
    });

    it('should handle special characters in state', () => {
      const state = { 
        text: 'Line with "quotes" and \n newlines', 
        fileName: 'special™.ini',
        newline: '\r\n'
      };
      
      saveState(state);
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'mappy_state',
        JSON.stringify(state)
      );
    });

    it('should overwrite existing state', () => {
      saveState({ old: 'state' });
      saveState({ new: 'state' });
      
      expect(localStorage.setItem).toHaveBeenCalledTimes(2);
      expect(localStorage.setItem).toHaveBeenLastCalledWith(
        'mappy_state',
        JSON.stringify({ new: 'state' })
      );
    });
  });

  describe('clearState', () => {
    it('should remove state from localStorage', () => {
      clearState();
      
      expect(localStorage.removeItem).toHaveBeenCalledWith('mappy_state');
    });

    it('should handle multiple clear calls', () => {
      clearState();
      clearState();
      
      expect(localStorage.removeItem).toHaveBeenCalledTimes(2);
      expect(localStorage.removeItem).toHaveBeenCalledWith('mappy_state');
    });

    it('should throw on localStorage errors', () => {
      localStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      expect(() => clearState()).toThrow('Storage error');
    });
  });

  describe('integration scenarios', () => {
    it('should handle save and load cycle', () => {
      const state = { 
        text: '[Layers]\n00="Test"', 
        fileName: 'cycle.ini',
        newline: '\n'
      };
      
      // Save state
      saveState(state);
      const savedData = localStorage.setItem.mock.calls[0][1];
      
      // Load state
      localStorage.getItem.mockReturnValue(savedData);
      const loaded = loadState();
      
      expect(loaded).toEqual(state);
    });

    it('should clear state after save', () => {
      const state = { text: 'content', fileName: 'test.ini' };
      
      saveState(state);
      expect(localStorage.setItem).toHaveBeenCalled();
      
      // Reset mock to avoid error from previous test
      localStorage.removeItem.mockImplementation(() => {});
      
      clearState();
      expect(localStorage.removeItem).toHaveBeenCalledWith('mappy_state');
    });
  });
});