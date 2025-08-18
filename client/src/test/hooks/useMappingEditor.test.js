import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import useMappingEditor from '../../hooks/useMappingEditor.js';
import * as FileAgent from '../../FileAgent.js';
import * as ParserAgent from '../../ParserAgent.js';
import * as LayersAgent from '../../LayersAgent.js';
import * as StorageAgent from '../../StorageAgent.js';
import * as EntryAgent from '../../EntryAgent.js';

// Mock all agent modules
vi.mock('../../FileAgent.js');
vi.mock('../../ParserAgent.js');
vi.mock('../../LayersAgent.js');
vi.mock('../../StorageAgent.js');
vi.mock('../../EntryAgent.js');

describe('useMappingEditor', () => {
  const mockParsedData = {
    Layers: {
      '00': 'Test Layer 0',
      '01': 'Test Layer 1'
    },
    Targets: {
      '00.0000': '00000000',
      '01.0000': '00000001'
    },
    Sources: {
      '00.0000': '00000100',
      '01.0000': '00000101'
    },
    __layerOrder: ['00', '01']
  };

  const mockLayerList = [
    { key: '00', value: 'Test Layer 0' },
    { key: '01', value: 'Test Layer 1' }
  ];

  const mockTargets = {
    '00': [{ key: '00.0000', value: '00000000', offset: 0 }],
    '01': [{ key: '01.0000', value: '00000001', offset: -1 }]
  };

  const mockSources = {
    '00': [{ key: '00.0000', value: '00000100', offset: -256 }],
    '01': [{ key: '01.0000', value: '00000101', offset: -257 }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    StorageAgent.loadState.mockReturnValue(null);
    StorageAgent.saveState.mockImplementation(() => {});
    StorageAgent.clearState.mockImplementation(() => {});
    
    ParserAgent.parseIni.mockReturnValue(mockParsedData);
    ParserAgent.stringifyIni.mockReturnValue('[Layers]\n00="Test Layer 0"');
    
    LayersAgent.listLayers.mockReturnValue(mockLayerList);
    LayersAgent.addLayer.mockReturnValue('02');
    LayersAgent.updateLayer.mockImplementation(() => {});
    LayersAgent.removeLayer.mockImplementation(() => {});
    
    EntryAgent.groupTargetsByLayer.mockReturnValue(mockTargets);
    EntryAgent.groupSourcesByLayer.mockReturnValue(mockSources);
    EntryAgent.removeLayerTargets.mockImplementation(() => {});
    EntryAgent.removeLayerSources.mockImplementation(() => {});
    EntryAgent.updateLayerEntries.mockImplementation(() => {});
    
    FileAgent.openFile.mockResolvedValue({ text: 'test content', newline: '\n' });
    FileAgent.exportFile.mockImplementation(() => {});
  });

  describe('initialization', () => {
    it('should initialize with empty state when no saved state exists', () => {
      const { result } = renderHook(() => useMappingEditor());
      
      expect(result.current.iniData).toBeNull();
      expect(result.current.layers).toEqual([]);
      expect(result.current.targets).toEqual({});
      expect(result.current.sources).toEqual({});
      expect(result.current.selectedLayer).toBeNull();
      expect(result.current.fileName).toBe('mappingfile.ini');
      expect(result.current.newline).toBe('\n');
    });

    it('should restore from saved state', () => {
      const savedState = {
        text: '[Layers]\n00="Saved Layer"',
        fileName: 'saved.ini',
        newline: '\r\n'
      };
      
      StorageAgent.loadState.mockReturnValue(savedState);
      
      const { result } = renderHook(() => useMappingEditor());
      
      expect(ParserAgent.parseIni).toHaveBeenCalledWith(savedState.text);
      expect(result.current.iniData).toEqual(mockParsedData);
      expect(result.current.layers).toEqual(mockLayerList);
      expect(result.current.fileName).toBe('saved.ini');
      expect(result.current.newline).toBe('\r\n');
      expect(result.current.selectedLayer).toBe('00');
    });

    it('should handle corrupted saved state', () => {
      StorageAgent.loadState.mockReturnValue({ text: 'corrupted' });
      ParserAgent.parseIni.mockImplementation(() => {
        throw new Error('Parse error');
      });
      
      const { result } = renderHook(() => useMappingEditor());
      
      expect(StorageAgent.clearState).toHaveBeenCalled();
      expect(result.current.iniData).toBeNull();
    });
  });

  describe('file operations', () => {
    it('should handle file upload', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      const file = new File(['content'], 'test.ini');
      const event = { target: { files: [file] } };
      
      await act(async () => {
        await result.current.handleFileChange(event);
      });
      
      await waitFor(() => {
        expect(FileAgent.openFile).toHaveBeenCalledWith(file);
        expect(result.current.loading).toBe(false);
        expect(result.current.iniData).toEqual(mockParsedData);
        expect(result.current.fileName).toBe('test.ini');
        expect(result.current.status).toContain('Loaded');
      });
    });

    it('should handle file read errors', async () => {
      FileAgent.openFile.mockRejectedValue(new Error('Read failed'));
      
      const { result } = renderHook(() => useMappingEditor());
      const file = new File(['content'], 'test.ini');
      const event = { target: { files: [file] } };
      
      await act(async () => {
        await result.current.handleFileChange(event);
      });
      
      await waitFor(() => {
        expect(result.current.status).toBe('Failed to read file');
        expect(result.current.loading).toBe(false);
      });
    });

    it('should handle download', () => {
      const { result } = renderHook(() => useMappingEditor());
      
      act(() => {
        // Set up data first
        result.current.handleFileChange({
          target: { files: [new File(['content'], 'test.ini')] }
        });
      });
      
      // Wait for data to be loaded
      waitFor(() => {
        expect(result.current.iniData).not.toBeNull();
      });
      
      act(() => {
        result.current.download();
      });
      
      expect(ParserAgent.stringifyIni).toHaveBeenCalledWith(
        expect.anything(),
        result.current.newline
      );
      expect(FileAgent.exportFile).toHaveBeenCalled();
    });

    it('should not download when no data exists', () => {
      const { result } = renderHook(() => useMappingEditor());
      
      act(() => {
        result.current.download();
      });
      
      expect(FileAgent.exportFile).not.toHaveBeenCalled();
    });
  });

  describe('layer operations', () => {
    it('should handle path change', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      // Load initial data
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      act(() => {
        result.current.handlePathChange('00', 'Updated Layer Name');
      });
      
      expect(LayersAgent.updateLayer).toHaveBeenCalledWith(
        expect.objectContaining({ Layers: expect.any(Object) }),
        0,
        '00',
        'Updated Layer Name'
      );
    });

    it('should handle adding a layer', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      // Load initial data
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      act(() => {
        result.current.handleAddLayer();
      });
      
      expect(LayersAgent.addLayer).toHaveBeenCalled();
      expect(result.current.selectedLayer).toBe('02');
    });

    it('should handle removing a layer', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      // Load initial data
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      act(() => {
        result.current.handleRemoveLayer('00');
      });
      
      expect(LayersAgent.removeLayer).toHaveBeenCalledWith(
        expect.any(Object),
        '00'
      );
      expect(EntryAgent.removeLayerTargets).toHaveBeenCalledWith(
        expect.any(Object),
        '00'
      );
      expect(EntryAgent.removeLayerSources).toHaveBeenCalledWith(
        expect.any(Object),
        '00'
      );
    });
  });

  describe('entry operations', () => {
    it('should handle updating entries', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      // Load initial data
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      const newEntries = [
        { key: '00.0000', value: 'FFFFFFFF' }
      ];
      
      await act(async () => {
        await result.current.handleUpdateEntries('00', 'Targets', newEntries);
      });
      
      expect(EntryAgent.updateLayerEntries).toHaveBeenCalledWith(
        expect.any(Object),
        '00',
        'Targets',
        newEntries
      );
      expect(result.current.status).toContain('Updated targets');
    });
  });

  describe('state management', () => {
    it('should save state when data changes', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      await waitFor(() => {
        expect(StorageAgent.saveState).toHaveBeenCalledWith({
          text: expect.any(String),
          fileName: 'test.ini',
          newline: '\n'
        });
      });
    });

    it('should clear state when data is null', () => {
      const { result } = renderHook(() => useMappingEditor());
      
      act(() => {
        result.current.reset();
      });
      
      expect(StorageAgent.clearState).toHaveBeenCalled();
      expect(result.current.iniData).toBeNull();
      expect(result.current.layers).toEqual([]);
      expect(result.current.selectedLayer).toBeNull();
    });

    it('should reset all state', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      // Load some data first
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.iniData).toBeNull();
      expect(result.current.layers).toEqual([]);
      expect(result.current.targets).toEqual({});
      expect(result.current.sources).toEqual({});
      expect(result.current.selectedLayer).toBeNull();
      expect(result.current.fileName).toBe('mappingfile.ini');
      expect(result.current.status).toBe('');
    });
  });

  describe('selection management', () => {
    it('should update selected layer', async () => {
      const { result } = renderHook(() => useMappingEditor());
      
      await act(async () => {
        const file = new File(['content'], 'test.ini');
        await result.current.handleFileChange({ target: { files: [file] } });
      });
      
      act(() => {
        result.current.setSelectedLayer('01');
      });
      
      expect(result.current.selectedLayer).toBe('01');
    });

    it('should set status message', () => {
      const { result } = renderHook(() => useMappingEditor());
      
      act(() => {
        result.current.setStatus('Test status');
      });
      
      expect(result.current.status).toBe('Test status');
    });
  });
});