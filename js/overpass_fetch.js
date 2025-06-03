function fetchOverpassQueryFromFile(filePath, callback) {
  fetch(filePath)
    .then(response => response.text())
    .then(overpassQuery => {
      const apiUrl = 'https://overpass-api.de/api/interpreter';
      return fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'data=' + encodeURIComponent(overpassQuery)
      });
    })
    .then(response => response.json())
    .then(data => {
      callback(data);
    })
    .catch(error => {
      console.error('Overpass fetch failed:', error);
    });
}

function osmToGeoJSON(osmData) {
  const features = osmData.elements
    .filter(el => el.type === 'node' && el.lat && el.lon)
    .map(el => ({
      type: "Feature",
      id: el.type + "/" + el.id,
      properties: el.tags || {},
      geometry: {
        type: "Point",
        coordinates: [el.lon, el.lat]
      }
    }));
  
  return {
    type: "FeatureCollection",
    features: features
  };
}