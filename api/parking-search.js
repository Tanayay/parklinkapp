const SOCAL_CENTER = { lat: 33.8583, lng: -118.2207 };

const aliases = {
  csudh: 'California State University Dominguez Hills, Carson, California',
  'california state university dominguez hills': 'California State University Dominguez Hills, Carson, California',
  'california state university, dominguez hills': 'California State University Dominguez Hills, Carson, California',
  'cal state dominguez hills': 'California State University Dominguez Hills, Carson, California',
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  'del amo': 'Del Amo Fashion Center, Torrance, California',
  'del amo mall': 'Del Amo Fashion Center, Torrance, California',
  '2nd & pch': '2nd & PCH, Long Beach, California',
  'second and pch': '2nd & PCH, Long Beach, California',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven',
  '7 eleven': '7-Eleven',
  '7-eleven': '7-Eleven'
};

function clean(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function resolveAlias(query) {
  const key = clean(query).toLowerCase();
  return aliases[key] || query;
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const radius = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function shortAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  const state = address.state;
  return [street, city, state].filter(Boolean).join(', ');
}

function displayName(item) {
  const address = item.address || {};
  const name = item.name || item.display_name?.split(',')[0] || address.shop || address.amenity || address.road || 'Selected place';
  const addr = shortAddress(address);
  return addr ? `${name} - ${addr}` : item.display_name || name;
}

function placeFromNominatim(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const label = displayName(item);
  return {
    id: item.place_id ? `place-${item.place_id}` : `${lat}-${lng}`,
    name: label,
    address: shortAddress(item.address || {}),
    lat,
    lng,
    type: item.type,
    class: item.class,
    mapQuery: label,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}

async function geocode(query, lat, lng, limit = 8) {
  const resolved = resolveAlias(query);
  const anchor = lat && lng ? { lat, lng } : SOCAL_CENTER;
  const params = new URLSearchParams({
    format: 'json',
    limit: String(limit),
    addressdetails: '1',
    countrycodes: 'us',
    q: resolved
  });

  if (lat && lng) {
    params.set('viewbox', `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`);
    params.set('bounded', '1');
  } else {
    params.set('viewbox', '-119.7,35.0,-117.0,32.5');
    params.set('bounded', '1');
  }

  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'ParkLink prototype place search' }
  });
  if (!response.ok) throw new Error('Location search failed.');
  const data = await response.json();
  if (!data.length) throw new Error('No location found.');

  const suggestions = data.map((item) => placeFromNominatim(item, anchor)).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor);
  return { place: suggestions[0], suggestions };
}

function bestParkingName(tags = {}, index = 0) {
  const name = tags.name || tags.operator || tags.brand;
  if (name) return name;
  if (tags['addr:street']) return `Parking Lot - ${tags['addr:street']}`;
  if (tags.parking === 'multi-storey') return `Parking Structure ${index + 1}`;
  if (tags.parking === 'surface') return `Surface Parking Lot ${index + 1}`;
  if (tags.parking === 'underground') return `Underground Parking ${index + 1}`;
  return `Nearby Parking Lot ${index + 1}`;
}

function areaName(tags = {}) {
  if (tags.parking === 'multi-storey') return 'Parking structure';
  if (tags.parking === 'surface') return 'Surface lot';
  if (tags.parking === 'underground') return 'Underground parking';
  if (tags.parking) return `${tags.parking} parking`;
  return 'Public parking';
}

function onsiteLotFor(place) {
  const name = place.name?.split(' - ')[0]?.split(',')[0] || 'Selected place';
  const lower = name.toLowerCase();
  const isBig = lower.includes('university') || lower.includes('mall') || lower.includes('center') || lower.includes('airport') || lower.includes('lax');
  return {
    id: `onsite-${Math.round(place.lat * 10000)}-${Math.round(place.lng * 10000)}`,
    name: isBig ? `Main Parking - ${name}` : `On-site Lot - ${name}`,
    area: isBig ? 'Destination parking' : 'Place lot',
    bestLot: isBig ? 'Prioritized because large destinations usually have dedicated parking areas' : 'Prioritized because this destination likely has its own lot',
    distance: 0.03,
    capacity: isBig ? 180 : 18,
    price: isBig ? 'May require payment or permit' : 'Usually customer parking / verify signs',
    walk: '1-2 min walk',
    reason: `Best first check: parking directly connected to ${name}. Verify signs and access rules when you arrive.`,
    lat: place.lat,
    lng: place.lng,
    mapQuery: `${name} parking lot`,
    kind: 'lot',
    source: 'Destination lot estimate',
    priority: 0
  };
}

async function nearbyRoads(place) {
  const query = `[out:json][timeout:12];way["highway"](around:900,${place.lat},${place.lng});out tags center 12;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink street parking search' },
    body: query
  });
  if (!response.ok) return [];
  const data = await response.json();
  const names = [];
  for (const item of data.elements || []) {
    const road = item.tags?.name;
    if (road && !names.includes(road)) names.push(road);
    if (names.length >= 4) break;
  }
  return names;
}

async function overpassParking(place) {
  const overpassQuery = `[out:json][timeout:20];(
    node["amenity"="parking"](around:2200,${place.lat},${place.lng});
    way["amenity"="parking"](around:2200,${place.lat},${place.lng});
    relation["amenity"="parking"](around:2200,${place.lat},${place.lng});
  );out center tags 35;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink parking search' },
    body: overpassQuery
  });
  if (!response.ok) throw new Error('Parking search failed.');
  const data = await response.json();
  const seen = new Set();
  return (data.elements || []).map((item, index) => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    if (!itemLat || !itemLng) return null;
    const tags = item.tags || {};
    const distance = distanceMiles(place.lat, place.lng, itemLat, itemLng);
    const name = bestParkingName(tags, index);
    const key = `${name}-${Math.round(itemLat * 10000)}-${Math.round(itemLng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const capacity = Number(tags.capacity || (tags.parking === 'multi-storey' ? 160 : tags.parking === 'surface' ? 55 : 30));
    const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const label = address ? `${name} - ${address}` : name;
    return {
      id: `${item.type}-${item.id}`,
      name: label,
      area: areaName(tags),
      bestLot: tags.access === 'private' ? 'Private / verify access' : 'Listed parking area',
      distance,
      capacity,
      price: tags.fee === 'yes' ? 'May require payment' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown',
      walk: `${Math.max(2, Math.round(distance * 18))} min walk`,
      reason: tags.access === 'private' ? 'Listed near your destination, but access may be restricted.' : 'Found from OpenStreetMap parking data near your selected place.',
      lat: itemLat,
      lng: itemLng,
      mapQuery: label,
      kind: 'lot',
      source: 'OpenStreetMap',
      priority: distance < 0.2 ? 1 : 2
    };
  }).filter(Boolean).sort((a, b) => a.priority - b.priority || a.distance - b.distance).slice(0, 10);
}

function buildStreetResults(place, streets = []) {
  const names = streets.length ? streets : ['nearby side streets', 'metered street zone', 'local neighborhood streets'];
  return names.slice(0, 4).map((street, index) => ({
    id: `street-${index}`,
    name: `Street Parking - ${street}`,
    area: 'Street parking',
    bestLot: 'Check signs, meters, permit rules, and posted hours',
    distance: 0.12 + index * 0.11,
    capacity: 8 + index * 5,
    price: 'Meter / permit possible',
    walk: `${3 + index * 2}-${5 + index * 2} min walk`,
    reason: `Street parking backup near ${place.name}. Always check posted signs and permit rules.`,
    lat: place.lat + 0.0014 * (index + 1),
    lng: place.lng - 0.0011 * (index + 1),
    mapQuery: `${street} near ${place.name}`,
    kind: 'street',
    source: 'Street estimate',
    priority: 9 + index
  }));
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const mode = clean(req.query.mode || 'parking');
    const selectedName = clean(req.query.name || '');

    if (mode === 'places') {
      if (!q) return res.status(400).json({ error: 'Search query required.' });
      const geocoded = await geocode(q, lat, lng, 10);
      return res.status(200).json({ suggestions: geocoded.suggestions, place: geocoded.place });
    }

    if (!q && (!lat || !lng)) return res.status(400).json({ error: 'Search query or location required.' });

    let geocoded;
    if (lat && lng && (selectedName || !q || q.toLowerCase() === 'near me')) {
      geocoded = { place: { name: selectedName || 'Your current location', address: '', lat, lng, mapQuery: selectedName || 'Your current location' }, suggestions: [] };
    } else {
      geocoded = await geocode(q, lat, lng, 10);
    }

    const [live, roads] = await Promise.all([
      overpassParking(geocoded.place).catch(() => []),
      nearbyRoads(geocoded.place).catch(() => [])
    ]);
    const onsite = onsiteLotFor(geocoded.place);
    const street = buildStreetResults(geocoded.place, roads);
    const lots = [onsite, ...live]
      .sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance)
      .slice(0, 8);
    const results = [...lots, ...street];

    return res.status(200).json({
      place: geocoded.place,
      suggestions: geocoded.suggestions,
      results,
      sections: { lots, street },
      note: 'Availability is an estimate until ParkLink sensor or live parking occupancy data is connected.'
    });
  } catch (error) {
    const place = { name: clean(req.query.q || 'your destination'), lat: SOCAL_CENTER.lat, lng: SOCAL_CENTER.lng, mapQuery: clean(req.query.q || 'your destination') };
    const onsite = onsiteLotFor(place);
    const street = buildStreetResults(place);
    return res.status(200).json({
      place,
      suggestions: [],
      results: [onsite, ...street],
      sections: { lots: [onsite], street },
      warning: error.message || 'Parking search failed. Showing fallback recommendations.'
    });
  }
}
