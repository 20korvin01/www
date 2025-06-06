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

const Thunderforest_Pioneer = L.tileLayer('https://{s}.tile.thunderforest.com/pioneer/{z}/{x}/{y}{r}.png?apikey=9169d91a96a64cd7892be660840f312e', {
  attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 22
});

const Thunderforest_Landscape = L.tileLayer('https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}{r}.png?apikey=9169d91a96a64cd7892be660840f312e', {
  attribution: '&copy; <a href="http://www.thunderforest.com/">Thunderforest</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxZoom: 22
});
// Basemaps
const baseMaps = {
  "Thunderforest Pioneer": Thunderforest_Pioneer,
  "Thunderforest Landscape": Thunderforest_Landscape,
  "Carto Light": cartoLight,
  "Carto Dark": cartoDark,
  "OpenStreetMap": osm
};
// Leaflet-Map initialisieren ######################################################################
// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [49.01348979913584, 8.416214959608762],
  zoom: 16,
  layers: [Thunderforest_Pioneer], // Standardlayer
  fullscreenControl: true,
});
// Overlay-Layer-Objekt global anlegen
window.overlayMaps = {};
// Layer-Control direkt initialisieren (Panel ist sofort sichtbar)
window.layerControl = L.control.layers(baseMaps, window.overlayMaps, { position: 'topright', collapsed: true }).addTo(map);
// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Standortgeschichten #################################################################################
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

// KIT-Campus als Hintergrundlayer ########################################################################
fetch('data/campusplan.geojson')
  .then(res => res.json())
  .then(geojson => {
    L.geoJSON(geojson, {
      style: function (feature) {
        return { className: 'campus-outline' };
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

// Overpass API Abfrage ##################################################################
fetchOverpassQueryFromFile('Abfrage_overpass_KitCampus.txt', function (osmData) {
  const geojson = osmToGeoJSON(osmData);

  // Cluster-Gruppe für Marker
  const markers = L.markerClusterGroup({
    disableClusteringAtZoom: 19
  });

  // Haus-Icon
  const houseIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5" fill="%231976D2"/></svg>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Gras-Icon
  const grassIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="%23388e3c"/></svg>',
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -18]
  });

  // Fahrrad-Icon
  const bicycleIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path d="M4 4.5a.5.5 0 0 1 .5-.5H6a.5.5 0 0 1 0 1v.5h4.14l.386-1.158A.5.5 0 0 1 11 4h1a.5.5 0 0 1 0 1h-.64l-.311.935.807 1.29a3 3 0 1 1-.848.53l-.508-.812-2.076 3.322A.5.5 0 0 1 8 10.5H5.959a3 3 0 1 1-1.815-3.274L5 5.856V5h-.5a.5.5 0 0 1-.5-.5m1.5 2.443-.508.814c.5.444.85 1.054.967 1.743h1.139zM8 9.057 9.598 6.5H6.402zM4.937 9.5a2 2 0 0 0-.487-.877l-.548.877zM3.603 8.092A2 2 0 1 0 4.937 10.5H3a.5.5 0 0 1-.424-.765zm7.947.53a2 2 0 1 0 .848-.53l1.026 1.643a.5.5 0 1 1-.848.53z" fill="%23009088"/></svg>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Auto-Icon
  const carIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="%23444" viewBox="0 0 16 16"><path d="M2.52 3.515A2.5 2.5 0 0 1 4.82 2h6.362c1 0 1.904.596 2.298 1.515l.792 1.848c.075.175.21.319.38.404.5.25.855.715.965 1.262l.335 1.679q.05.242.049.49v.413c0 .814-.39 1.543-1 1.997V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.338c-1.292.048-2.745.088-4 .088s-2.708-.04-4-.088V13.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1.892c-.61-.454-1-1.183-1-1.997v-.413a2.5 2.5 0 0 1 .049-.49l.335-1.68c.11-.546.465-1.012.964-1.261a.8.8 0 0 0 .381-.404l.792-1.848ZM3 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2m10 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 8a1 1 0 0 0 0 2h4a1 1 0 1 0 0-2zM2.906 5.189a.51.51 0 0 0 .497.731c.91-.073 3.35-.17 4.597-.17s3.688.097 4.597.17a.51.51 0 0 0 .497-.731l-.956-1.913A.5.5 0 0 0 11.691 3H4.309a.5.5 0 0 0-.447.276L2.906 5.19Z"/></svg>',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Sonstiges Icon
  const otherIcon = L.icon({
    iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 16 16"><circle cx="8" cy="8" r="8" fill="%23FF5722"/></svg>',
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -18]
  });

  // GeoJSON-Layer erstellen und Icons zuweisen
  const geoJsonLayer = L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      // bicycle_parking → Fahrrad-Icon + Kapazität als Label
      if (feature.properties && feature.properties.amenity === "bicycle_parking") {
        const marker = L.marker(latlng, { icon: bicycleIcon });
        if (feature.properties.capacity) {
          const capacity = feature.properties.capacity;
          const label = L.divIcon({
            className: 'capacity-label',
            html: `<div style="color:#009088;font-weight:bold;font-size:1.1em;text-align:center;">${capacity}</div>`,
            iconSize: [32, 16],
            iconAnchor: [16, 32]
          });
          L.marker([latlng.lat + 0.000015, latlng.lng], { icon: label, interactive: false }).addTo(markers);
        }
        return marker;
      }
      // parking → Auto-Icon + Kapazität als Label
      else if (feature.properties && feature.properties.amenity === "parking") {
        const marker = L.marker(latlng, { icon: carIcon });
        if (feature.properties.capacity) {
          const capacity = feature.properties.capacity;
          const label = L.divIcon({
            className: 'capacity-label',
            html: `<div style="color:#444;font-weight:bold;font-size:1.1em;text-align:center;">${capacity}</div>`,
            iconSize: [32, 16],
            iconAnchor: [16, 32]
          });
          L.marker([latlng.lat + 0.000015, latlng.lng], { icon: label, interactive: false }).addTo(markers);
        }
        return marker;
      }
      // landuse → Gras-Icon
      else if (feature.properties && feature.properties.landuse) {
        return L.marker(latlng, { icon: grassIcon });
      }
      // building → Haus-Icon + ref als Label
      else if (feature.properties && feature.properties.building) {
        if (!feature.properties.ref) {
          return null; // Gebäude ohne ref werden nicht angezeigt
        }
        const marker = L.marker(latlng, { icon: houseIcon });
        const ref = feature.properties.ref;
        const label = L.divIcon({
          className: 'ref-label',
          html: `<div style="color:#1976D2;font-weight:bold;font-size:1.1em;text-align:center;">${ref}</div>`,
          iconSize: [32, 16],
          iconAnchor: [16, 32]
        });
        L.marker([latlng.lat + 0.000015, latlng.lng], { icon: label, interactive: false }).addTo(markers);
        return marker;
      } else {
        return L.marker(latlng, { icon: otherIcon });
      }
    },
    onEachFeature: function (feature, layer) {
      layer.on('click', function () {
        // Build a table with all properties
        let props = feature.properties || {};
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

  // Add GeoJSON layer to cluster group
  markers.addLayer(geoJsonLayer);

  // Overlay-Layer für Layer-Control registrieren
  window.overlayMaps["POIs"] = markers;
  window.layerControl.addOverlay(markers, "POIs");

  // Add cluster group to map
  map.addLayer(markers);
});
// Routing-Button im Popup ########################################################################
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'route-btn') {
    // Zielkoordinate aus dem Popup ermitteln
    let targetLatLng = null;
    map.eachLayer(function (layer) {
      // Prüfe auf Marker ODER CircleMarker
      if (
        (layer instanceof L.Marker || layer instanceof L.CircleMarker) &&
        layer.isPopupOpen && layer.isPopupOpen()
      ) {
        targetLatLng = layer.getLatLng();
      }
    });

    // Route zum angeklickten Punkt hinzufügen
    if (currentPosition && targetLatLng) {
      routingControl.setWaypoints([
        L.latLng(currentPosition[0], currentPosition[1]),
        targetLatLng
      ]);
    } else {
      alert('Standort oder Ziel nicht gefunden!');
    }
  }
});

// Leaflet-Control für "Zurück zum Zentrum" ########################################################
L.Control.CenterControl = L.Control.extend({
  onAdd: function (map) {
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
    L.DomEvent.on(btn, 'click', function (e) {
      L.DomEvent.stopPropagation(e);
      map.setView([49.01348979913584, 8.416214959608762], 16);
    });
    return container;
  },
  onRemove: function (map) { }
});

const centerControl = new L.Control.CenterControl({ position: 'topleft' });
map.addControl(centerControl);

// Geolocation-Informationen ########################################################################
map.on('zoomend', function () {
  const zoomCell = document.querySelector('#geolocation-table tr:last-child td:last-child');
  if (zoomCell) {
    zoomCell.textContent = map.getZoom();
  }
});

map.on('locationfound', function (e) {
  currentPosition = [e.latitude, e.longitude];
  // Geschwindigkeit berechnen und auf 0 setzen, falls NaN
  let speed = e.speed * 3.6;
  if (isNaN(speed)) speed = 0;
  document.getElementById('geolocation').innerHTML = `
    <table id="geolocation-table">
      <tr><td>Breite</td><td>${e.latitude.toFixed(6)}</td></tr>
      <tr><td>Länge</td><td>${e.longitude.toFixed(6)}</td></tr>
      <tr><td>Genauigkeit</td><td>${e.accuracy.toFixed(1)} m</td></tr>
      <tr><td>Geschwindigkeit</td><td>${speed.toFixed(2)} km/h</td></tr>
      <tr><td>Zoomlevel</td><td>${map.getZoom()}</td></tr>
    </table>
  `;
});



