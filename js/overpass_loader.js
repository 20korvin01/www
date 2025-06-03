async function fetchOverpassData(query, callback) {
  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: query,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const json = await response.json();
    callback(json); // You pass it to your map
  } catch (error) {
    console.error('Overpass API fetch error:', error);
    alert('Could not load map data from Overpass.');
  }
}