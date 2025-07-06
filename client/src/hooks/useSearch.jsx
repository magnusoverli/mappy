/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useState, useMemo, useEffect } from 'react';

function buildSearchIndex({ layers = [], targets = {}, sources = {} }) {
  const index = [];
  layers.forEach(l => {
    index.push({
      type: 'layer',
      key: l.key,
      value: l.value,
      layerKey: l.key,
      text: `${l.key} ${l.value}`,
      lowerText: `${l.key} ${l.value}`.toLowerCase(),
    });
  });
  Object.values(targets).forEach(arr => {
    arr.forEach(t => {
      index.push({
        type: 'target',
        key: t.key,
        value: t.value,
        layerKey: t.key.split('.')[0],
        text: `${t.key} ${t.value}`,
        lowerText: `${t.key} ${t.value}`.toLowerCase(),
      });
    });
  });
  Object.values(sources).forEach(arr => {
    arr.forEach(s => {
      index.push({
        type: 'source',
        key: s.key,
        value: s.value,
        layerKey: s.key.split('.')[0],
        text: `${s.key} ${s.value}`,
        lowerText: `${s.key} ${s.value}`.toLowerCase(),
      });
    });
  });
  return index;
}

const SearchContext = createContext(null);

export function SearchProvider({
  layers,
  targets,
  sources,
  selectedLayer,
  setSelectedLayer,
  children,
}) {
  const index = useMemo(
    () => buildSearchIndex({ layers, targets, sources }),
    [layers, targets, sources]
  );

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) return [];
    return index.filter(item => item.lowerText.includes(q));
  }, [index, debouncedQuery]);

  const matchSet = useMemo(() => new Set(results.map(r => r.key)), [results]);

  useEffect(() => {
    setCurrent(0);
  }, [results]);

  const counts = useMemo(() => {
    const c = { layers: 0, targets: 0, sources: 0 };
    results.forEach(r => {
      if (r.type === 'layer') c.layers += 1;
      else if (r.type === 'target') c.targets += 1;
      else c.sources += 1;
    });
    return c;
  }, [results]);

  const currentResult = results[current] || null;

  const next = () => {
    if (results.length) setCurrent((current + 1) % results.length);
  };
  const prev = () => {
    if (results.length)
      setCurrent((current - 1 + results.length) % results.length);
  };

  useEffect(() => {
    if (
      currentResult &&
      currentResult.layerKey !== selectedLayer &&
      typeof setSelectedLayer === 'function'
    ) {
      setSelectedLayer(currentResult.layerKey);
    }
  }, [currentResult, selectedLayer, setSelectedLayer]);

  return (
    <SearchContext.Provider
      value={{
        query,
        setQuery,
        results,
        counts,
        current,
        currentResult,
        matchSet,
        next,
        prev,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
