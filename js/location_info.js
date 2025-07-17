
// Globale Variable für aktuelle Position (für Routing)
let currentPosition = null;

/**
 * Initialisiert die Geolocation-Funktionalität
 * @param {L.Map} map - Die Leaflet-Karte
 */
function initializeGeolocation(map) {
  // Geolocation Control einrichten
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

  // Event-Handler für Zoom-Änderungen
  map.on('zoomend', function () {
    const zoomCell = document.getElementById('geo-zoom');
    if (zoomCell) {
      zoomCell.textContent = map.getZoom();
    }
  });

  // Event-Handler für gefundene Standorte
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

  return { lc, currentPosition };
}

// Geolocation-Toggle Button Handler
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

// Geolocation-Panel schließen (Schließen-Button)
document.getElementById('geolocation-close')?.addEventListener('click', function (e) {
  e.stopPropagation();
  const geo = document.getElementById('geolocation');
  if (geo) geo.style.display = 'none';
  if (geo) geo.classList.remove('open');
});

/**
 * Gibt die aktuelle Position zurück (für andere Module wie Routing)
 * @returns {Array|null} [lat, lng] oder null wenn nicht verfügbar
 */
function getCurrentPosition() {
  return currentPosition;
}
