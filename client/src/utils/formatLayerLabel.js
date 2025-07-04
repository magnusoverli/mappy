export function formatLayerLabel(key, path) {
  if (!path) return key;
  const segments = path.split('/').filter(Boolean);
  // Try to find index after Version* segment
  let startIndex = segments.findIndex(s => /^version\d+/i.test(s));
  if (startIndex !== -1) startIndex += 1;
  else {
    const idx = segments.findIndex(s => /videoipath/i.test(s));
    startIndex = idx !== -1 ? idx + 1 : 0;
  }
  let trimmed = segments.slice(startIndex);
  if (trimmed[trimmed.length - 1] && /matrix/i.test(trimmed[trimmed.length - 1])) {
    trimmed = trimmed.slice(0, -1);
  }
  const formatted = trimmed.map(seg => {
    let s = seg.replace(/_/g, ' ');
    if (/^device\s*\d+/i.test(s)) {
      s = s.replace(/^device\s*/i, 'Device ');
    }
    if (/^level\s*\d+/i.test(s)) {
      s = s.replace(/^level\s*/i, 'Level ');
    }
    if (/^l\d+$/i.test(s)) {
      s = 'L' + s.slice(1);
    }
    // Capitalize first letter of each word
    s = s.replace(/\b\w/g, c => c.toUpperCase());
    return s;
  });
  const label = formatted.join(' - ');
  return `${key} - ${label}`;
}
