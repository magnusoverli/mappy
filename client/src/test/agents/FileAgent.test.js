import { describe, it, expect, beforeEach, vi } from 'vitest';
import { openFile, exportFile } from '../../FileAgent.js';

describe('FileAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('openFile', () => {
    it('should read file content and detect CRLF line endings', async () => {
      const file = { 
        content: 'line1\r\nline2\r\nline3',
        name: 'test.ini' 
      };
      
      const result = await openFile(file);
      
      expect(result.text).toBe('line1\r\nline2\r\nline3');
      expect(result.newline).toBe('\r\n');
    });

    it('should detect LF line endings', async () => {
      const file = { 
        content: 'line1\nline2\nline3',
        name: 'test.ini' 
      };
      
      const result = await openFile(file);
      
      expect(result.text).toBe('line1\nline2\nline3');
      expect(result.newline).toBe('\n');
    });

    it('should detect CR line endings', async () => {
      const file = { 
        content: 'line1\rline2\rline3',
        name: 'test.ini' 
      };
      
      const result = await openFile(file);
      
      expect(result.text).toBe('line1\rline2\rline3');
      expect(result.newline).toBe('\r');
    });

    it('should default to LF for files without line breaks', async () => {
      const file = { 
        content: 'single line',
        name: 'test.ini' 
      };
      
      const result = await openFile(file);
      
      expect(result.text).toBe('single line');
      expect(result.newline).toBe('\n');
    });

    it('should handle FileReader errors', async () => {
      const file = { name: 'test.ini' };
      
      // Override the mock to simulate error
      globalThis.FileReader = class {
        constructor() {
          this.onerror = null;
          this.error = new Error('Read failed');
        }
        readAsText() {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      };
      
      await expect(openFile(file)).rejects.toThrow('Read failed');
    });

    it('should handle empty files', async () => {
      // Override mock to handle empty content
      globalThis.FileReader = class {
        constructor() {
          this.result = null;
          this.onload = null;
          this.onerror = null;
        }
        
        readAsText(file) {
          setTimeout(() => {
            this.result = '';
            if (this.onload) this.onload();
          }, 0);
        }
      };
      
      const file = { 
        content: '',
        name: 'empty.ini' 
      };
      
      const result = await openFile(file);
      
      expect(result.text).toBe('');
      expect(result.newline).toBe('\n');
    });
  });

  describe('exportFile', () => {
    it('should create and trigger download with default filename', () => {
      const mockAnchor = document.createElement('a');
      mockAnchor.click = vi.fn();
      
      const createElementSpy = vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      const appendChildSpy = vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
      const removeChildSpy = vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);
      
      exportFile('test data');
      
      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockAnchor.href).toBe('mock-url');
      expect(mockAnchor.download).toBe('mappingfile.ini');
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    });

    it('should use custom filename when provided', () => {
      const mockAnchor = document.createElement('a');
      mockAnchor.click = vi.fn();
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);
      
      exportFile('test data', 'custom.ini');
      
      expect(mockAnchor.download).toBe('custom.ini');
    });

    it('should create blob with correct type', () => {
      const mockAnchor = document.createElement('a');
      mockAnchor.click = vi.fn();
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);
      
      exportFile('test data');
      
      // Check that Blob was created (we can't spy on constructor)
      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle special characters in data', () => {
      const mockAnchor = document.createElement('a');
      mockAnchor.click = vi.fn();
      
      vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'appendChild').mockReturnValue(mockAnchor);
      vi.spyOn(document.body, 'removeChild').mockReturnValue(mockAnchor);
      
      const specialData = 'test\ndata\twith\r\nspecial©characters™';
      exportFile(specialData, 'special.ini');
      
      expect(mockAnchor.click).toHaveBeenCalled();
      expect(mockAnchor.download).toBe('special.ini');
    });
  });
});