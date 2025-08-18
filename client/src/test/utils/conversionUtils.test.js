import { describe, it, expect } from 'vitest';
import {
  formatHexValue,
  formatLayerKey,
  formatEntryIndex,
  formatEntryKey,
  parseHexValue,
  parseDecimalValue,
  calculateOffset,
  formatHexDisplay,
  shiftEntryKey
} from '../../utils/conversionUtils.js';

describe('conversionUtils', () => {
  describe('formatHexValue', () => {
    it('should format number to 8-digit uppercase hex', () => {
      expect(formatHexValue(0)).toBe('00000000');
      expect(formatHexValue(255)).toBe('000000FF');
      expect(formatHexValue(4095)).toBe('00000FFF');
      expect(formatHexValue(65535)).toBe('0000FFFF');
      expect(formatHexValue(16777215)).toBe('00FFFFFF');
      expect(formatHexValue(4294967295)).toBe('FFFFFFFF');
    });

    it('should handle negative numbers using unsigned conversion', () => {
      expect(formatHexValue(-1)).toBe('FFFFFFFF');
      expect(formatHexValue(-256)).toBe('FFFFFF00');
    });

    it('should handle large numbers', () => {
      expect(formatHexValue(2147483647)).toBe('7FFFFFFF');
      expect(formatHexValue(2147483648)).toBe('80000000');
    });

    it('should handle string input', () => {
      expect(formatHexValue('255')).toBe('000000FF');
      expect(formatHexValue('0xFF')).toBe('000000FF');
    });
  });

  describe('formatLayerKey', () => {
    it('should format to 2-digit padded string', () => {
      expect(formatLayerKey(0)).toBe('00');
      expect(formatLayerKey(1)).toBe('01');
      expect(formatLayerKey(9)).toBe('09');
      expect(formatLayerKey(10)).toBe('10');
      expect(formatLayerKey(99)).toBe('99');
    });

    it('should handle string input', () => {
      expect(formatLayerKey('5')).toBe('05');
      expect(formatLayerKey('15')).toBe('15');
    });

    it('should not truncate values over 99', () => {
      expect(formatLayerKey(100)).toBe('100');
      expect(formatLayerKey(999)).toBe('999');
    });
  });

  describe('formatEntryIndex', () => {
    it('should format to 4-digit padded string', () => {
      expect(formatEntryIndex(0)).toBe('0000');
      expect(formatEntryIndex(1)).toBe('0001');
      expect(formatEntryIndex(10)).toBe('0010');
      expect(formatEntryIndex(100)).toBe('0100');
      expect(formatEntryIndex(1000)).toBe('1000');
      expect(formatEntryIndex(9999)).toBe('9999');
    });

    it('should handle string input', () => {
      expect(formatEntryIndex('42')).toBe('0042');
      expect(formatEntryIndex('1234')).toBe('1234');
    });

    it('should not truncate values over 9999', () => {
      expect(formatEntryIndex(10000)).toBe('10000');
      expect(formatEntryIndex(65535)).toBe('65535');
    });
  });

  describe('formatEntryKey', () => {
    it('should combine layer and index with dot separator', () => {
      expect(formatEntryKey(0, 0)).toBe('00.0000');
      expect(formatEntryKey(1, 42)).toBe('01.0042');
      expect(formatEntryKey(10, 100)).toBe('10.0100');
      expect(formatEntryKey(99, 9999)).toBe('99.9999');
    });

    it('should handle string inputs', () => {
      expect(formatEntryKey('05', '0123')).toBe('05.0123');
      expect(formatEntryKey('5', '123')).toBe('05.0123');
    });

    it('should handle mixed inputs', () => {
      expect(formatEntryKey(5, '123')).toBe('05.0123');
      expect(formatEntryKey('05', 123)).toBe('05.0123');
    });
  });

  describe('parseHexValue', () => {
    it('should parse hex strings to decimal', () => {
      expect(parseHexValue('00000000')).toBe(0);
      expect(parseHexValue('000000FF')).toBe(255);
      expect(parseHexValue('00000100')).toBe(256);
      expect(parseHexValue('0000FFFF')).toBe(65535);
      expect(parseHexValue('FFFFFFFF')).toBe(4294967295);
    });

    it('should handle lowercase hex', () => {
      expect(parseHexValue('000000ff')).toBe(255);
      expect(parseHexValue('deadbeef')).toBe(3735928559);
    });

    it('should handle hex without leading zeros', () => {
      expect(parseHexValue('FF')).toBe(255);
      expect(parseHexValue('100')).toBe(256);
      expect(parseHexValue('ABCD')).toBe(43981);
    });

    it('should handle 0x prefix', () => {
      expect(parseHexValue('0xFF')).toBe(255);
      expect(parseHexValue('0x100')).toBe(256);
    });

    it('should return 0 for invalid input', () => {
      expect(parseHexValue('')).toBe(0);
      expect(parseHexValue('invalid')).toBe(0);
      expect(parseHexValue('XYZ')).toBe(0);
      expect(parseHexValue(null)).toBe(0);
      expect(parseHexValue(undefined)).toBe(0);
    });
  });

  describe('parseDecimalValue', () => {
    it('should parse decimal strings', () => {
      expect(parseDecimalValue('0')).toBe(0);
      expect(parseDecimalValue('42')).toBe(42);
      expect(parseDecimalValue('100')).toBe(100);
      expect(parseDecimalValue('9999')).toBe(9999);
    });

    it('should handle numbers directly', () => {
      expect(parseDecimalValue(42)).toBe(42);
      expect(parseDecimalValue(0)).toBe(0);
    });

    it('should return 0 for invalid input', () => {
      expect(parseDecimalValue('')).toBe(0);
      expect(parseDecimalValue('abc')).toBe(0);
      expect(parseDecimalValue('12.34')).toBe(12);
      expect(parseDecimalValue(null)).toBe(0);
      expect(parseDecimalValue(undefined)).toBe(0);
    });

    it('should handle leading zeros', () => {
      expect(parseDecimalValue('0042')).toBe(42);
      expect(parseDecimalValue('0001')).toBe(1);
    });

    it('should handle negative numbers', () => {
      expect(parseDecimalValue('-42')).toBe(-42);
      expect(parseDecimalValue('-0')).toBe(0);
    });
  });

  describe('calculateOffset', () => {
    it('should calculate offset between decimal index and hex value', () => {
      // Index 0, value 0x00 = 0, offset = 0 - 0 = 0
      expect(calculateOffset(0, '00000000')).toBe(0);
      
      // Index 10, value 0x0A = 10, offset = 10 - 10 = 0
      expect(calculateOffset(10, '0000000A')).toBe(0);
      
      // Index 5, value 0x15 = 21, offset = 5 - 21 = -16
      expect(calculateOffset(5, '00000015')).toBe(-16);
      
      // Index 100, value 0x50 = 80, offset = 100 - 80 = 20
      expect(calculateOffset(100, '00000050')).toBe(20);
    });

    it('should handle numeric hex values', () => {
      expect(calculateOffset(10, 5)).toBe(5);
      expect(calculateOffset(0, 256)).toBe(-256);
      expect(calculateOffset(100, 100)).toBe(0);
    });

    it('should handle large values', () => {
      expect(calculateOffset(1000, 'FFFFFFFF')).toBe(1000 - 4294967295);
      expect(calculateOffset(0, 'FFFFFFFF')).toBe(-4294967295);
    });

    it('should handle invalid hex strings', () => {
      expect(calculateOffset(10, 'invalid')).toBe(10);
      expect(calculateOffset(10, '')).toBe(10);
    });
  });

  describe('formatHexDisplay', () => {
    it('should format decimal to hex display string', () => {
      expect(formatHexDisplay(0)).toBe('0x00000000');
      expect(formatHexDisplay(255)).toBe('0x000000FF');
      expect(formatHexDisplay(4095)).toBe('0x00000FFF');
      expect(formatHexDisplay(65535)).toBe('0x0000FFFF');
    });

    it('should handle negative numbers', () => {
      expect(formatHexDisplay(-1)).toBe('0xFFFFFFFF');
      expect(formatHexDisplay(-256)).toBe('0xFFFFFF00');
    });

    it('should handle string input', () => {
      expect(formatHexDisplay('255')).toBe('0x000000FF');
      expect(formatHexDisplay('1000')).toBe('0x000003E8');
    });
  });

  describe('shiftEntryKey', () => {
    it('should shift entry key by positive amount', () => {
      expect(shiftEntryKey('00.0000', 1)).toBe('00.0001');
      expect(shiftEntryKey('00.0010', 5)).toBe('00.0015');
      expect(shiftEntryKey('05.0100', 100)).toBe('05.0200');
    });

    it('should shift entry key by negative amount', () => {
      expect(shiftEntryKey('00.0010', -5)).toBe('00.0005');
      expect(shiftEntryKey('00.0100', -50)).toBe('00.0050');
      expect(shiftEntryKey('10.1000', -500)).toBe('10.0500');
    });

    it('should handle zero shift', () => {
      expect(shiftEntryKey('00.0042', 0)).toBe('00.0042');
      expect(shiftEntryKey('99.9999', 0)).toBe('99.9999');
    });

    it('should allow negative results', () => {
      expect(shiftEntryKey('00.0005', -10)).toBe('00.-005');
    });

    it('should handle large shifts', () => {
      expect(shiftEntryKey('00.0000', 10000)).toBe('00.10000');
      expect(shiftEntryKey('50.5000', 5000)).toBe('50.10000');
    });

    it('should preserve layer key', () => {
      expect(shiftEntryKey('42.0000', 100)).toBe('42.0100');
      expect(shiftEntryKey('99.0000', 1)).toBe('99.0001');
    });

    it('should handle malformed keys gracefully', () => {
      expect(shiftEntryKey('00', 1)).toBe('00.0001');
      // When split doesn't find '.', indexPart is undefined, parseInt returns NaN
      // But the layer part stays as 'invalid'
      expect(shiftEntryKey('invalid', 1)).toBe('invalid.0001');
    });
  });
});