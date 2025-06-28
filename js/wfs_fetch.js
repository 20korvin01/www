function fetchWFS(url, callback) {
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      return response.json(); // Parse the JSON body (already GeoJSON)
    })
    .then(geojson => {
      callback(geojson); // Pass parsed GeoJSON to the callback
    })
    .catch(error => {
      console.error('GeoJSON fetch failed:', error);
    });
}