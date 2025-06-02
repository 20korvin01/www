// mapboxgl.accessToken = 'pk.eyJ1Ijoibml2cm9rMjAwMSIsImEiOiJjbDV0a3A3eGIweWJvM2JuMHhtYXF5aWVlIn0._01sVxeqJ8EQvGq2PclBBw';

// Leaflet Map Initialisierung
const map = L.map('map').setView([49.01090860025595, 8.410805554961891], 18);

// Standard OpenStreetMap TileLayer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Navigation (Zoom + Home)
L.control.zoom().addTo(map);

// Geocoder (Suche)
L.Control.geocoder({
  defaultMarkGeocode: false,
  placeholder: 'Search'
})
  .on('markgeocode', function(e) {
    map.setView(e.geocode.center, 16);
    L.marker(e.geocode.center).addTo(map);
  })
  .addTo(map);

// Geolocation (User-Position)
let currentPosition = null;
const lc = L.control.locate({
  setView: 'once',
  flyTo: true,
  keepCurrentZoomLevel: true,
  showPopup: false,
  drawCircle: true,
  drawMarker: true,
  locateOptions: { enableHighAccuracy: true }
}).addTo(map);

map.on('locationfound', function(e) {
  currentPosition = [e.latitude, e.longitude];
});

// POIs laden (lokale GeoJSON-Datei)
fetch('data/Overpass_KITCampus.geojson')
  .then(res => res.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng, { radius: 6, color: '#FF5722' });
      },
      onEachFeature: function(feature, layer) {
        layer.on('click', function() {
          const destination = layer.getLatLng();
          layer.bindPopup(`<strong>POI</strong><br>${feature.properties.name || 'No name'}`).openPopup();

          if (currentPosition) {
            routingControl.setWaypoints([
              L.latLng(currentPosition[0], currentPosition[1]),
              destination
            ]);
          } else {
            alert("User location not available. Make sure geolocation is enabled.");
          }
        });
      }
    }).addTo(map);
  });

// Routing (Directions)
const routingControl = L.Routing.control({
  waypoints: [],
  routeWhileDragging: false,
  geocoder: L.Control.Geocoder.nominatim(),
  show: true,
  collapsible: true,
  language: 'de',
  lineOptions: { styles: [{ color: '#3388ff', weight: 5 }] }
}).addTo(map);



