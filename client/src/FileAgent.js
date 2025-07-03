export function openFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      let newline = '\n';
      if (/\r\n/.test(text)) {
        newline = '\r\n';
      } else if (/\r/.test(text)) {
        newline = '\r';
      }
      resolve({ text, newline });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

export function exportFile(data, filename = 'mappingfile.ini') {
  const blob = new Blob([data], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
