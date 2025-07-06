// Legende ein-/ausblenden mit Fade ###############################################################

const legendToggle = document.getElementById('legend-toggle');
const mapLegend = document.getElementById('map-legend');
let legendVisible = true;
function setLegendVisible(visible) {
  if (visible) {
    mapLegend.style.display = '';
    legendToggle.setAttribute('aria-pressed', 'true');
    legendToggle.classList.add('active');
  } else {
    mapLegend.style.display = 'none';
    legendToggle.setAttribute('aria-pressed', 'false');
    legendToggle.classList.remove('active');
  }
}
legendToggle.addEventListener('click', () => {
  legendVisible = !legendVisible;
  setLegendVisible(legendVisible);
});


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


// Routing mit OpenRouteService ########################################################################################################################################################################
const openRouteServiceApiKey = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImEzNzM3YWIyYTk5ZTRkMTRhYjEyYjY0NDYyYmE3Njk4IiwiaCI6Im11cm11cjY0In0=';
let routingLayer = null;

function getORSRoute(start, end, callback) {
  const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
  fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
      'Content-Type': 'application/json',
      'Authorization': openRouteServiceApiKey
    },
    body: JSON.stringify({
      coordinates: [
        [start.lng, start.lat],
        [end.lng, end.lat]
      ]
    })
  })
    .then(response => response.json())
    .then(data => callback(null, data))
    .catch(err => callback(err));
}

function showORSRoute(start, end, doneCb) {
  getORSRoute(start, end, (err, data) => {
    if (err || !data || !data.features || !data.features[0]) {
      alert('Route konnte nicht berechnet werden!');
      if (doneCb) doneCb();
      return;
    }
    // Vorherige Route entfernen
    if (routingLayer) {
      map.removeLayer(routingLayer);
    }
    routingLayer = L.geoJSON(data, {
      style: {
        color: '#3388ff',
        weight: 4,
        opacity: 0.8,
        dashArray: '5, 10'
      }
    }).addTo(map);
    // Kein automatisches Zoomen mehr
    if (doneCb) doneCb();
  });
}

// KIT-Campus als Hintergrundlayer ################################################################################################################################
import { campusPolygon } from './campusplan.js';

L.geoJSON(campusPolygon, {
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



// GeoServer Abfrage ##########################################################################################################################
const queryURL = "https://mobilegisserver.mywire.org:8443/geoserver/mobilegis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mobilegis%3Agroup3campuslayer&outputFormat=application%2Fjson";

// Hilfsfunktion: MultiPoints in einzelne Points aufsplitten
function flattenMultiPoints(geojson) {
  if (!geojson || !geojson.features) return geojson;
  const newFeatures = [];
  geojson.features.forEach(f => {
    if (f.geometry && f.geometry.type === "MultiPoint") {
      f.geometry.coordinates.forEach((coords, idx) => {
        newFeatures.push({
          type: "Feature",
          properties: f.properties,
          geometry: {
            type: "Point",
            coordinates: coords
          },
          id: f.id ? `${f.id}_pt${idx}` : undefined
        });
      });
    } else {
      newFeatures.push(f);
    }
  });
  return { ...geojson, features: newFeatures };
}

// Funktion zum Abrufen von WFS-Daten
fetchWFS(queryURL, function (osmData) {
  // Falls WFS MultiPoints liefert, in Points umwandeln
  const geojson = flattenMultiPoints(osmData);

  // Cluster-Gruppe für Marker
  const markers = L.markerClusterGroup({
    disableClusteringAtZoom: 19
  });


  // Bootstrap Icons als Marker-Icons (inline SVGs, wie in der Legende)
  // Haus-Icon (bi-house-door-fill, #1976D2)
  const houseIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-house-door-fill" style="font-size:2em;color:#1976D2;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Gras-Icon (bi-tree-fill, #388e3c)
  const grassIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-tree-fill" style="font-size:1.4em;color:#388e3c;"></i>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22]
  });

  // Fahrrad-Icon (bi-bicycle, #009088)
  const bicycleIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-bicycle" style="font-size:2em;color:#009088;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Auto-Icon (bi-car-front-fill, #444)
  const carIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-car-front-fill" style="font-size:2em;color:#444;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Sonstiges Icon (bi-geo-alt-fill, #FF5722)
  const otherIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-geo-alt-fill" style="font-size:1.4em;color:#FF5722;"></i>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22]
  });

  // GeoJSON-Layer erstellen und Icons zuweisen
  const geoJsonLayer = L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      // bicycle_parking → Fahrrad-Icon + Kapazität als Teil des Icons
      if (feature.properties && feature.properties.amenity === "bicycle_parking") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-bicycle\" style=\"font-size:2em;color:#009088;vertical-align:middle;\"></i>`;
        if (feature.properties.capacity) {
          html += `<span style=\"position:absolute;bottom:0;left:50%;transform:translateX(-50%);color:#009088;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.capacity}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        return L.marker(latlng, { icon });
      }
      // parking → Auto-Icon + Kapazität als Teil des Icons
      else if (feature.properties && feature.properties.amenity === "parking") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-car-front-fill\" style=\"font-size:2em;color:#444;vertical-align:middle;\"></i>`;
        if (feature.properties.capacity) {
          html += `<span style=\"position:absolute;bottom:0;left:50%;transform:translateX(-50%);color:#444;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.capacity}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        return L.marker(latlng, { icon });
      }
      // landuse → Gras-Icon
      else if (feature.properties && feature.properties.landuse) {
        return L.marker(latlng, { icon: grassIcon });
      }
      // building → Haus-Icon + ref als Teil des Icons
      else if (feature.properties && feature.properties.building) {
        if (!feature.properties.ref) {
          return null; // Gebäude ohne ref werden nicht angezeigt
        }
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-house-door-fill\" style=\"font-size:2em;color:#1976D2;vertical-align:middle;\"></i>` +
          `<span style=\"position:absolute;bottom:0;left:50%;transform:translateX(-50%);color:#1976D2;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.ref}</span>` +
          `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        return L.marker(latlng, { icon });
      } else {
        return L.marker(latlng, { icon: otherIcon });
      }
    },
    onEachFeature: function (feature, layer) {
      // Elegantes Popup-Design mit moderner Card-Optik
      let props = feature.properties || {};
      let tableRows = Object.keys(props)
        .filter(key => props[key] !== null && props[key] !== undefined && props[key] !== "null" && props[key] !== "")
        .map(key =>
          `<tr><td class='popup-key'>${key}</td><td class='popup-value'>${props[key]}</td></tr>`
        ).join('');

      let popupContent = `
        <div class="popup-card">
          <div class="popup-table-wrap">
            <table class="popup-table">${tableRows}</table>
          </div>
          <button id="route-btn" class="popup-route-btn"><i class="bi bi-signpost-split-fill"></i> Routing</button>
        </div>
      `;

      layer.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
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



// Routing-Button im Popup mit OpenRouteService ####################################################
document.addEventListener('click', function (e) {
  if (e.target && e.target.id === 'route-btn') {
    // Zielkoordinate aus dem Popup ermitteln
    let targetLatLng = null;
    map.eachLayer(function (layer) {
      if (
        (layer instanceof L.Marker || layer instanceof L.CircleMarker) &&
        layer.isPopupOpen && layer.isPopupOpen()
      ) {
        targetLatLng = layer.getLatLng();
      }
    });
    if (currentPosition && targetLatLng) {
      const btn = e.target;
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      let spinnerTimeout = setTimeout(() => {
        btn.innerHTML = `<span class="spinner" style="display:inline-block;width:1.2em;height:1.2em;vertical-align:middle;margin-right:0.5em;border:2.5px solid #fff;border-top:2.5px solid #4ea1e0;border-radius:50%;animation:spinBtn 0.7s linear infinite;"></span> Routing`;
      }, 500);

      showORSRoute(
        { lat: currentPosition[0], lng: currentPosition[1] },
        targetLatLng,
        function afterRoute() {
          clearTimeout(spinnerTimeout);
          btn.disabled = false;
          btn.innerHTML = originalHTML;
        }
      );
    } else {
      alert('Standort oder Ziel nicht gefunden!');
    }
  }
});


// Karten-Buttons: Zentrum & Geolocation Info ##################################################
document.getElementById('center-btn')?.addEventListener('click', function (e) {
  e.stopPropagation();
  map.setView([49.01348979913584, 8.416214959608762], 16);
});

document.getElementById('geolocation-toggle')?.addEventListener('click', function () {
  const geo = document.getElementById('geolocation');
  if (geo) {
    if (geo.style.display === 'none' || geo.style.display === '') {
      geo.style.display = 'block';
    } else {
      geo.style.display = 'none';
    }
  }
});



// Geolocation-Informationen ########################################################################
map.on('zoomend', function () {
  const zoomCell = document.getElementById('geo-zoom');
  if (zoomCell) {
    zoomCell.textContent = map.getZoom();
  }
});

map.on('locationfound', function (e) {
  currentPosition = [e.latitude, e.longitude];
  // Geschwindigkeit berechnen und auf 0 setzen, falls NaN
  let speed = e.speed * 3.6;
  if (isNaN(speed)) speed = 0;
  const lat = document.getElementById('geo-lat');
  const lng = document.getElementById('geo-lng');
  const acc = document.getElementById('geo-acc');
  const spd = document.getElementById('geo-speed');
  const zoom = document.getElementById('geo-zoom');
  if (lat) lat.textContent = e.latitude.toFixed(6);
  if (lng) lng.textContent = e.longitude.toFixed(6);
  if (acc) acc.textContent = e.accuracy.toFixed(1) + ' m';
  if (spd) spd.textContent = speed.toFixed(2) + ' km/h';
  if (zoom) zoom.textContent = map.getZoom();
});

