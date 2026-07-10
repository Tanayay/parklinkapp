function distanceMiles(lat1, lon1, lat2, lon2) {
  const radius = 3958.8;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default async function handler(req, res) {
  try {
    const placeQuery = String(req.query.q || '').trim();
    if (!placeQuery) return res.status(400).json({ error: 'Search query required.' });

    const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(placeQuery)}`;
    const geoResponse = await fetch(geoUrl, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'ParkLink prototype parking search'
      }
    });
    if (!geoResponse.ok) throw new Error('Location search failed.');
    const geoResults = await geoResponse.json();
    if (!geoResults.length) throw new Error('No location found.');

    const place = {
      name: geoResults[0].display_name,
      lat: Number(geoResults[0].lat),
      lng: Number(geoResults[0].lon)
    };

    const overpassQuery = `[out:json][timeout:20];(node["amenity"="parking"](around:1800,${place.lat},${place.lng});way["amenity"="parking"](around:1800,${place.lat},${place.lng});relation["amenity"="parking"](around:1800,${place.lat},${place.lng}););out center tags 25;`;
    const parkingResponse = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=UTF-8',
        'User-Agent': 'ParkLink prototype parking search'
      },
      body: overpassQuery
    });
    if (!parkingResponse.ok) throw new Error('Parking search failed.');
    const parkingData = await parkingResponse.json();

    const results = parkingData.elements.map((item, index) => {
      const itemLat = item.lat ?? item.center?.lat;
      const itemLng = item.lon ?? item.center?.lon;
      const distance = itemLat && itemLng ? distanceMiles(place.lat, place.lng, itemLat, itemLng) : 0.4 + index * 0.1;
      const capacity = Number(item.tags?.capacity || 30);
      return {
        id: `${item.type}-${item.id}`,
        name: item.tags?.name || item.tags?.operator || `Parking option ${index + 1}`,
        area: item.tags?.parking ? `${item.tags.parking} parking` : 'Public parking',
        bestLot: item.tags?.access === 'private' ? 'Private / verify access' : 'OpenStreetMap parking area',
        distance,
        capacity,
        price: item.tags?.fee === 'yes' ? 'May require payment' : item.tags?.fee === 'no' ? 'Marked free' : 'Fee unknown',
        walk: `${Math.max(2, Math.round(distance * 18))} min walk`,
        reason: item.tags?.access === 'private' ? 'Listed near your destination, but access may be restricted.' : 'Found from live OpenStreetMap parking data near your destination.'
      };
    }).sort((a, b) => a.distance - b.distance).slice(0, 8);

    return res.status(200).json({ place, results });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Parking search failed.' });
  }
}
