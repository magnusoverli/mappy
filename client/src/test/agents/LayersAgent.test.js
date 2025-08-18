import { describe, it, expect, beforeEach } from 'vitest';
import { listLayers, updateLayer, addLayer, removeLayer } from '../../LayersAgent.js';

describe('LayersAgent', () => {
  let sampleData;

  beforeEach(() => {
    sampleData = {
      Layers: {
        '00': 'First Layer',
        '02': 'Third Layer',
        '01': 'Second Layer'
      },
      Targets: {
        '00.0000': '00000000',
        '01.0000': '00000001',
        '02.0000': '00000002'
      },
      __layerOrder: ['00', '02', '01']
    };
  });

  describe('listLayers', () => {
    it('should return layers sorted by numeric key', () => {
      const result = listLayers(sampleData);
      
      expect(result).toEqual([
        { key: '00', value: 'First Layer' },
        { key: '01', value: 'Second Layer' },
        { key: '02', value: 'Third Layer' }
      ]);
    });

    it('should handle empty layers object', () => {
      const result = listLayers({ Layers: {} });
      
      expect(result).toEqual([]);
    });

    it('should handle missing layers object', () => {
      const result = listLayers({});
      
      expect(result).toEqual([]);
    });

    it('should handle layers with high numbers', () => {
      const data = {
        Layers: {
          '99': 'Last',
          '00': 'First',
          '50': 'Middle'
        }
      };
      
      const result = listLayers(data);
      
      expect(result[0].key).toBe('00');
      expect(result[1].key).toBe('50');
      expect(result[2].key).toBe('99');
    });

    it('should handle non-standard layer keys', () => {
      const data = {
        Layers: {
          '10': 'Ten',
          '09': 'Nine',
          '11': 'Eleven'
        }
      };
      
      const result = listLayers(data);
      
      expect(result[0].key).toBe('09');
      expect(result[1].key).toBe('10');
      expect(result[2].key).toBe('11');
    });
  });

  describe('updateLayer', () => {
    it('should update layer value without changing key', () => {
      const data = { ...sampleData };
      
      updateLayer(data, 0, '00', 'Updated First Layer');
      
      expect(data.Layers['00']).toBe('Updated First Layer');
      expect(data.__layerOrder).toContain('00');
    });

    it('should rename layer key', () => {
      const data = { ...sampleData };
      
      updateLayer(data, 1, '05', 'Renamed Layer');
      
      expect(data.Layers['01']).toBeUndefined();
      expect(data.Layers['05']).toBe('Renamed Layer');
      expect(data.__layerOrder).toContain('05');
      expect(data.__layerOrder).not.toContain('01');
    });

    it('should handle updating non-existent index', () => {
      const data = { ...sampleData };
      
      updateLayer(data, 10, '99', 'New Layer');
      
      expect(data.Layers['99']).toBe('New Layer');
    });

    it('should create Layers object if missing', () => {
      const data = {};
      
      updateLayer(data, 0, '00', 'First Layer');
      
      expect(data.Layers).toBeDefined();
      expect(data.Layers['00']).toBe('First Layer');
    });

    it('should update __layerOrder when renaming', () => {
      const data = { ...sampleData };
      const originalOrder = [...data.__layerOrder];
      
      updateLayer(data, 0, '03', 'Renamed');
      
      expect(data.__layerOrder[0]).toBe('03');
      expect(data.__layerOrder[1]).toBe(originalOrder[1]);
      expect(data.__layerOrder[2]).toBe(originalOrder[2]);
    });

    it('should handle missing __layerOrder', () => {
      const data = {
        Layers: { '00': 'Test' }
      };
      
      updateLayer(data, 0, '01', 'Renamed');
      
      expect(data.Layers['01']).toBe('Renamed');
      expect(data.Layers['00']).toBeUndefined();
    });

    it('should validate layer order after update', () => {
      const data = { ...sampleData };
      data.__layerOrder = ['00', '99', '01']; // '99' doesn't exist
      
      const result = updateLayer(data, 0, '00', 'Updated');
      
      // Validation should remove invalid keys
      expect(result.__layerOrder).not.toContain('99');
    });
  });

  describe('addLayer', () => {
    it('should add layer with next available key', () => {
      const data = {
        Layers: { '00': 'Zero', '02': 'Two' }
      };
      
      const newKey = addLayer(data);
      
      expect(newKey).toBe('01');
      expect(data.Layers['01']).toBe('');
    });

    it('should find first available slot from zero', () => {
      const data = {
        Layers: { '01': 'One', '02': 'Two' }
      };
      
      const newKey = addLayer(data);
      
      expect(newKey).toBe('00');
      expect(data.Layers['00']).toBe('');
    });

    it('should handle sequential layers', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One', '02': 'Two' }
      };
      
      const newKey = addLayer(data);
      
      expect(newKey).toBe('03');
      expect(data.Layers['03']).toBe('');
    });

    it('should create Layers object if missing', () => {
      const data = {};
      
      const newKey = addLayer(data);
      
      expect(data.Layers).toBeDefined();
      expect(newKey).toBe('00');
      expect(data.Layers['00']).toBe('');
    });

    it('should update __layerOrder', () => {
      const data = {
        Layers: { '00': 'Zero' },
        __layerOrder: ['00']
      };
      
      const newKey = addLayer(data);
      
      expect(data.__layerOrder).toContain(newKey);
      expect(data.__layerOrder.length).toBe(2);
    });

    it('should create __layerOrder if missing', () => {
      const data = {
        Layers: { '00': 'Zero' }
      };
      
      const newKey = addLayer(data);
      
      expect(data.__layerOrder).toBeDefined();
      expect(data.__layerOrder).toContain(newKey);
    });

    it('should handle layers up to 99', () => {
      const data = { Layers: {} };
      
      // Fill up to 99
      for (let i = 0; i <= 98; i++) {
        data.Layers[i.toString().padStart(2, '0')] = `Layer ${i}`;
      }
      
      const newKey = addLayer(data);
      
      expect(newKey).toBe('99');
    });

    it('should format single digit keys with leading zero', () => {
      const data = { Layers: {} };
      
      const newKey = addLayer(data);
      
      expect(newKey).toBe('00');
      expect(newKey.length).toBe(2);
    });
  });

  describe('removeLayer', () => {
    it('should remove layer from Layers object', () => {
      const data = { ...sampleData };
      
      removeLayer(data, '01');
      
      expect(data.Layers['01']).toBeUndefined();
      expect(data.Layers['00']).toBe('First Layer');
      expect(data.Layers['02']).toBe('Third Layer');
    });

    it('should remove layer from __layerOrder', () => {
      const data = { ...sampleData };
      
      removeLayer(data, '02');
      
      expect(data.__layerOrder).not.toContain('02');
      expect(data.__layerOrder).toEqual(['00', '01']);
    });

    it('should handle removing non-existent layer', () => {
      const data = { ...sampleData };
      const originalKeys = Object.keys(data.Layers);
      
      removeLayer(data, '99');
      
      expect(Object.keys(data.Layers)).toEqual(originalKeys);
    });

    it('should handle missing Layers object', () => {
      const data = { __layerOrder: ['00'] };
      
      expect(() => removeLayer(data, '00')).not.toThrow();
      expect(data.__layerOrder).not.toContain('00');
    });

    it('should handle missing __layerOrder', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One' }
      };
      
      removeLayer(data, '00');
      
      expect(data.Layers['00']).toBeUndefined();
    });

    it('should validate layer order after removal', () => {
      const data = { ...sampleData };
      
      const result = removeLayer(data, '01');
      
      expect(result.__layerOrder).not.toContain('01');
      expect(result.__layerOrder).toEqual(['00', '02']);
    });

    it('should handle removing all layers', () => {
      const data = {
        Layers: { '00': 'Only Layer' },
        __layerOrder: ['00']
      };
      
      removeLayer(data, '00');
      
      expect(Object.keys(data.Layers)).toHaveLength(0);
      expect(data.__layerOrder).toHaveLength(0);
    });

    it('should not affect other data sections', () => {
      const data = { ...sampleData };
      const originalTargets = { ...data.Targets };
      
      removeLayer(data, '01');
      
      expect(data.Targets).toEqual(originalTargets);
    });
  });

  describe('edge cases', () => {
    it('should handle layers with empty string values', () => {
      const data = {
        Layers: { '00': '', '01': 'Not Empty', '02': '' }
      };
      
      const layers = listLayers(data);
      
      expect(layers[0].value).toBe('');
      expect(layers[1].value).toBe('Not Empty');
      expect(layers[2].value).toBe('');
    });

    it('should handle concurrent modifications', () => {
      const data = { ...sampleData };
      
      // Simulate concurrent modifications
      addLayer(data);
      updateLayer(data, 0, '00', 'Modified');
      removeLayer(data, '02');
      addLayer(data);
      
      expect(data.Layers['00']).toBe('Modified');
      expect(data.Layers['02']).toBeUndefined();
      expect(Object.keys(data.Layers).length).toBe(4); // 00, 01, 03, 04
    });
  });
});