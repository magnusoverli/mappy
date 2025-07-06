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
      searchText: `${l.key} ${l.value}`,
    });
  });
  Object.values(targets).forEach(arr => {
    arr.forEach(t => {
      index.push({
        type: 'target',
        key: t.key,
        value: t.value,
        layerKey: t.key.split('.')[0],
        searchText: `${t.key} ${t.value}`,
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
        searchText: `${s.key} ${s.value}`,
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

  const searchState = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (!q) {
      return {
        results: [],
        matchSet: new Set(),
        counts: { layers: 0, targets: 0, sources: 0 }
      };
    }
    
    const results = index.filter(item => item.searchText.toLowerCase().includes(q));
    const matchSet = new Set(results.map(r => r.key));
    const counts = results.reduce((acc, r) => {
      acc[r.type + 's'] = (acc[r.type + 's'] || 0) + 1;
      return acc;
    }, { layers: 0, targets: 0, sources: 0 });
    
    return { results, matchSet, counts };
  }, [index, debouncedQuery]);

  const { results, matchSet, counts } = searchState;

  useEffect(() => {
    setCurrent(0);
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
