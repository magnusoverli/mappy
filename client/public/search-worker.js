// Search Web Worker for Mappy
// Handles search operations in background thread for large datasets

self.onmessage = function(e) {
  const { type, data } = e.data;
  
  try {
    switch (type) {
      case 'SEARCH':
        handleSearch(data);
        break;
      case 'PING':
        self.postMessage({ type: 'PONG' });
        break;
      default:
        self.postMessage({ 
          type: 'ERROR', 
          error: `Unknown message type: ${type}` 
        });
    }
  } catch (error) {
    self.postMessage({ 
      type: 'ERROR', 
      error: error.message 
    });
  }
};

function handleSearch({ query, index, requestId }) {
  const startTime = performance.now();
  
  // Normalize query
  const q = query.trim().toLowerCase();
  
  if (!q) {
    self.postMessage({
      type: 'SEARCH_RESULT',
      requestId,
      data: {
        results: [],
        matchSet: [],
        counts: { layers: 0, targets: 0, sources: 0 },
        processingTime: performance.now() - startTime
      }
    });
    return;
  }
  
  // Perform search filtering
  const results = [];
  const matchKeys = [];
  const counts = { layers: 0, targets: 0, sources: 0 };
  
  // Use for loop for better performance than filter/map
  for (let i = 0; i < index.length; i++) {
    const item = index[i];
    if (item.searchText.toLowerCase().includes(q)) {
      results.push(item);
      matchKeys.push(item.key);
      counts[item.type + 's']++;
    }
  }
  
  const processingTime = performance.now() - startTime;
  
  self.postMessage({
    type: 'SEARCH_RESULT',
    requestId,
    data: {
      results,
      matchSet: matchKeys, // Send array instead of Set for serialization
      counts,
      processingTime
    }
  });
}

// Handle worker errors
self.onerror = function(error) {
  self.postMessage({ 
    type: 'ERROR', 
    error: error.message 
  });
};