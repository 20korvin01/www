// Legende Management für KIT Campus POIs
// Diese Datei verwaltet die interaktive Legende mit Toggle-Funktionalität

/**
 * Initialisiert die interaktive Legende für POI-Kategorien
 * @param {Object} layerGroups - Objekt mit Layer-Gruppen für jede Kategorie
 * @param {L.MarkerClusterGroup} markers - Haupt-Cluster-Gruppe für alle Marker
 */
function initializeLegend(layerGroups, markers) {
  // Legende interaktiv machen - Kategorie-Sichtbarkeit verwalten
  const legendCategories = {
    'buildings': { layer: layerGroups.buildingMarkers, visible: true },
    'grass': { layer: layerGroups.grassMarkers, visible: true },
    'bicycle': { layer: layerGroups.bicycleMarkers, visible: true },
    'parking': { layer: layerGroups.parkingMarkers, visible: true },
    'bus': { layer: layerGroups.busMarkers, visible: true },
    'monument': { layer: layerGroups.monumentMarkers, visible: true },
    'food': { layer: layerGroups.foodMarkers, visible: true },
    'other': { layer: layerGroups.otherMarkers, visible: true }
  };

  // Toggle-all Button für die Legende
  document.getElementById('legend-toggle-all')?.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Prüfen, ob mindestens eine Kategorie sichtbar ist
    const anyVisible = Object.values(legendCategories).some(cat => cat.visible);
    
    if (anyVisible) {
      // Alle Kategorien ausblenden (wenn mindestens eine sichtbar ist)
      Object.keys(legendCategories).forEach(category => {
        if (legendCategories[category].visible) {
          markers.removeLayer(legendCategories[category].layer);
          legendCategories[category].visible = false;
        }
      });
      
      // Alle Legend-Kategorien als disabled markieren und ausgrauen
      document.querySelectorAll('.legend-category').forEach(item => {
        item.classList.add('disabled');
        item.style.opacity = '0.5';
      });
    } else {
      // Alle Kategorien einblenden (wenn alle ausgeblendet sind)
      Object.keys(legendCategories).forEach(category => {
        if (!legendCategories[category].visible) {
          markers.addLayer(legendCategories[category].layer);
          legendCategories[category].visible = true;
        }
      });
      
      // Alle Legend-Kategorien als enabled markieren und aktivieren
      document.querySelectorAll('.legend-category').forEach(item => {
        item.classList.remove('disabled');
        item.style.opacity = '1';
      });
    }
  });

  // Click-Handler für Legende hinzufügen (Einzelkategorien)
  document.addEventListener('click', function(e) {
    if (e.target.closest('.legend-category')) {
      const categoryElement = e.target.closest('.legend-category');
      const category = categoryElement.dataset.category;
      
      if (legendCategories[category]) {
        // Event-Propagation zur Karte verhindern - SOFORT stoppen
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Verhindert weitere Event-Handler
        
        const categoryData = legendCategories[category];
        
        if (categoryData.visible) {
          // Layer ausblenden
          markers.removeLayer(categoryData.layer);
          categoryElement.style.opacity = '0.5';
          categoryElement.classList.add('disabled');
          categoryData.visible = false;
        } else {
          // Layer einblenden
          markers.addLayer(categoryData.layer);
          categoryElement.style.opacity = '1';
          categoryElement.classList.remove('disabled');
          categoryData.visible = true;
        }
        
        return false;
      }
    }
  }, true); // Capturing Phase verwenden für höhere Priorität

  // Doppelklick-Handler für Legende hinzufügen (Isolation Mode)
  document.addEventListener('dblclick', function(e) {
    if (e.target.closest('.legend-category')) {
      const categoryElement = e.target.closest('.legend-category');
      const category = categoryElement.dataset.category;
      
      if (legendCategories[category]) {
        // Event-Propagation zur Karte verhindern - SOFORT stoppen
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Verhindert weitere Event-Handler
        
        // Alle anderen Kategorien ausblenden
        Object.keys(legendCategories).forEach(cat => {
          if (cat !== category) {
            const catData = legendCategories[cat];
            if (catData.visible) {
              markers.removeLayer(catData.layer);
              catData.visible = false;
              // Entsprechendes DOM-Element finden und Opacity setzen
              const catElement = document.querySelector(`[data-category="${cat}"]`);
              if (catElement) {
                catElement.style.opacity = '0.5';
                catElement.classList.add('disabled');
              }
            }
          }
        });
        
        // Gewählte Kategorie einblenden (falls nicht schon sichtbar)
        const categoryData = legendCategories[category];
        if (!categoryData.visible) {
          markers.addLayer(categoryData.layer);
          categoryData.visible = true;
          categoryElement.style.opacity = '1';
          categoryElement.classList.remove('disabled');
        }
        
        // Zusätzlich: Event komplett "konsumieren"
        return false;
      }
    }
  }, true); // Capturing Phase verwenden für höhere Priorität

  return legendCategories;
}
