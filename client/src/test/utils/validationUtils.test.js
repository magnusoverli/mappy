import { describe, it, expect } from 'vitest';
import {
  VALIDATION_PATTERNS,
  validateEntryKey,
  validateHexValue,
  validateLayerKey,
  validatePartialHexValue,
  isValidEntry,
  getValidationError
} from '../../utils/validationUtils.js';

describe('validationUtils', () => {
  describe('VALIDATION_PATTERNS', () => {
    it('should export correct regex patterns', () => {
      expect(VALIDATION_PATTERNS.ENTRY_KEY).toBeInstanceOf(RegExp);
      expect(VALIDATION_PATTERNS.HEX_VALUE).toBeInstanceOf(RegExp);
      expect(VALIDATION_PATTERNS.LAYER_KEY).toBeInstanceOf(RegExp);
      expect(VALIDATION_PATTERNS.HEX_VALUE_PARTIAL).toBeInstanceOf(RegExp);
    });

    it('should match valid patterns', () => {
      expect(VALIDATION_PATTERNS.ENTRY_KEY.test('00.0000')).toBe(true);
      expect(VALIDATION_PATTERNS.HEX_VALUE.test('ABCDEF12')).toBe(true);
      expect(VALIDATION_PATTERNS.LAYER_KEY.test('42')).toBe(true);
      expect(VALIDATION_PATTERNS.HEX_VALUE_PARTIAL.test('12AB')).toBe(false);
      expect(VALIDATION_PATTERNS.HEX_VALUE_PARTIAL.test('12345678')).toBe(true);
    });
  });

  describe('validateEntryKey', () => {
    it('should validate correct entry key format', () => {
      expect(validateEntryKey('00.0000')).toBe(true);
      expect(validateEntryKey('01.0001')).toBe(true);
      expect(validateEntryKey('99.9999')).toBe(true);
      expect(validateEntryKey('42.1234')).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(validateEntryKey('0.0000')).toBe(false);
      expect(validateEntryKey('00.000')).toBe(false);
      expect(validateEntryKey('00.00000')).toBe(false);
      expect(validateEntryKey('000.0000')).toBe(false);
      expect(validateEntryKey('00-0000')).toBe(false);
      expect(validateEntryKey('00,0000')).toBe(false);
      expect(validateEntryKey('00 0000')).toBe(false);
      expect(validateEntryKey('00.ABCD')).toBe(false);
      expect(validateEntryKey('AB.0000')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validateEntryKey(null)).toBe(false);
      expect(validateEntryKey(undefined)).toBe(false);
      expect(validateEntryKey(123)).toBe(false);
      expect(validateEntryKey({})).toBe(false);
      expect(validateEntryKey([])).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateEntryKey('')).toBe(false);
    });
  });

  describe('validateHexValue', () => {
    it('should validate correct 8-digit hex values', () => {
      expect(validateHexValue('00000000')).toBe(true);
      expect(validateHexValue('12345678')).toBe(true);
      expect(validateHexValue('ABCDEF01')).toBe(true);
      expect(validateHexValue('abcdef01')).toBe(true);
      expect(validateHexValue('FFFFFFFF')).toBe(true);
      expect(validateHexValue('deadbeef')).toBe(true);
    });

    it('should reject invalid hex values', () => {
      expect(validateHexValue('0000000')).toBe(false);   // Too short
      expect(validateHexValue('000000000')).toBe(false); // Too long
      expect(validateHexValue('ABCD')).toBe(false);      // Too short
      expect(validateHexValue('GHIJKLMN')).toBe(false);  // Invalid characters
      expect(validateHexValue('0x123456')).toBe(false);  // Has prefix
      expect(validateHexValue('1234 5678')).toBe(false); // Has space
      expect(validateHexValue('1234-5678')).toBe(false); // Has dash
    });

    it('should reject non-string values', () => {
      expect(validateHexValue(null)).toBe(false);
      expect(validateHexValue(undefined)).toBe(false);
      expect(validateHexValue(12345678)).toBe(false);
      expect(validateHexValue({})).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateHexValue('')).toBe(false);
    });
  });

  describe('validateLayerKey', () => {
    it('should validate correct 2-digit layer keys', () => {
      expect(validateLayerKey('00')).toBe(true);
      expect(validateLayerKey('01')).toBe(true);
      expect(validateLayerKey('42')).toBe(true);
      expect(validateLayerKey('99')).toBe(true);
    });

    it('should reject invalid layer keys', () => {
      expect(validateLayerKey('0')).toBe(false);    // Too short
      expect(validateLayerKey('000')).toBe(false);  // Too long
      expect(validateLayerKey('AB')).toBe(false);   // Letters
      expect(validateLayerKey('1A')).toBe(false);   // Mixed
      expect(validateLayerKey(' 1')).toBe(false);   // Space
      expect(validateLayerKey('1 ')).toBe(false);   // Space
      expect(validateLayerKey('-1')).toBe(false);   // Negative
    });

    it('should reject non-string values', () => {
      expect(validateLayerKey(null)).toBe(false);
      expect(validateLayerKey(undefined)).toBe(false);
      expect(validateLayerKey(42)).toBe(false);
      expect(validateLayerKey({})).toBe(false);
    });

    it('should reject empty string', () => {
      expect(validateLayerKey('')).toBe(false);
    });
  });

  describe('validatePartialHexValue', () => {
    it('should validate complete 8-digit hex values', () => {
      expect(validatePartialHexValue('00000000')).toBe(true);
      expect(validatePartialHexValue('12345678')).toBe(true);
      expect(validatePartialHexValue('ABCDEF01')).toBe(true);
      expect(validatePartialHexValue('ffffffff')).toBe(true);
    });

    it('should validate empty string for partial input', () => {
      expect(validatePartialHexValue('')).toBe(true);
    });

    it('should reject partial hex values', () => {
      expect(validatePartialHexValue('1')).toBe(false);
      expect(validatePartialHexValue('12')).toBe(false);
      expect(validatePartialHexValue('123')).toBe(false);
      expect(validatePartialHexValue('1234')).toBe(false);
      expect(validatePartialHexValue('12345')).toBe(false);
      expect(validatePartialHexValue('123456')).toBe(false);
      expect(validatePartialHexValue('1234567')).toBe(false);
    });

    it('should reject values longer than 8 digits', () => {
      expect(validatePartialHexValue('123456789')).toBe(false);
      expect(validatePartialHexValue('ABCDEF0123')).toBe(false);
    });

    it('should reject invalid characters', () => {
      expect(validatePartialHexValue('GHIJKLMN')).toBe(false);
      expect(validatePartialHexValue('1234567G')).toBe(false);
      expect(validatePartialHexValue('0x123456')).toBe(false);
    });

    it('should reject non-string values', () => {
      expect(validatePartialHexValue(null)).toBe(false);
      expect(validatePartialHexValue(undefined)).toBe(false);
      expect(validatePartialHexValue(12345678)).toBe(false);
    });
  });

  describe('isValidEntry', () => {
    it('should validate complete valid entries', () => {
      expect(isValidEntry({ key: '00.0000', value: '00000000' })).toBe(true);
      expect(isValidEntry({ key: '42.1234', value: 'ABCDEF12' })).toBe(true);
      expect(isValidEntry({ key: '99.9999', value: 'ffffffff' })).toBe(true);
    });

    it('should reject entries with invalid keys', () => {
      expect(isValidEntry({ key: '0.0000', value: '00000000' })).toBe(false);
      expect(isValidEntry({ key: '00.000', value: '00000000' })).toBe(false);
      expect(isValidEntry({ key: 'XX.0000', value: '00000000' })).toBe(false);
    });

    it('should reject entries with invalid values', () => {
      expect(isValidEntry({ key: '00.0000', value: '0000000' })).toBe(false);
      expect(isValidEntry({ key: '00.0000', value: 'GHIJKLMN' })).toBe(false);
      expect(isValidEntry({ key: '00.0000', value: '' })).toBe(false);
    });

    it('should reject entries with both invalid', () => {
      expect(isValidEntry({ key: 'invalid', value: 'invalid' })).toBe(false);
      expect(isValidEntry({ key: '', value: '' })).toBe(false);
    });

    it('should handle missing properties', () => {
      expect(isValidEntry({})).toBe(false);
      expect(isValidEntry({ key: '00.0000' })).toBe(false);
      expect(isValidEntry({ value: '00000000' })).toBe(false);
    });

    it('should handle non-object values', () => {
      expect(isValidEntry(null)).toBe(false);
      expect(isValidEntry(undefined)).toBe(false);
      expect(isValidEntry('00.0000')).toBe(false);
    });
  });

  describe('getValidationError', () => {
    it('should return null for valid entries', () => {
      expect(getValidationError({ key: '00.0000', value: '00000000' })).toBeNull();
      expect(getValidationError({ key: '99.9999', value: 'FFFFFFFF' })).toBeNull();
    });

    it('should return key error for invalid keys', () => {
      const error = getValidationError({ key: '0.0000', value: '00000000' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('key');
      expect(error.message).toContain('Invalid key format');
      expect(error.message).toContain('XX.XXXX');
    });

    it('should return value error for invalid values', () => {
      const error = getValidationError({ key: '00.0000', value: '1234' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('value');
      expect(error.message).toContain('Invalid hex value');
      expect(error.message).toContain('8 hex digits');
    });

    it('should prioritize key errors over value errors', () => {
      const error = getValidationError({ key: 'bad', value: 'bad' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('key');
    });

    it('should handle missing key', () => {
      const error = getValidationError({ value: '00000000' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('key');
    });

    it('should handle missing value after valid key', () => {
      const error = getValidationError({ key: '00.0000' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('value');
    });

    it('should handle empty strings', () => {
      const error = getValidationError({ key: '', value: '' });
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('key');
    });

    it('should handle null/undefined entry', () => {
      const error1 = getValidationError(null);
      const error2 = getValidationError(undefined);
      
      expect(error1).not.toBeNull();
      expect(error1.field).toBe('key');
      expect(error2).not.toBeNull();
      expect(error2.field).toBe('key');
    });

    it('should handle non-object entry', () => {
      const error = getValidationError('not an object');
      
      expect(error).not.toBeNull();
      expect(error.field).toBe('key');
    });

    it('should provide helpful error messages', () => {
      const keyError = getValidationError({ key: 'bad', value: '00000000' });
      const valueError = getValidationError({ key: '00.0000', value: 'bad' });
      
      expect(keyError.message).toMatch(/expected.*XX\.XXXX/i);
      expect(valueError.message).toMatch(/expected.*8.*hex.*digit/i);
    });
  });
});