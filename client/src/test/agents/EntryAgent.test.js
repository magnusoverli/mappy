import { describe, it, expect, beforeEach } from 'vitest';
import {
  groupEntriesByLayer,
  removeLayerEntries,
  groupTargetsByLayer,
  removeLayerTargets,
  groupSourcesByLayer,
  removeLayerSources,
  updateLayerEntries
} from '../../EntryAgent.js';

describe('EntryAgent', () => {
  let sampleData;

  beforeEach(() => {
    sampleData = {
      Layers: {
        '00': 'Layer Zero',
        '01': 'Layer One',
        '02': 'Layer Two'
      },
      Targets: {
        '00.0000': '00000000',
        '00.0001': '00000001',
        '00.0002': '00000002',
        '01.0000': '00000010',
        '01.0005': '00000015',
        '02.0000': '00000020'
      },
      Sources: {
        '00.0000': '00000100',
        '00.0001': '00000101',
        '01.0000': '00000110',
        '02.0000': '00000120'
      }
    };
  });

  describe('groupEntriesByLayer', () => {
    it('should group entries by layer key', () => {
      const result = groupEntriesByLayer(sampleData, 'Targets');
      
      expect(result['00']).toHaveLength(3);
      expect(result['01']).toHaveLength(2);
      expect(result['02']).toHaveLength(1);
    });

    it('should calculate correct offsets for targets', () => {
      const result = groupEntriesByLayer(sampleData, 'Targets');
      
      // For 00.0000: index 0, value 0x00000000 = 0, offset = 0 - 0 = 0
      expect(result['00'][0]).toEqual({
        key: '00.0000',
        value: '00000000',
        offset: 0
      });
      
      // For 00.0001: index 1, value 0x00000001 = 1, offset = 1 - 1 = 0
      expect(result['00'][1]).toEqual({
        key: '00.0001',
        value: '00000001',
        offset: 0
      });
      
      // For 01.0005: index 5, value 0x00000015 = 21, offset = 5 - 21 = -16
      expect(result['01'][1]).toEqual({
        key: '01.0005',
        value: '00000015',
        offset: -16
      });
    });

    it('should calculate negative offsets for sources', () => {
      const result = groupEntriesByLayer(sampleData, 'Sources');
      
      // For 00.0000: index 0, value 0x00000100 = 256, offset = 0 - 256 = -256
      expect(result['00'][0]).toEqual({
        key: '00.0000',
        value: '00000100',
        offset: -256
      });
    });

    it('should handle empty entries', () => {
      const result = groupEntriesByLayer({}, 'Targets');
      
      expect(result).toEqual({});
    });

    it('should handle missing section', () => {
      const result = groupEntriesByLayer({ Layers: {} }, 'Targets');
      
      expect(result).toEqual({});
    });

    it('should sort entries within each layer', () => {
      const data = {
        Targets: {
          '00.0002': '00000002',
          '00.0000': '00000000',
          '00.0001': '00000001'
        }
      };
      
      const result = groupEntriesByLayer(data, 'Targets');
      
      expect(result['00'][0].key).toBe('00.0000');
      expect(result['00'][1].key).toBe('00.0001');
      expect(result['00'][2].key).toBe('00.0002');
    });
  });

  describe('removeLayerEntries', () => {
    it('should remove all entries for a layer', () => {
      removeLayerEntries(sampleData, '00', 'Targets');
      
      expect(sampleData.Targets['00.0000']).toBeUndefined();
      expect(sampleData.Targets['00.0001']).toBeUndefined();
      expect(sampleData.Targets['00.0002']).toBeUndefined();
      expect(sampleData.Targets['01.0000']).toBe('00000010');
    });

    it('should handle non-existent layer', () => {
      const originalTargets = { ...sampleData.Targets };
      
      removeLayerEntries(sampleData, '99', 'Targets');
      
      expect(sampleData.Targets).toEqual(originalTargets);
    });

    it('should handle missing section', () => {
      const data = { Layers: {} };
      
      expect(() => removeLayerEntries(data, '00', 'Targets')).not.toThrow();
    });

    it('should only remove entries for specified layer', () => {
      removeLayerEntries(sampleData, '01', 'Sources');
      
      expect(sampleData.Sources['00.0000']).toBe('00000100');
      expect(sampleData.Sources['01.0000']).toBeUndefined();
      expect(sampleData.Sources['02.0000']).toBe('00000120');
    });
  });

  describe('groupTargetsByLayer', () => {
    it('should group targets by layer', () => {
      const result = groupTargetsByLayer(sampleData);
      
      expect(result['00']).toHaveLength(3);
      expect(result['01']).toHaveLength(2);
      expect(result['02']).toHaveLength(1);
    });

    it('should return empty object for no targets', () => {
      const result = groupTargetsByLayer({ Targets: {} });
      
      expect(result).toEqual({});
    });

    it('should handle large hex values', () => {
      const data = {
        Targets: {
          '00.0000': 'FFFFFFFF',
          '00.0001': '80000000'
        }
      };
      
      const result = groupTargetsByLayer(data);
      
      expect(result['00'][0].value).toBe('FFFFFFFF');
      expect(result['00'][1].value).toBe('80000000');
    });
  });

  describe('removeLayerTargets', () => {
    it('should remove all targets for a layer', () => {
      removeLayerTargets(sampleData, '00');
      
      expect(sampleData.Targets['00.0000']).toBeUndefined();
      expect(sampleData.Targets['00.0001']).toBeUndefined();
      expect(sampleData.Targets['00.0002']).toBeUndefined();
      expect(Object.keys(sampleData.Targets).length).toBe(3); // Only layer 01 and 02 remain
    });

    it('should not affect other layers', () => {
      removeLayerTargets(sampleData, '01');
      
      expect(sampleData.Targets['00.0000']).toBe('00000000');
      expect(sampleData.Targets['02.0000']).toBe('00000020');
    });
  });

  describe('groupSourcesByLayer', () => {
    it('should group sources by layer', () => {
      const result = groupSourcesByLayer(sampleData);
      
      expect(result['00']).toHaveLength(2);
      expect(result['01']).toHaveLength(1);
      expect(result['02']).toHaveLength(1);
    });

    it('should calculate source offsets correctly', () => {
      const data = {
        Sources: {
          '00.0010': '00000005' // index 16, value 5, offset = 16 - 5 = 11
        }
      };
      
      const result = groupSourcesByLayer(data);
      
      expect(result['00'][0].offset).toBe(11);
    });
  });

  describe('removeLayerSources', () => {
    it('should remove all sources for a layer', () => {
      removeLayerSources(sampleData, '00');
      
      expect(sampleData.Sources['00.0000']).toBeUndefined();
      expect(sampleData.Sources['00.0001']).toBeUndefined();
      expect(Object.keys(sampleData.Sources).length).toBe(2);
    });
  });

  describe('updateLayerEntries', () => {
    it('should replace all entries for a layer', () => {
      const newEntries = [
        { key: '00.0000', value: 'AAAAAAAA' },
        { key: '00.0010', value: 'BBBBBBBB' }
      ];
      
      updateLayerEntries(sampleData, '00', 'Targets', newEntries);
      
      expect(sampleData.Targets['00.0000']).toBe('AAAAAAAA');
      expect(sampleData.Targets['00.0001']).toBeUndefined(); // Old entry removed
      expect(sampleData.Targets['00.0010']).toBe('BBBBBBBB');
      expect(sampleData.Targets['01.0000']).toBe('00000010'); // Other layers unchanged
    });

    it('should create section if it does not exist', () => {
      const data = { Layers: { '00': 'Test' } };
      const entries = [{ key: '00.0000', value: '12345678' }];
      
      updateLayerEntries(data, '00', 'Targets', entries);
      
      expect(data.Targets).toBeDefined();
      expect(data.Targets['00.0000']).toBe('12345678');
    });

    it('should handle empty entries array', () => {
      updateLayerEntries(sampleData, '00', 'Targets', []);
      
      expect(sampleData.Targets['00.0000']).toBeUndefined();
      expect(sampleData.Targets['00.0001']).toBeUndefined();
      expect(sampleData.Targets['01.0000']).toBe('00000010');
    });

    it('should work with Sources', () => {
      const newSources = [
        { key: '01.0000', value: 'CCCCCCCC' },
        { key: '01.0001', value: 'DDDDDDDD' }
      ];
      
      updateLayerEntries(sampleData, '01', 'Sources', newSources);
      
      expect(sampleData.Sources['01.0000']).toBe('CCCCCCCC');
      expect(sampleData.Sources['01.0001']).toBe('DDDDDDDD');
      expect(sampleData.Sources['00.0000']).toBe('00000100');
    });

    it('should handle entries with same key (last wins)', () => {
      const duplicateEntries = [
        { key: '00.0000', value: 'FIRST' },
        { key: '00.0000', value: 'SECOND' },
        { key: '00.0000', value: 'THIRD' }
      ];
      
      updateLayerEntries(sampleData, '00', 'Targets', duplicateEntries);
      
      expect(sampleData.Targets['00.0000']).toBe('THIRD');
    });

    it('should preserve entries from other layers', () => {
      const layer00Entries = [{ key: '00.0000', value: 'NEW00' }];
      const layer01Entries = [{ key: '01.0000', value: 'NEW01' }];
      
      updateLayerEntries(sampleData, '00', 'Targets', layer00Entries);
      updateLayerEntries(sampleData, '01', 'Targets', layer01Entries);
      
      expect(sampleData.Targets['00.0000']).toBe('NEW00');
      expect(sampleData.Targets['01.0000']).toBe('NEW01');
      expect(sampleData.Targets['02.0000']).toBe('00000020');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete layer removal and recreation', () => {
      // Remove all entries for layer 00
      removeLayerTargets(sampleData, '00');
      removeLayerSources(sampleData, '00');
      
      expect(sampleData.Targets['00.0000']).toBeUndefined();
      expect(sampleData.Sources['00.0000']).toBeUndefined();
      
      // Add new entries for layer 00
      const newTargets = [
        { key: '00.0000', value: 'NEWVALUE' }
      ];
      const newSources = [
        { key: '00.0000', value: 'NEWSOURCE' }
      ];
      
      updateLayerEntries(sampleData, '00', 'Targets', newTargets);
      updateLayerEntries(sampleData, '00', 'Sources', newSources);
      
      expect(sampleData.Targets['00.0000']).toBe('NEWVALUE');
      expect(sampleData.Sources['00.0000']).toBe('NEWSOURCE');
    });

    it('should maintain consistency when switching between entry types', () => {
      const targets = groupTargetsByLayer(sampleData);
      const sources = groupSourcesByLayer(sampleData);
      
      expect(Object.keys(targets)).toContain('00');
      expect(Object.keys(sources)).toContain('00');
      
      // Both should have the same layer keys (where entries exist)
      const targetLayers = new Set(Object.keys(targets));
      const sourceLayers = new Set(Object.keys(sources));
      const allLayers = new Set([...targetLayers, ...sourceLayers]);
      
      expect(allLayers.size).toBe(3); // 00, 01, 02
    });
  });
});