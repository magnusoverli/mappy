import ini from 'ini';

export function parseIni(text) {
  return ini.parse(text);
}

export function stringifyIni(data, newline = '\n') {
  let text = ini.stringify(data, { whitespace: false });
  const hasTrailing = text.endsWith('\n');
  let lines = text.split(/\r?\n/);
  if (hasTrailing) {
    lines.pop();
  }

  const out = [];
  let inLayers = false;

  for (const line of lines) {
    if (line.trim() === '') {
      continue; // drop blank lines introduced by ini.stringify
    }
    const trimmed = line.trim();
    if (trimmed === '[Layers]') {
      inLayers = true;
      out.push(trimmed);
      continue;
    }
    if (trimmed.startsWith('[')) {
      inLayers = false;
      out.push(trimmed);
      continue;
    }

    if (inLayers && /^\d{2}=/.test(trimmed)) {
      const [key, ...rest] = trimmed.split('=');
      let val = rest.join('=');
      if (!val.startsWith('"')) {
        val = `"${val}"`;
      }
      out.push(`${key}=${val}`);
    } else {
      out.push(trimmed);
    }
  }

  let result = out.join(newline);
  if (hasTrailing) {
    result += newline;
  }
  return result;
}
