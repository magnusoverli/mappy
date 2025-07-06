/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

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

function detectChanges(prev, current) {
  const changes = {
    hasChanges: false,
    layers: { added: [], removed: [], modified: [] },
    targets: { added: [], removed: [], modified: [] },
    sources: { added: [], removed: [], modified: [] }
  };

  // Check layers
  const prevLayerKeys = new Set(prev.layers.map(l => l.key));
  const currentLayerKeys = new Set(current.layers.map(l => l.key));
  
  // Find added layers
  current.layers.forEach(layer => {
    if (!prevLayerKeys.has(layer.key)) {
      changes.layers.added.push(layer);
      changes.hasChanges = true;
    }
  });
  
  // Find removed layers
  prev.layers.forEach(layer => {
    if (!currentLayerKeys.has(layer.key)) {
      changes.layers.removed.push(layer);
      changes.hasChanges = true;
    }
  });
  
  // Find modified layers
  current.layers.forEach(layer => {
    const prevLayer = prev.layers.find(l => l.key === layer.key);
    if (prevLayer && prevLayer.value !== layer.value) {
      changes.layers.modified.push(layer);
      changes.hasChanges = true;
    }
  });

  // Check targets
  const prevTargetKeys = new Set();
  Object.values(prev.targets).forEach(arr => arr.forEach(t => prevTargetKeys.add(t.key)));
  const currentTargetKeys = new Set();
  Object.values(current.targets).forEach(arr => arr.forEach(t => currentTargetKeys.add(t.key)));
  
  Object.values(current.targets).forEach(arr => {
    arr.forEach(target => {
      if (!prevTargetKeys.has(target.key)) {
        changes.targets.added.push(target);
        changes.hasChanges = true;
      }
    });
  });
  
  Object.values(prev.targets).forEach(arr => {
    arr.forEach(target => {
      if (!currentTargetKeys.has(target.key)) {
        changes.targets.removed.push(target);
        changes.hasChanges = true;
      }
    });
  });
  
  Object.values(current.targets).forEach(arr => {
    arr.forEach(target => {
      const prevTarget = Object.values(prev.targets).flat().find(t => t.key === target.key);
      if (prevTarget && prevTarget.value !== target.value) {
        changes.targets.modified.push(target);
        changes.hasChanges = true;
      }
    });
  });

  // Check sources
  const prevSourceKeys = new Set();
  Object.values(prev.sources).forEach(arr => arr.forEach(s => prevSourceKeys.add(s.key)));
  const currentSourceKeys = new Set();
  Object.values(current.sources).forEach(arr => arr.forEach(s => currentSourceKeys.add(s.key)));
  
  Object.values(current.sources).forEach(arr => {
    arr.forEach(source => {
      if (!prevSourceKeys.has(source.key)) {
        changes.sources.added.push(source);
        changes.hasChanges = true;
      }
    });
  });
  
  Object.values(prev.sources).forEach(arr => {
    arr.forEach(source => {
      if (!currentSourceKeys.has(source.key)) {
        changes.sources.removed.push(source);
        changes.hasChanges = true;
      }
    });
  });
  
  Object.values(current.sources).forEach(arr => {
    arr.forEach(source => {
      const prevSource = Object.values(prev.sources).flat().find(s => s.key === source.key);
      if (prevSource && prevSource.value !== source.value) {
        changes.sources.modified.push(source);
        changes.hasChanges = true;
      }
    });
  });

  return changes;
}

function applyIncrementalChanges(index, changes) {
  let newIndex = [...index];

  // Remove items
  changes.layers.removed.forEach(layer => {
    newIndex = newIndex.filter(item => !(item.type === 'layer' && item.key === layer.key));
  });
  changes.targets.removed.forEach(target => {
    newIndex = newIndex.filter(item => !(item.type === 'target' && item.key === target.key));
  });
  changes.sources.removed.forEach(source => {
    newIndex = newIndex.filter(item => !(item.type === 'source' && item.key === source.key));
  });

  // Update modified items
  changes.layers.modified.forEach(layer => {
    const itemIndex = newIndex.findIndex(item => item.type === 'layer' && item.key === layer.key);
    if (itemIndex !== -1) {
      newIndex[itemIndex] = {
        type: 'layer',
        key: layer.key,
        value: layer.value,
        layerKey: layer.key,
        searchText: `${layer.key} ${layer.value}`,
      };
    }
  });
  changes.targets.modified.forEach(target => {
    const itemIndex = newIndex.findIndex(item => item.type === 'target' && item.key === target.key);
    if (itemIndex !== -1) {
      newIndex[itemIndex] = {
        type: 'target',
        key: target.key,
        value: target.value,
        layerKey: target.key.split('.')[0],
        searchText: `${target.key} ${target.value}`,
      };
    }
  });
  changes.sources.modified.forEach(source => {
    const itemIndex = newIndex.findIndex(item => item.type === 'source' && item.key === source.key);
    if (itemIndex !== -1) {
      newIndex[itemIndex] = {
        type: 'source',
        key: source.key,
        value: source.value,
        layerKey: source.key.split('.')[0],
        searchText: `${source.key} ${source.value}`,
      };
    }
  });

  // Add new items
  changes.layers.added.forEach(layer => {
    newIndex.push({
      type: 'layer',
      key: layer.key,
      value: layer.value,
      layerKey: layer.key,
      searchText: `${layer.key} ${layer.value}`,
    });
  });
  changes.targets.added.forEach(target => {
    newIndex.push({
      type: 'target',
      key: target.key,
      value: target.value,
      layerKey: target.key.split('.')[0],
      searchText: `${target.key} ${target.value}`,
    });
  });
  changes.sources.added.forEach(source => {
    newIndex.push({
      type: 'source',
      key: source.key,
      value: source.value,
      layerKey: source.key.split('.')[0],
      searchText: `${source.key} ${source.value}`,
    });
  });

  return newIndex;
}

// Threshold for using Web Workers (items count)
const WORKER_THRESHOLD = 1000;

// Web Worker management
let searchWorker = null;
let workerSupported = null;

function initializeWorker() {
  if (workerSupported === false) return null;
  
  try {
    if (!searchWorker) {
      searchWorker = new Worker('/search-worker.js');
      workerSupported = true;
    }
    return searchWorker;
  } catch (error) {
    console.warn('Web Workers not supported, falling back to main thread search:', error);
    workerSupported = false;
    return null;
  }
}

function performMainThreadSearch(query, index) {
  const q = query.trim().toLowerCase();
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
  const [index, setIndex] = useState([]);
  const prevData = useRef({ layers: [], targets: {}, sources: {} });
  const isInitialized = useRef(false);

  useEffect(() => {
    const currentData = { layers, targets, sources };
    
    if (!isInitialized.current) {
      // Initial build
      const initialIndex = buildSearchIndex(currentData);
      setIndex(initialIndex);
      prevData.current = currentData;
      isInitialized.current = true;
    } else {
      // Incremental update
      const changes = detectChanges(prevData.current, currentData);
      if (changes.hasChanges) {
        setIndex(prevIndex => applyIncrementalChanges(prevIndex, changes));
        prevData.current = currentData;
      }
    }
  }, [layers, targets, sources]);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [current, setCurrent] = useState(0);
  const [searchState, setSearchState] = useState({
    results: [],
    matchSet: new Set(),
    counts: { layers: 0, targets: 0, sources: 0 }
  });
  const [isSearching, setIsSearching] = useState(false);
  
  const requestIdRef = useRef(0);
  const workerRef = useRef(null);

  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  // Initialize worker on mount
  useEffect(() => {
    workerRef.current = initializeWorker();
    
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
        searchWorker = null;
      }
    };
  }, []);

  const performSearch = useCallback((searchQuery, searchIndex) => {
    const shouldUseWorker = searchIndex.length >= WORKER_THRESHOLD && workerRef.current;
    
    if (shouldUseWorker) {
      setIsSearching(true);
      const requestId = ++requestIdRef.current;
      
      const handleWorkerMessage = (e) => {
        const { type, requestId: responseId, data, error } = e.data;
        
        // Ignore responses from old requests
        if (responseId !== requestId) return;
        
        if (type === 'SEARCH_RESULT') {
          setSearchState({
            results: data.results,
            matchSet: new Set(data.matchSet), // Convert array back to Set
            counts: data.counts
          });
          setIsSearching(false);
        } else if (type === 'ERROR') {
          console.error('Search worker error:', error);
          // Fallback to main thread
          const result = performMainThreadSearch(searchQuery, searchIndex);
          setSearchState(result);
          setIsSearching(false);
        }
      };
      
      workerRef.current.onmessage = handleWorkerMessage;
      workerRef.current.postMessage({
        type: 'SEARCH',
        data: { query: searchQuery, index: searchIndex, requestId }
      });
    } else {
      // Use main thread for small datasets or when workers unavailable
      const result = performMainThreadSearch(searchQuery, searchIndex);
      setSearchState(result);
    }
  }, []);

  useEffect(() => {
    performSearch(debouncedQuery, index);
  }, [debouncedQuery, index, performSearch]);

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
        isSearching,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  return useContext(SearchContext);
}
