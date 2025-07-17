/**
 * UI Event Management
 * Verhindert Map-Interaktion beim Hovern/Klicken auf UI-Elemente
 */

document.addEventListener('DOMContentLoaded', function() {
  // UI-Container, die Map-Interaktion verhindern sollen (aber interne Funktionalität behalten)
  const uiContainers = [
    '#header',
    '#map-buttons',
    '#weather-popup',
    '#geolocation',
    '.leaflet-control',
    '.leaflet-popup',
    '.leaflet-popup-content-wrapper',
    '.leaflet-popup-content',
    '.leaflet-popup-close-button'
  ];

  // Buttons die komplett Event-Propagation stoppen sollen
  const buttonElements = [
    '.leaflet-btn',
    '.info-close-btn',
    '#weather-popup-close',
    '#geolocation-close'
  ];

  // Event-Handler für UI-Container (nur Movement/Zoom verhindern)
  uiContainers.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element) {
        // Nur Map-spezifische Events verhindern
        ['wheel', 'touchmove'].forEach(eventType => {
          element.addEventListener(eventType, function(e) {
            e.stopPropagation();
          }, { passive: false });
        });

        // Mouse-move nur bei längerem Hover verhindern (für Pan)
        element.addEventListener('mousemove', function(e) {
          if (e.buttons > 0) { // Nur wenn Mouse-Button gedrückt
            e.stopPropagation();
          }
        }, { passive: false });
      }
    });
  });

  // Event-Handler für echte Buttons
  buttonElements.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      if (element) {
        ['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'wheel'].forEach(eventType => {
          element.addEventListener(eventType, function(e) {
            e.stopPropagation();
          }, { passive: false });
        });

        ['touchstart', 'touchend', 'touchmove'].forEach(eventType => {
          element.addEventListener(eventType, function(e) {
            e.stopPropagation();
          }, { passive: false });
        });
      }
    });
  });

  // Spezielle Behandlung für die Legende - nur Wheel/Touch-Move verhindern
  const legendContainer = document.getElementById('map-legend');
  if (legendContainer) {
    ['wheel', 'touchmove'].forEach(eventType => {
      legendContainer.addEventListener(eventType, function(e) {
        e.stopPropagation();
      }, { passive: false });
    });

    // Mouse-move nur bei Drag verhindern
    legendContainer.addEventListener('mousemove', function(e) {
      if (e.buttons > 0) {
        e.stopPropagation();
      }
    }, { passive: false });

    // Doppelklick-Events auf der Legende komplett abfangen
    legendContainer.addEventListener('dblclick', function(e) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    }, true); // Capturing Phase für höchste Priorität

    // Auch auf allen Kindelementen der Legende
    legendContainer.addEventListener('dblclick', function(e) {
      if (e.target.closest('.legend-category') || e.target.closest('#map-legend')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, false); // Bubbling Phase als Backup
  }

  // Dynamisch hinzugefügte Elemente überwachen
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === 1) {
            // Container-Elemente
            uiContainers.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                applyContainerEventHandlers(node);
              }
              const childElements = node.querySelectorAll ? node.querySelectorAll(selector) : [];
              childElements.forEach(applyContainerEventHandlers);
            });

            // Button-Elemente
            buttonElements.forEach(selector => {
              if (node.matches && node.matches(selector)) {
                applyButtonEventHandlers(node);
              }
              const childElements = node.querySelectorAll ? node.querySelectorAll(selector) : [];
              childElements.forEach(applyButtonEventHandlers);
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  function applyContainerEventHandlers(element) {
    if (!element._uiContainerEventsApplied) {
      ['wheel', 'touchmove'].forEach(eventType => {
        element.addEventListener(eventType, function(e) {
          e.stopPropagation();
        }, { passive: false });
      });

      element.addEventListener('mousemove', function(e) {
        if (e.buttons > 0) {
          e.stopPropagation();
        }
      }, { passive: false });

      element._uiContainerEventsApplied = true;
    }
  }

  function applyButtonEventHandlers(element) {
    if (!element._uiButtonEventsApplied) {
      ['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'wheel'].forEach(eventType => {
        element.addEventListener(eventType, function(e) {
          e.stopPropagation();
        }, { passive: false });
      });

      ['touchstart', 'touchend', 'touchmove'].forEach(eventType => {
        element.addEventListener(eventType, function(e) {
          e.stopPropagation();
        }, { passive: false });
      });

      element._uiButtonEventsApplied = true;
    }
  }

  // Leaflet-Controls behandeln
  const checkForLeafletControls = setInterval(function() {
    const leafletControls = document.querySelectorAll('.leaflet-control-container .leaflet-control');
    leafletControls.forEach(applyContainerEventHandlers);
    
    setTimeout(() => clearInterval(checkForLeafletControls), 10000);
  }, 500);
});
