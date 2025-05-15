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
map.addControl(new mapboxgl.NavigationControl());
map.addControl(new mapboxgl.GeolocateControl({
  positionOptions: {
    enableHighAccuracy: true
  },
  trackUserLocation: true,
  showUserHeading: true
}));
map.addControl(new mapboxgl.ScaleControl({
  maxWidth: 100,
  unit: 'metric'
}));

// ADD CAMPUS PLAN (reversed)
// map.on('load', function () {
//   map.addSource('campusplan-geojson-source', {
//     type: 'geojson',
//     data: 'data/reversed_campusplan.geojson'
//   });

//   map.addLayer({
//     id: 'campusplan-layer',
//     type: 'fill',
//     source: 'campusplan-geojson-source',
//     paint: {
//       'fill-color': '#9fbebf',
//       'fill-opacity': 0.9
//     }
//   });
// });
