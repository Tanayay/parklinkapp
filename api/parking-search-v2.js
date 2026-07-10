const SOCAL_CENTER = { lat: 33.8583, lng: -118.2207 };

const aliases = {
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  csudh: 'California State University Dominguez Hills, Carson, California',
  'california state university dominguez hills': 'California State University Dominguez Hills, Carson, California',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven',
  '7 eleven': '7-Eleven'
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Cal Poly Pomona Lot 2', 'Lot 2', 34.05945, -117.82192],
  ['cpp-lot-q', 'Cal Poly Pomona Lot Q', 'Lot Q', 34.05372, -117.81598],
  ['cpp-ps-1', 'Cal Poly Pomona Parking Structure 1', 'Parking Structure 1', 34.05720, -117.82755],
  ['cpp-ps-2', 'Cal Poly Pomona Parking Structure 2', 'Parking Structure 2', 34.05495, -117.82470],
  ['cpp-lot-b', 'Cal Poly Pomona Lot B', 'Lot B', 34.06105, -117.82355],
  ['cpp-lot-c', 'Cal Poly Pomona Lot C', 'Lot C', 34.06155, -117.82050],
  ['cpp-lot-e', 'Cal Poly Pomona Lot E', 'Lot E', 34.05895, -117.81590],
  ['cpp-lot-f', 'Cal Poly Pomona Lot F', 'Lot F', 34.05715, -117.81495],
  ['cpp-lot-j', 'Cal Poly Pomona Lot J', 'Lot J', 34.05285, -117.82480],
  ['cpp-lot-m', 'Cal Poly Pomona Lot M', 'Lot M', 34.05215, -117.82060]
];

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function resolveAlias(query) { return aliases[clean(query).toLowerCase()] || query; }
function toRad(v) { return (v * Math.PI) / 180; }
function distanceMiles(lat1, lng1, lat2, lng2) {
  const r = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function radiusMiles(minutes) { return Math.max(0.2, Number(minutes || 10) / 18); }
function radiusMeters(minutes) { return Math.round(radiusMiles(minutes) * 1609.344); }
function accessibility(tags = {}) {
  if (tags.access === 'private' || tags.access === 'customers') return { status: 'Restricted access', accessible: false };
  if (tags.wheelchair === 'no') return { status: 'Not wheelchair accessible', accessible: false };
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return { status: 'Accessible parking indicated', accessible: true };
  return { status: 'Accessibility not confirmed', accessible: null };
}
function shortAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian].filter(Boolean).join(' ');
  const city = address.city || address.town || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat), lng = Number(item.lon);
  const base = item.name || item.display_name?.split(',')[0] || item.address?.shop || item.address?.amenity || 'Selected place';
  const address = shortAddress(item.address || {});
  return { id: `place-${item.place_id || `${lat}-${lng}`}`, name: address ? `${base} - ${address}` : item.display_name || base, address, lat, lng, type: item.type, class: item.class, mapQuery: address ? `${base}, ${address}` : item.display_name || base, distanceFromAnchor: distanceMiles(anchor.lat, anchor.lng, lat, lng) };
}
async function geocode(query, lat, lng) {
  const anchor = lat && lng ? { lat, lng } : SOCAL_CENTER;
  const params = new URLSearchParams({ format: 'json', limit: '10', addressdetails: '1', countrycodes: 'us', q: resolveAlias(query) });
  if (lat && lng) {
    params.set('viewbox', `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`);
    params.set('bounded', '1');
  } else {
    params.set('viewbox', '-119.7,35.0,-117.0,32.5');
    params.set('bounded', '1');
  }
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json', 'User-Agent': 'ParkLink parking search' } });
  if (!response.ok) throw new Error('Location search failed.');
  const data = await response.json();
  const suggestions = data.map(item => placeFromItem(item, anchor)).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor);
  if (!suggestions.length) throw new Error('No location found.');
  return { place: suggestions[0], suggestions };
}
function isCpp(place, q = '') { return `${place?.name || ''} ${q}`.toLowerCase().includes('cal poly pomona'); }
function curatedCpp(place, maxMiles) {
  return CPP_LOTS.map(([id, mapQuery, name, lat, lng]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name, area: name.includes('Structure') ? 'Parking structure' : 'Campus lot', bestLot: 'Officially named campus parking area • Accessibility not confirmed', distance, capacity: name.includes('Structure') ? 700 : 120, price: 'CPP permit or posted payment rules may apply', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: 'Curated Cal Poly Pomona parking result. Check current campus signs and permit rules.', lat, lng, mapQuery, kind: 'lot', source: 'CPP curated data', accessibility: 'Accessibility not confirmed', accessible: null, priority: 0 };
  }).filter(item => item.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
}
async function mappedParking(place, meters, maxMiles) {
  const query = `[out:json][timeout:22];(node["amenity"="parking"](around:${meters},${place.lat},${place.lng});way["amenity"="parking"](around:${meters},${place.lat},${place.lng});relation["amenity"="parking"](around:${meters},${place.lat},${place.lng}););out center tags 60;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink mapped parking search' }, body: query });
  if (!response.ok) return [];
  const data = await response.json();
  const seen = new Set();
  return (data.elements || []).map((item, index) => {
    const lat = item.lat ?? item.center?.lat, lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles) return null;
    const tags = item.tags || {};
    const name = tags.name || tags.operator || tags.brand || (tags['addr:street'] ? `Parking Lot - ${tags['addr:street']}` : tags.parking === 'multi-storey' ? 'Parking Structure' : 'Mapped Parking Lot');
    const key = `${name}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null; seen.add(key);
    const access = accessibility(tags);
    const capacity = Number(tags.capacity || (tags.parking === 'multi-storey' ? 400 : 60));
    return { id: `${item.type}-${item.id}`, name, area: tags.parking === 'multi-storey' ? 'Parking structure' : tags.parking === 'underground' ? 'Underground parking' : 'Surface lot', bestLot: `${tags.access === 'private' ? 'Private / verify access' : 'Mapped parking area'} • ${access.status}`, distance, capacity, price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: 'Mapped parking area found near the selected destination.', lat, lng, mapQuery: tags['addr:street'] ? `${name}, ${tags['addr:street']}` : name, kind: 'lot', source: 'OpenStreetMap', accessibility: access.status, accessible: access.accessible, priority: 2 };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance);
}
async function mappedStreetParking(place, meters, maxMiles) {
  const query = `[out:json][timeout:22];way(around:${meters},${place.lat},${place.lng})["highway"][~"^parking:(lane|both|left|right)"~"yes|parallel|diagonal|perpendicular|marked|street_side|on_kerb|half_on_kerb|shoulder",i];out center tags 80;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink street parking search' }, body: query });
  if (!response.ok) return [];
  const data = await response.json();
  const seen = new Set();
  return (data.elements || []).map(item => {
    const lat = item.center?.lat, lng = item.center?.lon, tags = item.tags || {};
    if (!lat || !lng || !tags.name) return null;
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles || seen.has(tags.name)) return null; seen.add(tags.name);
    const access = accessibility(tags);
    return { id: `street-${item.id}`, name: `Street Parking - ${tags.name}`, area: 'Mapped street parking', bestLot: `Parking lane mapped on this street • ${access.status}`, distance, capacity: 8, price: tags['parking:fee'] === 'yes' ? 'Meter/payment indicated' : 'Check signs and meters', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: 'Street parking lane is explicitly mapped. Always verify posted signs and restrictions.', lat, lng, mapQuery: `${tags.name} near ${place.name}`, kind: 'street', source: 'OpenStreetMap parking-lane data', accessibility: access.status, accessible: access.accessible, priority: 9 };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance);
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const mode = clean(req.query.mode || 'parking');
    const selectedName = clean(req.query.name || '');
    const minutes = Math.min(60, Math.max(5, Number(req.query.radiusMinutes || 10)));
    const maxMiles = radiusMiles(minutes);
    const meters = radiusMeters(minutes);
    if (mode === 'places') {
      if (!q) return res.status(400).json({ error: 'Search query required.' });
      const geocoded = await geocode(q, lat, lng);
      return res.status(200).json({ suggestions: geocoded.suggestions, place: geocoded.place });
    }
    let place;
    if (lat && lng && (selectedName || !q || q.toLowerCase() === 'near me')) place = { name: selectedName || 'Your current location', address: '', lat, lng, mapQuery: selectedName || 'Your current location' };
    else place = (await geocode(q, lat, lng)).place;
    const [liveLots, street] = await Promise.all([mappedParking(place, meters, maxMiles), mappedStreetParking(place, meters, maxMiles)]);
    const curated = isCpp(place, q) ? curatedCpp(place, maxMiles) : [];
    const lots = [...curated, ...liveLots.filter(item => !curated.some(c => c.name.toLowerCase() === item.name.toLowerCase()))].sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance);
    return res.status(200).json({ place, results: [...lots, ...street], sections: { lots, street }, radiusMinutes: minutes, radiusMiles: maxMiles, note: street.length ? `Showing mapped parking within about ${minutes} minutes walking.` : `No mapped street-parking lanes found within about ${minutes} minutes. This does not prove street parking is unavailable; check posted signs.` });
  } catch (error) {
    return res.status(200).json({ place: null, results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}
