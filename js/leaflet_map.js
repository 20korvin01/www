// Hintergrundkarten #########################################################################################################################
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
});

const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

const cartoDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

const Stadia_AlidadeSatellite = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.{ext}', {
	minZoom: 0,
	maxZoom: 20,
	attribution: '&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	ext: 'jpg'
});

const Thunderforest_Pioneer = L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey=9169d91a96a64cd7892be660840f312e', {
	attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	maxZoom: 22
});

const Thunderforest_Landscape = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey=9169d91a96a64cd7892be660840f312e', {
  attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 22
});


// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [49.01090860025595, 8.410805554961891],
  zoom: 19,
  layers: [Thunderforest_Pioneer], // Standardlayer
  fullscreenControl: true,
});

// Layer-Control hinzufügen
const baseMaps = {
  "Thunderforest Pioneer": Thunderforest_Pioneer,
  "Thunderforest Landscape": Thunderforest_Landscape,
  "Carto Light": cartoLight,
  "Carto Dark": cartoDark,
  "OpenStreetMap": osm,
  "Stadia Alidade Satellite": Stadia_AlidadeSatellite,
};
L.control.layers(baseMaps, null, { position: 'topright', collapsed: true }).addTo(map);

// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);


// Geocoder (Suche)
L.Control.geocoder({
  defaultMarkGeocode: false,
  placeholder: 'Search'
})
  .on('markgeocode', function (e) {
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
  drawCircle: false,
  drawMarker: true,
  locateOptions: { enableHighAccuracy: true }
}).addTo(map);

// Standort direkt beim Laden aktivieren
map.whenReady(function () {
  lc.start();
});

map.on('locationfound', function (e) {
  currentPosition = [e.latitude, e.longitude];
  document.getElementById('geolocation').innerHTML = `
    <table id="geolocation-table">
      <tr><td>Breite</td><td>${e.latitude.toFixed(6)}</td></tr>
      <tr><td>Länge</td><td>${e.longitude.toFixed(6)}</td></tr>
      <tr><td>Genauigkeit</td><td>${e.accuracy.toFixed(1)} m</td></tr>
    </table>
  `;
});

// Routing
const routingControl = L.Routing.control({
  waypoints: [],
  routeWhileDragging: false,
  geocoder: L.Control.Geocoder.nominatim(),
  show: false,
  collapsible: true,
  language: 'de',
  lineOptions: { styles: [{ color: '#3388ff', weight: 3, opacity: 0.7, dashArray: '5, 10' }] },
  createMarker: function () { return null; } // Keine Marker erstellen 
}).addTo(map);

// GEOJSON-Layer ########################################################################
// KIT-Campus als Hintergrundlayer
fetch('data/campusplan.geojson')
  .then(res => res.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      style: function (feature) {
        return { className: 'campus-outline' }; // CSS-Klasse statt Inline-Style
      },
      onEachFeature: function (feature, layer) {
        layer.off('click');
        layer.on('click', function (e) {
          e.originalEvent.preventDefault();
          e.originalEvent.stopPropagation();
        });
        layer.options.interactive = false;
      }
    }).addTo(map);
  });

// POIs mit Markercluster
fetch('data/Overpass_KITCampus.geojson')
  .then(res => res.json())
  .then(geojson => {
    // Cluster-Gruppe erstellen
    const markers = L.markerClusterGroup({
      // Optional: Cluster-Optionen, z.B. ab welcher Zoomstufe aufgelöst wird
      disableClusteringAtZoom: 19
    });

    // GeoJSON-Layer mit circleMarker als Marker
    const geoJsonLayer = L.geoJSON(geojson, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
          radius: 6,
          className: 'poi-marker'
        });
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          let props = feature.properties;
          let tableRows = Object.keys(props).map(key =>
            `<tr><td><strong>${key}</strong></td><td>${props[key]}</td></tr>`
          ).join('');
          let popupContent = `
            <table>${tableRows}</table>
            <button id="route-btn">Route zu diesem Punkt</button>
          `;
          layer.bindPopup(popupContent).openPopup();
        });
      }
    });

    // GeoJSON-Layer zur Cluster-Gruppe hinzufügen
    markers.addLayer(geoJsonLayer);

    // Cluster-Gruppe zur Karte hinzufügen
    map.addLayer(markers);
  });


document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'route-btn') {
    // Zielkoordinate aus dem Popup ermitteln
    const popup = e.target.closest('.leaflet-popup-content');
    // Versuche, die Koordinaten aus dem Popup zu extrahieren
    let targetLatLng = null;
    // Finde das nächste Popup-Objekt in der Karte
    map.eachLayer(function (layer) {
      if (layer instanceof L.CircleMarker && layer.isPopupOpen && layer.isPopupOpen()) {
        targetLatLng = layer.getLatLng();
      }
    });

    // Route zum angeklickten Punkt hinzufügen
    if (currentPosition && targetLatLng) {
      routingControl.setWaypoints([
        L.latLng(currentPosition[0], currentPosition[1]),
        targetLatLng
      ]);
      // routingControl.show();
    } else {
      alert('Standort oder Ziel nicht gefunden!');
    }
  }
});

// Leaflet-Control für "Zurück zum Zentrum"
L.Control.CenterControl = L.Control.extend({
  onAdd: function(map) {
    const container = L.DomUtil.create('div', 'leaflet-bar');
    const btn = L.DomUtil.create('button', 'leaflet-center-btn', container);
    btn.title = 'Zurück zum KIT Zentrum';
    btn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="#222" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="16"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
      </svg>
    `;
    L.DomEvent.on(btn, 'click', function(e) {
      L.DomEvent.stopPropagation(e);
      map.setView([49.01090860025595, 8.410805554961891], 19);
    });
    return container;
  },
  onRemove: function(map) {}
});

// Control links oben UNTER dem LocateControl platzieren
const centerControl = new L.Control.CenterControl({ position: 'topleft' });
map.addControl(centerControl);



