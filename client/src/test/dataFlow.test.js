import { describe, it, expect, beforeEach } from 'vitest';
import { parseIni, stringifyIni } from '../ParserAgent.js';
import { listLayers, addLayer, updateLayer, removeLayer } from '../LayersAgent.js';
import { groupTargetsByLayer, groupSourcesByLayer } from '../EntryAgent.js';
import { formatHexValue, parseHexValue, formatLayerKey } from '../utils/conversionUtils.js';
import { validateLayerOrder } from '../utils/entryHelpers.js';

describe('Data Flow Integration Tests', () => {
  let sampleIniData;
  
  beforeEach(() => {
    sampleIniData = {
      Layers: {
        '00': 'Test Layer 1',
        '01': 'Test Layer 2',
        '03': 'Test Layer 3'
      },
      Targets: {
        '00.0000': '00000000',
        '00.0001': '00000001',
        '01.0000': '00000010',
        '03.0000': '00000030'
      },
      Sources: {
        '00.0000': '00000100',
        '01.0000': '00000110',
        '03.0000': '00000130'
      },
      __layerOrder: ['00', '01', '03']
    };
  });

  describe('Hex Case Standardization', () => {
    it('should format hex values as uppercase', () => {
      expect(formatHexValue(255)).toBe('000000FF');
      expect(formatHexValue(0)).toBe('00000000');
      expect(formatHexValue(4294967295)).toBe('FFFFFFFF');
    });

    it('should parse hex values correctly regardless of case', () => {
      expect(parseHexValue('000000ff')).toBe(255);
      expect(parseHexValue('000000FF')).toBe(255);
      expect(parseHexValue('FFFFFFFF')).toBe(4294967295);
    });
  });

  describe('Layer Order Validation', () => {
    it('should validate and fix layer order', () => {
      const data = {
        Layers: { '00': 'Layer 0', '01': 'Layer 1', '02': 'Layer 2' },
        __layerOrder: ['00', '02'] // Missing '01'
      };
      
      const validated = validateLayerOrder(data);
      expect(validated.__layerOrder).toEqual(['00', '02', '01']);
    });

    it('should remove invalid keys from layer order', () => {
      const data = {
        Layers: { '00': 'Layer 0', '01': 'Layer 1' },
        __layerOrder: ['00', '02', '01'] // '02' doesn't exist
      };
      
      const validated = validateLayerOrder(data);
      expect(validated.__layerOrder).toEqual(['00', '01']);
    });

    it('should handle missing __layerOrder', () => {
      const data = {
        Layers: { '00': 'Layer 0', '01': 'Layer 1' }
      };
      
      const validated = validateLayerOrder(data);
      expect(validated.__layerOrder).toEqual(['00', '01']);
    });
  });

  describe('Parse and Stringify Round Trip', () => {
    it('should preserve data through parse/stringify cycle', () => {
      const iniText = `[Layers]
00="Test Layer 1"
01="Test Layer 2"

[Targets]
00.0000=00000000
00.0001=00000001
01.0000=00000010

[Sources]
00.0000=00000100
01.0000=00000110`;

      const parsed = parseIni(iniText);
      const stringified = stringifyIni(parsed);
      const reparsed = parseIni(stringified);

      expect(reparsed.Layers).toEqual(parsed.Layers);
      expect(reparsed.Targets).toEqual(parsed.Targets);
      expect(reparsed.Sources).toEqual(parsed.Sources);
      expect(reparsed.__layerOrder).toEqual(parsed.__layerOrder);
    });

    it('should maintain layer order through operations', () => {
      const data = { ...sampleIniData };
      
      // Add a layer
      const newKey = addLayer(data);
      expect(data.__layerOrder).toContain(newKey);
      
      // Update a layer
      updateLayer(data, 0, '00', 'Updated Layer');
      expect(data.__layerOrder).toContain('00');
      
      // Remove a layer
      removeLayer(data, '01');
      expect(data.__layerOrder).not.toContain('01');
      expect(data.Layers['01']).toBeUndefined();
    });
  });

  describe('Entry Grouping', () => {
    it('should group targets by layer correctly', () => {
      const grouped = groupTargetsByLayer(sampleIniData);
      
      expect(grouped['00']).toHaveLength(2);
      expect(grouped['01']).toHaveLength(1);
      expect(grouped['03']).toHaveLength(1);
      
      expect(grouped['00'][0]).toEqual({
        key: '00.0000',
        value: '00000000',
        offset: 0
      });
      
      expect(grouped['00'][1]).toEqual({
        key: '00.0001',
        value: '00000001',
        offset: 0
      });
    });

    it('should group sources by layer correctly', () => {
      const grouped = groupSourcesByLayer(sampleIniData);
      
      expect(grouped['00']).toHaveLength(1);
      expect(grouped['01']).toHaveLength(1);
      expect(grouped['03']).toHaveLength(1);
      
      expect(grouped['00'][0]).toEqual({
        key: '00.0000',
        value: '00000100',
        offset: -256
      });
    });

    it('should calculate offsets correctly', () => {
      const data = {
        Targets: {
          '00.0010': '00000005' // decimal 10 - hex 5 = offset 5
        }
      };
      
      const grouped = groupTargetsByLayer(data);
      // Index 0010 = 10 decimal, value 00000005 = 5 hex, so offset = 10 - 5 = 5
      expect(grouped['00'][0].offset).toBe(5);
    });
  });

  describe('Layer Management', () => {
    it('should list layers in correct order', () => {
      const layers = listLayers(sampleIniData);
      
      expect(layers).toHaveLength(3);
      expect(layers[0]).toEqual({ key: '00', value: 'Test Layer 1' });
      expect(layers[1]).toEqual({ key: '01', value: 'Test Layer 2' });
      expect(layers[2]).toEqual({ key: '03', value: 'Test Layer 3' });
    });

    it('should find next available layer key', () => {
      const data = { ...sampleIniData };
      const newKey = addLayer(data);
      
      expect(newKey).toBe('02'); // Should fill the gap
      expect(data.Layers[newKey]).toBe('');
      expect(data.__layerOrder).toContain(newKey);
    });

    it('should update layer and maintain order', () => {
      const data = { ...sampleIniData };
      updateLayer(data, 1, '01', 'Updated Layer Name');
      
      expect(data.Layers['01']).toBe('Updated Layer Name');
      expect(data.__layerOrder).toEqual(['00', '01', '03']);
    });

    it('should handle layer key changes', () => {
      const data = { ...sampleIniData };
      updateLayer(data, 1, '05', 'Renamed Layer');
      
      expect(data.Layers['01']).toBeUndefined();
      expect(data.Layers['05']).toBe('Renamed Layer');
      expect(data.__layerOrder).toEqual(['00', '05', '03']);
    });
  });

  describe('Data Consistency', () => {
    it('should maintain data integrity during complex operations', () => {
      const data = { ...sampleIniData };
      
      // Add a new layer
      const newKey = addLayer(data);
      expect(formatLayerKey(parseInt(newKey, 10))).toBe(newKey);
      
      // Update existing layer
      updateLayer(data, 0, '00', 'Modified Layer');
      
      // Remove a layer
      removeLayer(data, '01');
      
      // Verify consistency
      const layers = listLayers(data);
      const targetGroups = groupTargetsByLayer(data);
      const sourceGroups = groupSourcesByLayer(data);
      
      // All layer keys should exist in groups
      layers.forEach(layer => {
        if (targetGroups[layer.key]) {
          targetGroups[layer.key].forEach(entry => {
            expect(entry.key.startsWith(layer.key + '.')).toBe(true);
          });
        }
        if (sourceGroups[layer.key]) {
          sourceGroups[layer.key].forEach(entry => {
            expect(entry.key.startsWith(layer.key + '.')).toBe(true);
          });
        }
      });
      
      // Layer order should be valid
      expect(data.__layerOrder.every(key => data.Layers[key] !== undefined)).toBe(true);
    });

    it('should handle empty data gracefully', () => {
      const emptyData = { Layers: {}, Targets: {}, Sources: {}, __layerOrder: [] };
      
      expect(() => listLayers(emptyData)).not.toThrow();
      expect(() => groupTargetsByLayer(emptyData)).not.toThrow();
      expect(() => groupSourcesByLayer(emptyData)).not.toThrow();
      expect(() => validateLayerOrder(emptyData)).not.toThrow();
      
      expect(listLayers(emptyData)).toEqual([]);
      expect(groupTargetsByLayer(emptyData)).toEqual({});
      expect(groupSourcesByLayer(emptyData)).toEqual({});
    });
  });
});