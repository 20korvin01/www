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
// Event-Handler für das Ein-/Ausblenden der gesamten Legende
legendToggle?.addEventListener('click', () => {
  legendVisible = !legendVisible;
  setLegendVisible(legendVisible);
});


// Hintergrundkarten #########################################################################################################################
const cartoLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap, © CartoDB',
  maxZoom: 19,
});

// Leaflet-Map initialisieren ######################################################################
// Map initialisieren mit Standardlayer
const map = L.map('map', {
  center: [49.01348979913584, 8.416214959608762],
  zoom: 15,
  layers: [cartoLight], // Standardlayer
  fullscreenControl: true,
});
// Overlay-Layer-Objekt global anlegen
window.overlayMaps = {};
// Maßstab
L.control.scale({ metric: true, imperial: false }).addTo(map);

// Standortgeschichten #################################################################################
// Geolocation (User-Position) - initialisiert über location_info.js
const locationResult = initializeGeolocation(map);
const lc = locationResult.lc;


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
// KIT Campus Multipolygon als GeoJSON-Objekt
const campusPolygon = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "coordinates": [
                    [
                        [8.405442737039465, 49.013194314346975],
                        [8.407585018479693, 49.01154897124982],
                        [8.407695587844046, 49.011526307742315],
                        [8.408974043411575, 49.010556296715805],
                        [8.410059005302372, 49.01108663042524],
                        [8.411420390604604, 49.01041578000007],
                        [8.411323642410906, 49.00932336232876],
                        [8.417093997532305, 49.00906499438972],
                        [8.417681397281825, 49.009740395880414],
                        [8.418983219885689, 49.00968600501193],
                        [8.42053810157634, 49.01028434027242],
                        [8.420427535222558, 49.01133236106867],
                        [8.420068184787027, 49.01135955738249],
                        [8.420012900104354, 49.01143661352489],
                        [8.420095824250012, 49.01334938120428],
                        [8.422763193257452, 49.01332218379298],
                        [8.42173353607518, 49.017804649267305],
                        [8.417870518897246, 49.01689368261111],
                        [8.417267044774832, 49.018080184207975],
                        [8.41646249118341, 49.019125340638084],
                        [8.41646249118341, 49.019125340638084],
                        [8.415843466101506, 49.019253104823036],
                        [8.414941247895598, 49.01937609418994],
                        [8.414733433592573, 49.0191766517373],
                        [8.414348216836089, 49.01898053254675],
                        [8.414109990683698, 49.018900755027715],
                        [8.413658881586656, 49.01882430145193],
                        [8.413238184339122, 49.01888745876201],
                        [8.413283802111721, 49.018578319585316],
                        [8.41347641049154, 49.01839549443787],
                        [8.413560218398459, 49.01812394566758],
                        [8.413333363536168, 49.0174946362429],
                        [8.413174304379453, 49.01727574414332],
                        [8.413343127792814, 49.01732143989571],
                        [8.41355003404388, 49.01710174193454],
                        [8.413599297136443, 49.01672049918619],
                        [8.413628855172533, 49.01617124583436],
                        [8.413471550981853, 49.01575609311132],
                        [8.413292657677118, 49.014842602028835],
                        [8.41332691899288, 49.01468395488257],
                        [8.413622975798518, 49.01425793066895],
                        [8.413693675930205, 49.01400579217224],
                        [8.413706932205145, 49.0135913548568],
                        [8.41317100626219, 49.01360025688601],
                        [8.413028321147436, 49.0135014733666],
                        [8.412661699671133, 49.01352356969733],
                        [8.412564594522763, 49.013634051203184],
                        [8.411948274095863, 49.01366264637636],
                        [8.41189465633073, 49.01360467649178],
                        [8.40810023613787, 49.01375627072687],
                        [8.407973113513236, 49.013720898692526],
                        [8.40783828648702, 49.01382701472059],
                        [8.406070805546904, 49.0138973984441],
                        [8.406013714697679, 49.013639691410305],
                        [8.40586022180318, 49.0135339967548],
                        [8.405361212042862, 49.01324541685315]
                    ]
                ],
                "type": "Polygon"
            },
            "id": 0
        }
    ]
};

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
const queryURL = "https://mobilegisserver.mywire.org:8443/geoserver/mobilegis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=mobilegis%3Agroup3kit_campus_pois&outputFormat=application%2Fjson";

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

  // Cluster-Gruppe für Marker mit benutzerdefinierten Farben (dezent und kompakt)
  const markers = L.markerClusterGroup({
    disableClusteringAtZoom: 19,
    iconCreateFunction: function(cluster) {
      const childCount = cluster.getChildCount();
      let c = ' marker-cluster-';
      let size = 28; // Kleinere Standard-Größe
      
      // Kompaktere Größen basierend auf der Anzahl der Marker
      if (childCount < 10) {
        c += 'small';
        size = 28;
      } else if (childCount < 100) {
        c += 'medium';
        size = 34;
      } else {
        c += 'large';
        size = 40;
      }

      return new L.DivIcon({
        html: '<div><span>' + childCount + '</span></div>',
        className: 'marker-cluster' + c,
        iconSize: new L.Point(size, size)
      });
    }
  });

  // Separate Layer-Gruppen für jede POI-Kategorie
  const buildingMarkers = L.layerGroup();
  const grassMarkers = L.layerGroup();
  const bicycleMarkers = L.layerGroup();
  const parkingMarkers = L.layerGroup();
  const busMarkers = L.layerGroup();
  const monumentMarkers = L.layerGroup();
  const foodMarkers = L.layerGroup();
  const otherMarkers = L.layerGroup();


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

  // Bus-Icon (bi-bus-front-fill, #FFC107)
  const busIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-bus-front-fill" style="font-size:2em;color:#FFC107;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Denkmal-Icon (bi-columns-gap, #795548)
  const monumentIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-columns-gap" style="font-size:2em;color:#795548;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // Öffentlicher Platz Icon (bi-square, #FF5722)
  const placeIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-people-fill" style="font-size:1.4em;color:#FF5722;"></i>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -22]
  });

  // Essen-Icon (bi-cup-hot-fill, #5c3f15)
  const foodIcon = L.divIcon({
    className: 'custom-marker-icon',
    html: `<i class="bi bi-cup-hot-fill" style="font-size:2em;color:#5c3f15;"></i>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });

  // GeoJSON-Layer erstellen und Icons zuweisen
  const geoJsonLayer = L.geoJSON(geojson, {
    pointToLayer: function (feature, latlng) {
      // bicycle_parking → Fahrrad-Icon + Kapazität als Teil des Icons
      if (feature.properties && feature.properties.amenity === "bicycle_parking") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-bicycle\" style=\"font-size:2em;color:#009088;vertical-align:middle;\"></i>`;
        if (feature.properties.capacity) {
          html += `<span style=\"position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);color:#009088;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.capacity}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        bicycleMarkers.addLayer(marker);
        return marker;
      }
      // parking → Auto-Icon + Kapazität als Teil des Icons
      else if (feature.properties && feature.properties.amenity === "parking") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-car-front-fill\" style=\"font-size:2em;color:#444;vertical-align:middle;\"></i>`;
        if (feature.properties.capacity) {
          html += `<span style=\"position:absolute;bottom:-3px;left:50%;transform:translateX(-50%);color:#444;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.capacity}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        parkingMarkers.addLayer(marker);
        return marker;
      }
      // bus → Bus-Icon + name als Teil des Icons
      else if (feature.properties && feature.properties.bus === "yes") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-bus-front-fill\" style=\"font-size:2em;color:#FFC107;vertical-align:middle;\"></i>`;
        if (feature.properties.name) {
          html += `<span style=\"position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);color:#FFC107;font-weight:bold;font-size:0.8em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;white-space:normal;max-width:120px;text-align:center;display:block;overflow:hidden;max-height:2em;\">${feature.properties.name}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        busMarkers.addLayer(marker);
        return marker;
      }
      // memorial → Denkmal-Icon + name als Teil des Icons
      else if (feature.properties && feature.properties.memorial && feature.properties.memorial !== null && feature.properties.memorial !== "null" && feature.properties.memorial !== "") {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-columns-gap\" style=\"font-size:2em;color:#795548;vertical-align:middle;\"></i>`;
        if (feature.properties.name) {
          html += `<span style=\"position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);color:#795548;font-weight:bold;font-size:0.8em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;white-space:normal;max-width:120px;text-align:center;display:block;overflow:hidden;max-height:2em;\">${feature.properties.name}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        monumentMarkers.addLayer(marker);
        return marker;
      }
      // amenity (food establishments) → Essen-Icon + name als Teil des Icons
      else if (feature.properties && feature.properties.amenity && 
               (feature.properties.amenity === "restaurant" || 
                feature.properties.amenity === "cafe" || 
                feature.properties.amenity === "fast_food" || 
                feature.properties.amenity === "bar" || 
                feature.properties.amenity === "pub" || 
                feature.properties.amenity === "food_court" || 
                feature.properties.amenity === "canteen" || 
                feature.properties.amenity === "biergarten")) {
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-cup-hot-fill\" style=\"font-size:2em;color:#5c3f15;vertical-align:middle;\"></i>`;
        if (feature.properties.name) {
          html += `<span style=\"position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);color:#5c3f15;font-weight:bold;font-size:0.8em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;white-space:normal;max-width:120px;text-align:center;display:block;overflow:hidden;max-height:2em;\">${feature.properties.name}</span>`;
        }
        html += `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        foodMarkers.addLayer(marker);
        return marker;
      }
      // landuse → Gras-Icon
      else if (feature.properties && feature.properties.landuse) {
        const marker = L.marker(latlng, { icon: grassIcon });
        grassMarkers.addLayer(marker);
        return marker;
      }
      // building → Haus-Icon + ref als Teil des Icons
      else if (feature.properties && feature.properties.building) {
        if (!feature.properties.ref) {
          return null; // Gebäude ohne ref werden nicht angezeigt
        }
        let html = `<span style='position:relative;display:inline-block;'>` +
          `<i class=\"bi bi-house-door-fill\" style=\"font-size:2em;color:#1976D2;vertical-align:middle;\"></i>` +
          `<span style=\"position:absolute;bottom:-5px;left:50%;transform:translateX(-50%);color:#1976D2;font-weight:bold;font-size:1em;background:rgba(255,255,255,0.85);padding:0 2px;border-radius:4px;line-height:1;\">${feature.properties.ref}</span>` +
          `</span>`;
        const icon = L.divIcon({
          className: 'custom-marker-icon',
          html: html,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32]
        });
        const marker = L.marker(latlng, { icon });
        buildingMarkers.addLayer(marker);
        return marker;
      } else {
        // Prüfen, ob das Feature nur eine id hat und keine anderen aussagekräftigen Attribute
        const props = feature.properties || {};
        const meaningfulKeys = Object.keys(props).filter(key => 
          key !== "id" && 
          props[key] !== null && 
          props[key] !== undefined && 
          props[key] !== "null" && 
          props[key] !== ""
        );
        
        // Wenn keine aussagekräftigen Attribute vorhanden sind, Punkt nicht anzeigen
        if (meaningfulKeys.length === 0) {
          return null;
        }
        
        const marker = L.marker(latlng, { icon: placeIcon });
        otherMarkers.addLayer(marker);
        return marker;
      }
    },
    onEachFeature: function (feature, layer) {
      // Elegantes Popup-Design mit moderner Card-Optik
      let props = feature.properties || {};
      let tableRows = Object.keys(props)
        .filter(key => key !== "id" && props[key] !== null && props[key] !== undefined && props[key] !== "null" && props[key] !== "")
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

  // Alle Kategorie-Layer zu Cluster-Gruppe hinzufügen
  markers.addLayer(buildingMarkers);
  markers.addLayer(grassMarkers);
  markers.addLayer(bicycleMarkers);
  markers.addLayer(parkingMarkers);
  markers.addLayer(busMarkers);
  markers.addLayer(monumentMarkers);
  markers.addLayer(foodMarkers);
  markers.addLayer(otherMarkers);

  // Overlay-Layer für Layer-Control registrieren
  window.overlayMaps["POIs"] = markers;

  // Add cluster group to map
  map.addLayer(markers);

  // Legende initialisieren
  const layerGroups = {
    buildingMarkers,
    grassMarkers,
    bicycleMarkers,
    parkingMarkers,
    busMarkers,
    monumentMarkers,
    foodMarkers,
    otherMarkers
  };
  
  // Interaktive Legende mit legend.js initialisieren
  initializeLegend(layerGroups, markers);
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
  map.setView([49.01348979913584, 8.416214959608762], 15);
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

