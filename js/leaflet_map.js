// Verschiedene Hintergrundkarten definieren
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
});

const esriSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: 'Tiles © Esri',
  maxZoom: 19,
});

const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [49.01090860025595, 8.410805554961891],
  zoom: 19,
  layers: [cartoLight], // Standardlayer
  fullscreenControl: true,
});

// Layer-Control hinzufügen
const baseMaps = {
  "Carto Light": cartoLight,
  "OpenStreetMap": osm,
  "ESRI Satellit": esriSat,
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



