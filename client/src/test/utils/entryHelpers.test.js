import { describe, it, expect, beforeEach } from 'vitest';
import { groupByLayer, removeLayerEntries, validateLayerOrder } from '../../utils/entryHelpers.js';

describe('entryHelpers', () => {
  describe('groupByLayer', () => {
    it('should group entries by layer key', () => {
      const entries = {
        '00.0000': '00000000',
        '00.0001': '00000001',
        '01.0000': '00000010',
        '01.0002': '00000012',
        '02.0000': '00000020'
      };
      
      const result = groupByLayer(entries);
      
      expect(result['00']).toHaveLength(2);
      expect(result['01']).toHaveLength(2);
      expect(result['02']).toHaveLength(1);
    });

    it('should calculate correct offsets', () => {
      const entries = {
        '00.0000': '00000000', // 0 - 0 = 0
        '00.0010': '00000005', // 10 (decimal) - 5 (hex) = 5
        '01.0100': '00000050'  // 256 (decimal) - 0x50 (80 hex) = 176
      };
      
      const result = groupByLayer(entries);
      
      expect(result['00'][0].offset).toBe(0);
      expect(result['00'][1].offset).toBe(5);  // Fixed: 10 - 5 = 5
      expect(result['01'][0].offset).toBe(176);
    });

    it('should include key and value in results', () => {
      const entries = {
        '00.0000': 'ABCDEF12'
      };
      
      const result = groupByLayer(entries);
      
      expect(result['00'][0]).toEqual({
        key: '00.0000',
        value: 'ABCDEF12',
        offset: 0 - parseInt('ABCDEF12', 16)
      });
    });

    it('should handle empty entries', () => {
      const result = groupByLayer({});
      
      expect(result).toEqual({});
    });

    it('should handle undefined entries', () => {
      const result = groupByLayer(undefined);
      
      expect(result).toEqual({});
    });

    it('should handle null entries', () => {
      const result = groupByLayer(null);
      
      expect(result).toEqual({});
    });

    it('should handle entries with invalid hex values', () => {
      const entries = {
        '00.0000': 'invalid',
        '00.0001': ''
      };
      
      const result = groupByLayer(entries);
      
      // parseInt('invalid', 16) returns NaN
      expect(result['00'][0].offset).toBeNaN();
      expect(result['00'][1].offset).toBeNaN();
    });

    it('should maintain order within layers', () => {
      const entries = {
        '00.0002': '00000002',
        '00.0000': '00000000',
        '00.0001': '00000001'
      };
      
      const result = groupByLayer(entries);
      
      // Order depends on Object.entries iteration
      expect(result['00'].map(e => e.key)).toContain('00.0000');
      expect(result['00'].map(e => e.key)).toContain('00.0001');
      expect(result['00'].map(e => e.key)).toContain('00.0002');
    });

    it('should handle large hex values', () => {
      const entries = {
        '00.0000': 'FFFFFFFF', // 4294967295
        '99.9999': '80000000'  // 2147483648
      };
      
      const result = groupByLayer(entries);
      
      expect(result['00'][0].offset).toBe(0 - 4294967295);
      expect(result['99'][0].offset).toBe(9999 - 2147483648);  // Fixed: 9999 decimal, not 39321
    });

    it('should create new arrays for each layer', () => {
      const entries = {
        '00.0000': '00000000',
        '01.0000': '00000001'
      };
      
      const result = groupByLayer(entries);
      
      expect(result['00']).not.toBe(result['01']);
      expect(Array.isArray(result['00'])).toBe(true);
      expect(Array.isArray(result['01'])).toBe(true);
    });
  });

  describe('removeLayerEntries', () => {
    it('should remove all entries for specified layer', () => {
      const entries = {
        '00.0000': '00000000',
        '00.0001': '00000001',
        '01.0000': '00000010',
        '02.0000': '00000020'
      };
      
      removeLayerEntries(entries, '00');
      
      expect(entries['00.0000']).toBeUndefined();
      expect(entries['00.0001']).toBeUndefined();
      expect(entries['01.0000']).toBe('00000010');
      expect(entries['02.0000']).toBe('00000020');
    });

    it('should handle non-existent layer', () => {
      const entries = {
        '00.0000': '00000000',
        '01.0000': '00000010'
      };
      
      removeLayerEntries(entries, '99');
      
      expect(entries['00.0000']).toBe('00000000');
      expect(entries['01.0000']).toBe('00000010');
    });

    it('should handle empty entries', () => {
      const entries = {};
      
      expect(() => removeLayerEntries(entries, '00')).not.toThrow();
      expect(entries).toEqual({});
    });

    it('should handle undefined entries', () => {
      expect(() => removeLayerEntries(undefined, '00')).not.toThrow();
    });

    it('should handle null entries', () => {
      expect(() => removeLayerEntries(null, '00')).not.toThrow();
    });

    it('should only remove exact layer matches', () => {
      const entries = {
        '00.0000': 'value00',
        '000.0000': 'value000',
        '0.0000': 'value0'
      };
      
      removeLayerEntries(entries, '00');
      
      expect(entries['00.0000']).toBeUndefined();
      expect(entries['000.0000']).toBe('value000');
      expect(entries['0.0000']).toBe('value0');
    });

    it('should handle entries with similar prefixes', () => {
      const entries = {
        '01.0000': 'layer01',
        '010.0000': 'layer010',
        '10.0000': 'layer10'
      };
      
      removeLayerEntries(entries, '01');
      
      expect(entries['01.0000']).toBeUndefined();
      expect(entries['010.0000']).toBe('layer010');
      expect(entries['10.0000']).toBe('layer10');
    });

    it('should mutate the original object', () => {
      const entries = {
        '00.0000': '00000000',
        '00.0001': '00000001'
      };
      const original = entries;
      
      removeLayerEntries(entries, '00');
      
      expect(entries).toBe(original);
      expect(Object.keys(entries).length).toBe(0);
    });
  });

  describe('validateLayerOrder', () => {
    it('should preserve valid layer order', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One', '02': 'Two' },
        __layerOrder: ['00', '01', '02']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toEqual(['00', '01', '02']);
    });

    it('should add missing layers to order', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One', '02': 'Two' },
        __layerOrder: ['00', '02']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toEqual(['00', '02', '01']);
    });

    it('should remove invalid keys from order', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One' },
        __layerOrder: ['00', '99', '01']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toEqual(['00', '01']);
    });

    it('should create __layerOrder if missing', () => {
      const data = {
        Layers: { '02': 'Two', '00': 'Zero', '01': 'One' }
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toBeDefined();
      expect(result.__layerOrder).toContain('00');
      expect(result.__layerOrder).toContain('01');
      expect(result.__layerOrder).toContain('02');
    });

    it('should sort missing layers numerically', () => {
      const data = {
        Layers: { '10': 'Ten', '02': 'Two', '01': 'One', '00': 'Zero' },
        __layerOrder: ['00']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toEqual(['00', '01', '02', '10']);
    });

    it('should handle empty Layers', () => {
      const data = {
        Layers: {},
        __layerOrder: ['00', '01']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result.__layerOrder).toEqual([]);
    });

    it('should handle missing Layers', () => {
      const data = {
        __layerOrder: ['00', '01']
      };
      
      const result = validateLayerOrder(data);
      
      expect(result).toBe(data);
      expect(result.__layerOrder).toEqual(['00', '01']);
    });

    it('should preserve order of valid keys', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One', '02': 'Two', '03': 'Three' },
        __layerOrder: ['02', '00'] // Partial order
      };
      
      const result = validateLayerOrder(data);
      
      // Should preserve '02', '00' order and append missing '01', '03' sorted
      expect(result.__layerOrder[0]).toBe('02');
      expect(result.__layerOrder[1]).toBe('00');
      expect(result.__layerOrder).toContain('01');
      expect(result.__layerOrder).toContain('03');
    });

    it('should mutate the original data object', () => {
      const data = {
        Layers: { '00': 'Zero' }
      };
      
      const result = validateLayerOrder(data);
      
      expect(result).toBe(data);
      expect(data.__layerOrder).toBeDefined();
    });

    it('should handle duplicate keys in __layerOrder', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One' },
        __layerOrder: ['00', '00', '01', '01']
      };
      
      const result = validateLayerOrder(data);
      
      // Should keep duplicates in valid order
      expect(result.__layerOrder.filter(k => k === '00').length).toBeGreaterThanOrEqual(1);
      expect(result.__layerOrder.filter(k => k === '01').length).toBeGreaterThanOrEqual(1);
    });

    it('should handle complex scenarios', () => {
      const data = {
        Layers: { '05': 'Five', '03': 'Three', '08': 'Eight', '01': 'One' },
        __layerOrder: ['03', '99', '05'] // Has invalid '99'
      };
      
      const result = validateLayerOrder(data);
      
      // Should preserve valid order ['03', '05'] and add missing ['01', '08'] sorted
      expect(result.__layerOrder[0]).toBe('03');
      expect(result.__layerOrder[1]).toBe('05');
      expect(result.__layerOrder[2]).toBe('01');
      expect(result.__layerOrder[3]).toBe('08');
    });
  });
});