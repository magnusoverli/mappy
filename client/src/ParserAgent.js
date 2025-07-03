import ini from 'ini';

export function parseIni(text) {
  return ini.parse(text);
}

export function stringifyIni(data) {
  return ini.stringify(data);
}
