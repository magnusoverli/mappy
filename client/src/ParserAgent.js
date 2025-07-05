import ini from 'ini';

export function parseIni(text) {
  const data = ini.parse(text);
  const lines = text.split(/\r?\n/);
  let inLayers = false;
  const order = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '[Layers]') {
      inLayers = true;
      continue;
    }
    if (inLayers && trimmed.startsWith('[')) {
      break;
    }
    if (inLayers && /^\d{2}\s*=/.test(line)) {
      const [key] = line.split('=');
      order.push(key.trim());
    }
  }
  data.__layerOrder = order;
  return data;
}

export function stringifyIni(data, newline = '\n') {
  const sortSection = section =>
    Object.fromEntries(
      Object.entries(section || {}).sort((a, b) => {
        const [la, ia] = a[0].split('.');
        const [lb, ib] = b[0].split('.');
        const layerDiff = parseInt(la, 10) - parseInt(lb, 10);
        return layerDiff !== 0
          ? layerDiff
          : parseInt(ia, 10) - parseInt(ib, 10);
      })
    );

  const dataCopy = {
    ...data,
    Targets: sortSection(data.Targets),
    Sources: sortSection(data.Sources),
  };
  delete dataCopy.__layerOrder;
  const text = ini.stringify(dataCopy, { whitespace: true });
  const lines = text.split(/\r?\n/);
  const layerOrder = Array.isArray(data.__layerOrder) ? data.__layerOrder : [];
  const layerStart = lines.findIndex(l => l.trim() === '[Layers]');
  if (layerStart !== -1) {
    let end = layerStart + 1;
    while (end < lines.length && !lines[end].startsWith('[')) {
      end += 1;
    }
    const remainingKeys = Object.keys(data.Layers || {}).filter(k => !layerOrder.includes(k));
    remainingKeys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const orderedKeys = [...layerOrder, ...remainingKeys];
    const newLines = orderedKeys.map(k => `${k} = ${data.Layers[k] ?? ''}`);
    lines.splice(layerStart + 1, end - layerStart - 1, ...newLines);
  }
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
