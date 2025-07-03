import ini from 'ini';

export function parseIni(text) {
  return ini.parse(text);
}

export function stringifyIni(data, newline = '\n') {
  const text = ini.stringify(data, { whitespace: true });
  const lines = text.split(/\r?\n/);
  let inLayers = false;
  let inInternal = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed === '[Layers]') {
      inLayers = true;
      inInternal = false;
      continue;
    }
    if (trimmed === '[Internal]') {
      inInternal = true;
      inLayers = false;
      continue;
    }
    if (trimmed.startsWith('[')) {
      inLayers = false;
      inInternal = false;
    }
    if (inLayers && /^\d{2}\s*=/.test(line)) {
      const [key, ...rest] = line.split('=');
      let val = rest.join('=').trim();
      if (!val.startsWith('"')) {
        val = `"${val}"`;
      }
      lines[i] = `${key.trim()}=${val}`;
    } else if (inInternal && /=/.test(line)) {
      const [key, ...rest] = line.split('=');
      const val = rest.join('=').trim();
      lines[i] = `${key.trim()}=${val}`;
    }
  }
  return lines.join(newline);
}
