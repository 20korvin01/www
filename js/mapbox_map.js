mapboxgl.accessToken = 'pk.eyJ1Ijoibml2cm9rMjAwMSIsImEiOiJjbDV0a3A3eGIweWJvM2JuMHhtYXF5aWVlIn0._01sVxeqJ8EQvGq2PclBBw';

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/nivrok2001/cmafdz2xf00um01s50hqj74gs',
  center: [8.410805554961891, 49.01090860025595],
  zoom: 18,
  pitch: 60,
  scrollZoom: true
});

// CONTROLS
map.addControl(new mapboxgl.NavigationControl({
  visualizePitch: true,
  showCompass: true
}));
map.addControl(new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: 'metric'
}));
map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: true, // Adds a marker at the result
    placeholder: 'Search',
    zoom: 16,
    flyTo: {
      speed: 1.2,
      curve: 1.5
    },
  })
);


// Add directions control to the map
const directions = new MapboxDirections({
  accessToken: mapboxgl.accessToken,
  unit: 'metric',            // Use 'imperial' for miles
  profile: 'mapbox/driving', // Options: 'driving', 'walking', 'cycling'
  controls: {
    inputs: true,
    instructions: true
  }
});

map.addControl(directions, 'top-left'); // Or 'top-right', 'bottom-left', etc.



// Add points of interest
map.on('load', () => {
  // Add your POI data source
  map.addSource('pois', {
    type: 'geojson',
    data: 'data/pois.geojson'  // or directly use a JS object if loaded already
  });

  // Add a layer to display the points
  map.addLayer({
    id: 'poi-layer',
    type: 'circle',
    source: 'pois',
    paint: {
      'circle-radius': 6,
      'circle-color': '#FF5722'
    }
  });
});


// Make points clickable
map.on('click', 'poi-layer', (e) => {
  const destination = e.features[0].geometry.coordinates;

  // Optional: show a popup
  new mapboxgl.Popup()
    .setLngLat(destination)
    .setHTML(`<strong>POI</strong><br>${e.features[0].properties.name || 'No name'}`)
    .addTo(map);

  // Get current location from GeolocateControl
  if (currentPosition) {
    directions.setOrigin(currentPosition);
    directions.setDestination(destination);
  } else {
    alert("User location not available. Make sure geolocation is enabled.");
  }
});

// Handle geolocation
let currentPosition = null;

const geolocate = new mapboxgl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,
  showUserHeading: true
});
map.addControl(geolocate);

// Update current position
map.on('load', () => {
  geolocate.trigger(); // Request location on load
});

geolocate.on('geolocate', (e) => {
  currentPosition = [e.coords.longitude, e.coords.latitude];
});



