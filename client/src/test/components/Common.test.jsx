import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ErrorBoundary from '../../components/Common/ErrorBoundary.jsx';
import FileUpload from '../../components/Common/FileUpload.jsx';
import MonospaceTextField from '../../components/Common/MonospaceTextField.jsx';
import SearchField from '../../components/Common/SearchField.jsx';
import DataTable from '../../components/Common/DataTable.jsx';
import VirtualizedList from '../../components/Common/VirtualizedList.jsx';

const theme = createTheme();

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Common Components', () => {
  describe('ErrorBoundary', () => {
    it('should render children when no error', () => {
      renderWithTheme(
        <ErrorBoundary>
          <div>Test Content</div>
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should show error UI when error occurs', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };
      
      // Suppress error output for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      renderWithTheme(
        <ErrorBoundary>
          <ThrowError />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    it('should reset error state on retry', () => {
      let shouldThrow = true;
      const MaybeThrow = () => {
        if (shouldThrow) throw new Error('Test error');
        return <div>Success</div>;
      };
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const { rerender } = renderWithTheme(
        <ErrorBoundary>
          <MaybeThrow />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      shouldThrow = false;
      fireEvent.click(screen.getByText('Try Again'));
      
      rerender(
        <ErrorBoundary>
          <MaybeThrow />
        </ErrorBoundary>
      );
      
      expect(screen.getByText('Success')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });
  });

  describe('FileUpload', () => {
    it('should render upload button', () => {
      renderWithTheme(<FileUpload onFileSelect={vi.fn()} />);
      
      expect(screen.getByText('Open Mapping File')).toBeInTheDocument();
    });

    it('should call onFileSelect when file is selected', () => {
      const onFileSelect = vi.fn();
      renderWithTheme(<FileUpload onFileSelect={onFileSelect} />);
      
      const input = document.getElementById('file-input');
      const file = new File(['content'], 'test.ini', { type: 'text/plain' });
      
      fireEvent.change(input, { target: { files: [file] } });
      
      expect(onFileSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          target: expect.objectContaining({
            files: [file]
          })
        })
      );
    });

    it('should accept only .ini files', () => {
      renderWithTheme(<FileUpload onFileSelect={vi.fn()} />);
      
      const input = document.getElementById('file-input');
      expect(input.accept).toBe('.ini');
    });

    it('should reset input value after selection', () => {
      const onFileSelect = vi.fn();
      renderWithTheme(<FileUpload onFileSelect={onFileSelect} />);
      
      const input = document.getElementById('file-input');
      const file = new File(['content'], 'test.ini', { type: 'text/plain' });
      
      fireEvent.change(input, { target: { files: [file], value: 'test.ini' } });
      
      expect(input.value).toBe('');
    });
  });

  describe('MonospaceTextField', () => {
    it('should render with value', () => {
      renderWithTheme(
        <MonospaceTextField value="Test Value" />
      );
      
      const input = screen.getByDisplayValue('Test Value');
      expect(input).toBeInTheDocument();
    });

    it('should use monospace font', () => {
      const { container } = renderWithTheme(
        <MonospaceTextField value="Test" />
      );
      
      const input = container.querySelector('input');
      expect(input).toHaveStyle({ fontFamily: expect.stringContaining('monospace') });
    });
  });

  // SearchField uses context, so we'll skip detailed tests for now
  describe('SearchField', () => {
    it('should handle null context gracefully', () => {
      // SearchField returns null when no context
      const { container } = renderWithTheme(<SearchField />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('DataTable', () => {
    const mockItems = [
      { key: '00.0000', value: '00000000', offset: 0 },
      { key: '00.0001', value: '00000001', offset: 0 },
    ];

    it('should render table with items', () => {
      renderWithTheme(
        <DataTable title="Test Table" items={mockItems} />
      );
      
      expect(screen.getByText('Test Table')).toBeInTheDocument();
      // Check for hex values in the table
      expect(screen.getByText('0x00000000')).toBeInTheDocument();
    });

    it('should show empty state when no items', () => {
      renderWithTheme(
        <DataTable title="Empty Table" items={[]} />
      );
      
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should handle undefined items', () => {
      renderWithTheme(
        <DataTable title="Test Table" />
      );
      
      expect(screen.getByText('No data')).toBeInTheDocument();
    });

    it('should format offset values', () => {
      const itemsWithOffset = [
        { key: '00.0000', value: '00000000', offset: 5 },
        { key: '00.0001', value: '00000001', offset: -10 },
      ];
      
      renderWithTheme(
        <DataTable title="Test" items={itemsWithOffset} />
      );
      
      expect(screen.getByText('+5')).toBeInTheDocument();
      expect(screen.getByText('-10')).toBeInTheDocument();
    });
  });

  describe('VirtualizedList', () => {
    it('should render list items', () => {
      const mockItems = [
        { key: '00.0000', value: '00000000', offset: 0 },
        { key: '00.0001', value: '00000001', offset: 1 },
      ];
      
      renderWithTheme(
        <VirtualizedList items={mockItems} />
      );
      
      // VirtualizedList renders items
      expect(screen.getByText('00.0000')).toBeInTheDocument();
    });

    it('should handle empty list', () => {
      renderWithTheme(
        <VirtualizedList items={[]} />
      );
      
      expect(screen.getByText('No items')).toBeInTheDocument();
    });
  });
});