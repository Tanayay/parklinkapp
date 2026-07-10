const SOCAL_CENTER = { lat: 33.8583, lng: -118.2207 };

const aliases = {
  csudh: 'California State University Dominguez Hills, Carson, California',
  'california state university dominguez hills': 'California State University Dominguez Hills, Carson, California',
  'california state university, dominguez hills': 'California State University Dominguez Hills, Carson, California',
  'cal state dominguez': 'California State University Dominguez Hills, Carson, California',
  'cal state dominguez hills': 'California State University Dominguez Hills, Carson, California',
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  'del amo': 'Del Amo Fashion Center, Torrance, California',
  'del amo mall': 'Del Amo Fashion Center, Torrance, California',
  '2nd & pch': '2nd & PCH, Long Beach, California',
  'second and pch': '2nd & PCH, Long Beach, California',
  'hollywood sign': 'Hollywood Sign, Los Angeles, California',
  'henderson library': 'Henderson Library, Torrance, California',
  '711': '7-Eleven near Los Angeles, California',
  '7-eleven': '7-Eleven near Los Angeles, California'
};

function cleanQuery(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function resolveAlias(query) {
  const key = cleanQuery(query).toLowerCase();
  return aliases[key] || query;
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const radius = 3958.8;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function bestName(tags = {}, index = 0) {
  const raw = tags.name || tags.operator || tags.brand || tags['addr:street'];
  if (raw) return raw;
  const parkingType = tags.parking || tags.amenity || '';
  if (parkingType.includes('street') || tags.highway) return `Street Parking - ${tags.name || tags['addr:street'] || 'Nearby Streets'}`;
  if (tags.parking === 'multi-storey') return `Parking Structure ${index + 1}`;
  if (tags.parking === 'surface') return `Surface Lot ${index + 1}`;
  if (tags.parking === 'underground') return `Underground Parking ${index + 1}`;
  return `Nearby Parking ${index + 1}`;
}

function areaName(tags = {}) {
  if (tags.parking === 'multi-storey') return 'Parking structure';
  if (tags.parking === 'surface') return 'Surface lot';
  if (tags.parking === 'street_side' || tags.highway) return 'Street parking';
  if (tags.parking) return `${tags.parking} parking`;
  return 'Public parking';
}

function popularityPenalty(placeName = '', distance = 0.4, capacity = 30) {
  const place = placeName.toLowerCase();
  let penalty = 0;
  if (place.includes('university') || place.includes('college') || place.includes('csudh') || place.includes('cal poly')) penalty += 28;
  if (place.includes('mall') || place.includes('fashion center') || place.includes('pch')) penalty += 22;
  if (place.includes('hollywood') || place.includes('los angeles')) penalty += 30;
  if (distance < 0.2) penalty += 10;
  if (capacity < 20) penalty += 8;
  return penalty;
}

function buildStreetResults(place) {
  const streets = ['Main nearby streets', 'Side streets around destination', 'Metered street zone'];
  return streets.map((street, index) => ({
    id: `street-${index}`,
    name: `Street Parking - ${street}`,
    area: 'Street parking',
    bestLot: 'Check signs, meters, permit rules, and posted hours',
    distance: 0.15 + index * 0.12,
    capacity: 8 + index * 5,
    price: 'Meter / permit possible',
    walk: `${3 + index * 2}-${5 + index * 2} min walk`,
    reason: `Street parking option near ${place.name}. Availability is estimated and signage must be checked.`,
    lat: place.lat + 0.0015 * (index + 1),
    lng: place.lng - 0.0012 * (index + 1),
    kind: 'street'
  }));
}

async function geocode(query, lat, lng) {
  const resolved = resolveAlias(query);
  const params = new URLSearchParams({
    format: 'json',
    limit: '5',
    addressdetails: '1',
    countrycodes: 'us',
    q: resolved
  });

  if (lat && lng) {
    params.set('viewbox', `${lng - 0.8},${lat + 0.8},${lng + 0.8},${lat - 0.8}`);
    params.set('bounded', '1');
  } else {
    params.set('viewbox', '-119.5,34.9,-117.0,32.7');
  }

  const geoUrl = `https://nominatim.openstreetmap.org/search?${params.toString()}`;
  const geoResponse = await fetch(geoUrl, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'ParkLink prototype parking search'
    }
  });

  if (!geoResponse.ok) throw new Error('Location search failed.');
  const results = await geoResponse.json();
  if (!results.length) throw new Error('No location found.');

  const anchor = lat && lng ? { lat, lng } : SOCAL_CENTER;
  const sorted = results
    .map((item) => ({
      name: item.display_name,
      lat: Number(item.lat),
      lng: Number(item.lon),
      type: item.type,
      class: item.class,
      distanceFromAnchor: distanceMiles(anchor.lat, anchor.lng, Number(item.lat), Number(item.lon))
    }))
    .sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor);

  return { place: sorted[0], suggestions: sorted.slice(0, 5) };
}

async function overpassParking(place) {
  const overpassQuery = `[out:json][timeout:20];(
    node["amenity"="parking"](around:2200,${place.lat},${place.lng});
    way["amenity"="parking"](around:2200,${place.lat},${place.lng});
    relation["amenity"="parking"](around:2200,${place.lat},${place.lng});
    way["parking:lane:right"](around:1200,${place.lat},${place.lng});
    way["parking:lane:left"](around:1200,${place.lat},${place.lng});
  );out center tags 35;`;

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

  const seen = new Set();
  const mapped = parkingData.elements.map((item, index) => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    if (!itemLat || !itemLng) return null;
    const tags = item.tags || {};
    const distance = distanceMiles(place.lat, place.lng, itemLat, itemLng);
    const capacity = Number(tags.capacity || (tags.parking === 'multi-storey' ? 150 : tags.parking === 'surface' ? 45 : tags.highway ? 10 : 30));
    const name = bestName(tags, index);
    const key = `${name}-${Math.round(itemLat * 10000)}-${Math.round(itemLng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const isStreet = name.toLowerCase().includes('street parking') || tags.highway || tags.parking === 'street_side';
    return {
      id: `${item.type}-${item.id}`,
      name,
      area: areaName(tags),
      bestLot: isStreet ? 'Check signs, meters, permit rules, and posted hours' : tags.access === 'private' ? 'Private / verify access' : 'OpenStreetMap parking area',
      distance,
      capacity,
      price: tags.fee === 'yes' ? 'May require payment' : tags.fee === 'no' ? 'Marked free' : isStreet ? 'Meter / permit possible' : 'Fee unknown',
      walk: `${Math.max(2, Math.round(distance * 18))} min walk`,
      reason: isStreet ? 'Street parking found near your destination. Always check signs and permit rules.' : tags.access === 'private' ? 'Listed near your destination, but access may be restricted.' : 'Found from live OpenStreetMap parking data near your destination.',
      lat: itemLat,
      lng: itemLng,
      kind: isStreet ? 'street' : 'lot'
    };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance).slice(0, 10);

  return mapped;
}

export default async function handler(req, res) {
  try {
    const q = cleanQuery(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    if (!q && (!lat || !lng)) return res.status(400).json({ error: 'Search query or location required.' });

    const geocoded = lat && lng && (!q || q.toLowerCase() === 'near me')
      ? { place: { name: 'Your current location', lat, lng }, suggestions: [] }
      : await geocode(q, lat, lng);

    const live = await overpassParking(geocoded.place).catch(() => []);
    const street = buildStreetResults(geocoded.place);
    const results = [...live, ...street]
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 12);

    const finalResults = results.length ? results : buildStreetResults(geocoded.place);

    return res.status(200).json({
      place: geocoded.place,
      suggestions: geocoded.suggestions,
      results: finalResults
    });
  } catch (error) {
    return res.status(200).json({
      place: { name: cleanQuery(req.query.q || 'Unknown destination'), lat: SOCAL_CENTER.lat, lng: SOCAL_CENTER.lng },
      suggestions: [],
      results: buildStreetResults({ name: cleanQuery(req.query.q || 'your destination'), lat: SOCAL_CENTER.lat, lng: SOCAL_CENTER.lng }),
      warning: error.message || 'Parking search failed. Showing fallback recommendations.'
    });
  }
}
