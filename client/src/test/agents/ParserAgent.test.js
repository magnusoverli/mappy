import { describe, it, expect, beforeEach } from 'vitest';
import { parseIni, stringifyIni } from '../../ParserAgent.js';

describe('ParserAgent', () => {
  describe('parseIni', () => {
    it('should parse basic INI structure', () => {
      const iniText = `[Layers]
00="Layer Zero"
01="Layer One"

[Targets]
00.0000=00000000
01.0000=00000001

[Sources]
00.0000=00000100
01.0000=00000101`;

      const result = parseIni(iniText);
      
      expect(result.Layers).toEqual({
        '00': 'Layer Zero',
        '01': 'Layer One'
      });
      expect(result.Targets).toEqual({
        '00.0000': '00000000',
        '01.0000': '00000001'
      });
      expect(result.Sources).toEqual({
        '00.0000': '00000100',
        '01.0000': '00000101'
      });
      expect(result.__layerOrder).toEqual(['00', '01']);
    });

    it('should preserve layer order from file', () => {
      const iniText = `[Layers]
02="Second"
00="Zero"
01="First"`;

      const result = parseIni(iniText);
      
      expect(result.__layerOrder).toEqual(['02', '00', '01']);
    });

    it('should handle empty sections', () => {
      const iniText = `[Layers]
[Targets]
[Sources]`;

      const result = parseIni(iniText);
      
      expect(result.Layers).toEqual({});
      expect(result.Targets).toEqual({});
      expect(result.Sources).toEqual({});
      expect(result.__layerOrder).toEqual([]);
    });

    it('should handle Windows line endings', () => {
      const iniText = `[Layers]\r\n00="Test Layer"\r\n\r\n[Targets]\r\n00.0000=00000000`;

      const result = parseIni(iniText);
      
      expect(result.Layers['00']).toBe('Test Layer');
      expect(result.Targets['00.0000']).toBe('00000000');
    });

    it('should handle layers with spaces around equals', () => {
      const iniText = `[Layers]
00 = "Test Layer"
01="No Spaces"
02  =  "Many Spaces"`;

      const result = parseIni(iniText);
      
      expect(result.Layers['00']).toBe('Test Layer');
      expect(result.Layers['01']).toBe('No Spaces');
      expect(result.Layers['02']).toBe('Many Spaces');
      expect(result.__layerOrder).toEqual(['00', '01', '02']);
    });

    it('should handle quoted and unquoted values', () => {
      const iniText = `[Layers]
00="Quoted Value"
01=Unquoted Value
02='Single Quotes'`;

      const result = parseIni(iniText);
      
      expect(result.Layers['00']).toBe('Quoted Value');
      expect(result.Layers['01']).toBe('Unquoted Value');
      // ini parser removes outer single quotes
      expect(result.Layers['02']).toBe('Single Quotes');
    });

    it('should handle special characters in values', () => {
      const iniText = `[Layers]
00="Layer with = equals"
01="Layer with /path/to/file"
02="Unicode: 测试"`;

      const result = parseIni(iniText);
      
      expect(result.Layers['00']).toBe('Layer with = equals');
      expect(result.Layers['01']).toBe('Layer with /path/to/file');
      expect(result.Layers['02']).toBe('Unicode: 测试');
    });

    it('should stop parsing layers at next section', () => {
      const iniText = `[Layers]
00="First"
01="Second"
[Internal]
Key=Value
[MoreLayers]
02="Should not be in layers"`;

      const result = parseIni(iniText);
      
      expect(result.__layerOrder).toEqual(['00', '01']);
      expect(result.Layers['02']).toBeUndefined();
    });

    it('should validate and fix layer order', () => {
      const iniText = `[Layers]
00="Valid"
99="Also Valid"
01="Middle"`;

      const result = parseIni(iniText);
      
      // Should preserve original order
      expect(result.__layerOrder).toEqual(['00', '99', '01']);
    });

    it('should handle comments and empty lines', () => {
      const iniText = `[Layers]
; This is a comment
00="Layer Zero"

01="Layer One"
# Another comment style

[Targets]`;

      const result = parseIni(iniText);
      
      expect(result.Layers).toEqual({
        '00': 'Layer Zero',
        '01': 'Layer One'
      });
    });
  });

  describe('stringifyIni', () => {
    it('should generate properly formatted INI', () => {
      const data = {
        Layers: { '00': 'Test Layer', '01': 'Another Layer' },
        Targets: { '00.0000': '00000000', '01.0000': '00000001' },
        Sources: { '00.0000': '00000100' },
        __layerOrder: ['00', '01']
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('[Layers]');
      expect(result).toContain('00="Test Layer"');
      expect(result).toContain('01="Another Layer"');
      expect(result).toContain('[Targets]');
      expect(result).toContain('00.0000 = 00000000');
      expect(result).toContain('[Sources]');
    });

    it('should use custom newline character', () => {
      const data = {
        Layers: { '00': 'Test' },
        __layerOrder: ['00']
      };

      const result = stringifyIni(data, '\r\n');
      
      expect(result).toContain('\r\n');
      expect(result.split('\r\n').length).toBeGreaterThan(1);
    });

    it('should preserve layer order', () => {
      const data = {
        Layers: { '02': 'Two', '00': 'Zero', '01': 'One' },
        __layerOrder: ['02', '00', '01']
      };

      const result = stringifyIni(data);
      const lines = result.split('\n');
      const layerSection = lines.indexOf('[Layers]');
      
      expect(lines[layerSection + 1]).toContain('02=');
      expect(lines[layerSection + 2]).toContain('00=');
      expect(lines[layerSection + 3]).toContain('01=');
    });

    it('should sort targets and sources by layer and index', () => {
      const data = {
        Targets: {
          '01.0001': '00000011',
          '00.0001': '00000001',
          '01.0000': '00000010',
          '00.0000': '00000000'
        },
        Sources: {
          '01.0000': '00000110',
          '00.0000': '00000100'
        }
      };

      const result = stringifyIni(data);
      const lines = result.split('\n');
      
      // Find Targets section
      const targetsIdx = lines.findIndex(l => l.includes('[Targets]'));
      expect(lines[targetsIdx + 1]).toContain('00.0000');
      expect(lines[targetsIdx + 2]).toContain('00.0001');
      expect(lines[targetsIdx + 3]).toContain('01.0000');
      expect(lines[targetsIdx + 4]).toContain('01.0001');
    });

    it('should add quotes to layer values', () => {
      const data = {
        Layers: { '00': 'No Quotes Initially' },
        __layerOrder: ['00']
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('00="No Quotes Initially"');
    });

    it('should handle already quoted values', () => {
      const data = {
        Layers: { '00': '"Already Quoted"' },
        __layerOrder: ['00']
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('00="Already Quoted"');
      expect(result).not.toContain('""Already Quoted""');
    });

    it('should handle empty layer values', () => {
      const data = {
        Layers: { '00': '' },
        __layerOrder: ['00']
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('00=""');
    });

    it('should format Internal section without quotes', () => {
      const data = {
        Internal: { 'Key1': 'Value1', 'Key2': 'Value2' }
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('[Internal]');
      expect(result).toContain('Key1=Value1');
      expect(result).toContain('Key2=Value2');
      expect(result).not.toContain('Key1="Value1"');
    });

    it('should handle layers not in __layerOrder', () => {
      const data = {
        Layers: { '00': 'Zero', '01': 'One', '02': 'Two' },
        __layerOrder: ['00', '02'] // Missing '01'
      };

      const result = stringifyIni(data);
      const lines = result.split('\n');
      const layerSection = lines.indexOf('[Layers]');
      
      // Should include all layers, ordered ones first
      expect(lines[layerSection + 1]).toContain('00=');
      expect(lines[layerSection + 2]).toContain('02=');
      expect(lines[layerSection + 3]).toContain('01='); // Added at end
    });

    it('should handle missing __layerOrder', () => {
      const data = {
        Layers: { '02': 'Two', '00': 'Zero', '01': 'One' }
        // No __layerOrder
      };

      const result = stringifyIni(data);
      
      expect(result).toContain('00=');
      expect(result).toContain('01=');
      expect(result).toContain('02=');
    });

    it('should remove __layerOrder from output', () => {
      const data = {
        Layers: { '00': 'Test' },
        __layerOrder: ['00']
      };

      const result = stringifyIni(data);
      
      expect(result).not.toContain('__layerOrder');
    });
  });

  describe('round-trip conversion', () => {
    it('should preserve data through parse and stringify', () => {
      const original = `[Layers]
00="First Layer"
01="Second Layer"

[Targets]
00.0000=00000000
00.0001=00000001
01.0000=00000010

[Sources]
00.0000=00000100
01.0000=00000110

[Internal]
Version=1.0
Type=Mapping`;

      const parsed = parseIni(original);
      const stringified = stringifyIni(parsed);
      const reparsed = parseIni(stringified);
      
      expect(reparsed.Layers).toEqual(parsed.Layers);
      expect(reparsed.Targets).toEqual(parsed.Targets);
      expect(reparsed.Sources).toEqual(parsed.Sources);
      expect(reparsed.Internal).toEqual(parsed.Internal);
      expect(reparsed.__layerOrder).toEqual(parsed.__layerOrder);
    });
  });
});