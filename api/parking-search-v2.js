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
  ['cpp-lot-2', 'Lot 2', 34.05945, -117.82192],
  ['cpp-lot-q', 'Lot Q', 34.05372, -117.81598],
  ['cpp-ps-1', 'Parking Structure 1', 34.05720, -117.82755],
  ['cpp-ps-2', 'Parking Structure 2', 34.05495, -117.82470],
  ['cpp-lot-b', 'Lot B', 34.06105, -117.82355],
  ['cpp-lot-c', 'Lot C', 34.06155, -117.82050],
  ['cpp-lot-e', 'Lot E', 34.05895, -117.81590],
  ['cpp-lot-f', 'Lot F', 34.05715, -117.81495],
  ['cpp-lot-j', 'Lot J', 34.05285, -117.82480],
  ['cpp-lot-m', 'Lot M', 34.05215, -117.82060]
];

const clean = (value = '') => String(value).trim().replace(/\s+/g, ' ');
const resolveAlias = (query) => aliases[clean(query).toLowerCase()] || query;
const toRad = (value) => (value * Math.PI) / 180;
function distanceMiles(lat1, lng1, lat2, lng2) {
  const r = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
const radiusMiles = (minutes) => Math.max(0.2, Number(minutes || 10) / 18);
const radiusMeters = (minutes) => Math.round(radiusMiles(minutes) * 1609.344);
function shortAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state, address.postcode].filter(Boolean).join(', ');
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat), lng = Number(item.lon);
  const base = item.name || item.display_name?.split(',')[0] || item.address?.shop || item.address?.amenity || 'Selected place';
  const address = shortAddress(item.address || {});
  return { id: `place-${item.place_id || `${lat}-${lng}`}`, name: base, address, displayName: address ? `${base} — ${address}` : item.display_name || base, lat, lng, type: item.type, class: item.class, mapQuery: address ? `${base}, ${address}` : item.display_name || base, distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0 };
}
async function nominatimSearch(query, lat, lng) {
  const anchor = lat && lng ? { lat, lng } : null;
  const params = new URLSearchParams({ format: 'json', limit: '12', addressdetails: '1', q: resolveAlias(query) });
  if (lat && lng) params.set('viewbox', `${lng - 0.5},${lat + 0.5},${lng + 0.5},${lat - 0.5}`);
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json', 'User-Agent': 'ParkLink global destination search' } });
  if (!response.ok) return [];
  const data = await response.json();
  const results = data.map((item) => placeFromItem(item, anchor));
  if (anchor) results.sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor);
  return results;
}
async function nearbyPoiSearch(query, lat, lng) {
  if (!lat || !lng || clean(query).length < 2) return [];
  const meters = 20000;
  const overpass = `[out:json][timeout:20];(
    node["name"](around:${meters},${lat},${lng});
    way["name"](around:${meters},${lat},${lng});
    relation["name"](around:${meters},${lat},${lng});
  );out center tags 350;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink nearby business search' }, body: overpass });
  if (!response.ok) return [];
  const data = await response.json();
  const needle = clean(query).toLowerCase().replace(/[^a-z0-9]/g, '');
  const allowed = new Set(['restaurant','cafe','fast_food','bar','pub','marketplace','cinema','school','university','college','hospital','pharmacy','fuel','bank','library','community_centre','shop']);
  return (data.elements || []).map((item) => {
    const tags = item.tags || {};
    const name = tags.name || tags.brand || tags.operator;
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    if (!name || !itemLat || !itemLng) return null;
    const hay = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const amenity = tags.amenity || tags.shop || tags.tourism || tags.leisure || '';
    if (!hay.includes(needle) && !needle.includes(hay)) return null;
    if (!allowed.has(amenity) && !tags.shop && !tags.amenity) return null;
    const address = [tags['addr:housenumber'], tags['addr:street'], tags['addr:city'], tags['addr:state']].filter(Boolean).join(', ');
    return { id: `poi-${item.type}-${item.id}`, name, address, displayName: address ? `${name} — ${address}` : name, lat: itemLat, lng: itemLng, type: amenity, class: tags.shop ? 'shop' : 'amenity', mapQuery: address ? `${name}, ${address}` : `${name} near ${lat},${lng}`, distanceFromAnchor: distanceMiles(lat, lng, itemLat, itemLng) };
  }).filter(Boolean).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor).slice(0, 12);
}
async function geocode(query, lat, lng) {
  const [globalResults, nearbyResults] = await Promise.all([nominatimSearch(query, lat, lng), nearbyPoiSearch(query, lat, lng).catch(() => [])]);
  const seen = new Set();
  const suggestions = [...nearbyResults, ...globalResults].filter((item) => {
    const key = `${item.name.toLowerCase()}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 15);
  if (!suggestions.length) throw new Error('No matching location found.');
  return { place: suggestions[0], suggestions };
}
function accessibility(tags = {}) {
  if (tags.access === 'private') return { status: 'Private access', accessible: false };
  if (tags.access === 'customers') return { status: 'Customer-only parking', accessible: null };
  if (tags.access === 'permit') return { status: 'Permit required', accessible: null };
  if (tags.wheelchair === 'no') return { status: 'Not wheelchair accessible', accessible: false };
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return { status: 'Accessible parking indicated', accessible: true };
  return { status: 'Accessibility not confirmed', accessible: null };
}
function nearestNamed(lat, lng, list, exclude = '', max = 0.35) {
  let best = null;
  for (const item of list) {
    if (!item.name || item.name === exclude) continue;
    const distance = distanceMiles(lat, lng, item.lat, item.lng);
    if (distance <= max && (!best || distance < best.distance)) best = { ...item, distance };
  }
  return best;
}
function lotName(tags = {}, index = 0) {
  return tags.name || tags.operator || tags.brand || (tags['addr:street'] ? `Parking on ${tags['addr:street']}` : tags.parking === 'multi-storey' ? 'Parking Structure' : tags.parking === 'underground' ? 'Underground Parking' : `Parking Lot ${index + 1}`);
}
function lotType(tags = {}) {
  if (tags.parking === 'multi-storey') return 'Parking structure';
  if (tags.parking === 'underground') return 'Underground parking';
  if (tags.parking === 'surface') return 'Surface lot';
  return 'Parking area';
}
async function mappedContext(place, meters, maxMiles) {
  const query = `[out:json][timeout:24];(
    node["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["highway"]["name"](around:${meters},${place.lat},${place.lng});
    node["name"]["amenity"](around:${meters},${place.lat},${place.lng});
    node["name"]["shop"](around:${meters},${place.lat},${place.lng});
  );out center tags 220;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink parking context search' }, body: query });
  if (!response.ok) return { lots: [], street: [] };
  const data = await response.json();
  const elements = data.elements || [];
  const roads = elements.filter((item) => item.tags?.highway && item.tags?.name).map((item) => ({ name: item.tags.name, lat: item.center?.lat, lng: item.center?.lon, tags: item.tags })).filter((item) => item.lat && item.lng);
  const pois = elements.filter((item) => item.tags?.name && (item.tags?.amenity || item.tags?.shop)).map((item) => ({ name: item.tags.name, lat: item.lat ?? item.center?.lat, lng: item.lon ?? item.center?.lon })).filter((item) => item.lat && item.lng);
  const seen = new Set();
  const lots = elements.filter((item) => item.tags?.amenity === 'parking').map((item, index) => {
    const lat = item.lat ?? item.center?.lat, lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles) return null;
    const tags = item.tags || {};
    const name = lotName(tags, index);
    const key = `${name}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const road1 = nearestNamed(lat, lng, roads, '');
    const road2 = nearestNamed(lat, lng, roads.filter((road) => road.name !== road1?.name), '', 0.5);
    const poi = nearestNamed(lat, lng, pois, name, 0.25);
    const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const locationText = address || (road1?.name && road2?.name ? `near ${road1.name} & ${road2.name}` : road1?.name ? `on or near ${road1.name}` : `near ${place.address || place.name}`);
    const nearbyText = poi?.name ? ` Near ${poi.name}.` : '';
    const access = accessibility(tags);
    const capacity = Number(tags.capacity || (tags.parking === 'multi-storey' ? 400 : 60));
    return { id: `${item.type}-${item.id}`, name, area: lotType(tags), bestLot: `${locationText} • ${access.status}`, address: locationText, crossStreets: road1?.name && road2?.name ? `${road1.name} & ${road2.name}` : '', distance, capacity, price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: `${lotType(tags)} ${locationText}.${nearbyText} Check entrance, access, signs, and posted hours.`, lat, lng, mapQuery: address || `${name}, ${locationText}`, kind: 'lot', source: 'OpenStreetMap', accessibility: access.status, accessible: access.accessible, priority: 2 };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance);
  const streetSeen = new Set();
  const street = roads.map((road, index) => {
    if (streetSeen.has(road.name)) return null;
    const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
    if (distance > maxMiles) return null;
    const type = road.tags.highway;
    if (['motorway','motorway_link','trunk','trunk_link','footway','path','cycleway','steps'].includes(type)) return null;
    const confirmed = Boolean(road.tags['parking:lane:both'] || road.tags['parking:lane:left'] || road.tags['parking:lane:right'] || road.tags['parking:both'] || road.tags['parking:left'] || road.tags['parking:right']);
    const candidate = ['residential','unclassified','tertiary','secondary','primary','service','living_street'].includes(type);
    if (!confirmed && !candidate) return null;
    streetSeen.add(road.name);
    const crossing = nearestNamed(road.lat, road.lng, roads.filter((item) => item.name !== road.name), '', 0.22);
    const poi = nearestNamed(road.lat, road.lng, pois, '', 0.2);
    const where = crossing?.name ? `${road.name} near ${crossing.name}` : road.name;
    return { id: `street-${index}-${road.name}`, name: `Street Parking — ${where}`, area: confirmed ? 'Mapped curb parking' : 'Likely curb parking', bestLot: `${where} • verify signs and curb rules`, address: where, crossStreets: crossing?.name ? `${road.name} & ${crossing.name}` : road.name, distance, capacity: 0, price: 'Check signs and meters', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: `${confirmed ? 'Parking-lane data is mapped' : 'Curb parking may exist'} on ${road.name}${crossing?.name ? ` near ${crossing.name}` : ''}.${poi?.name ? ` Nearby landmark: ${poi.name}.` : ''} Posted signs always control.`, lat: road.lat, lng: road.lng, mapQuery: `${where} near ${place.name}`, kind: 'street', source: confirmed ? 'Mapped parking-lane data' : 'Nearby street candidate', accessibility: 'Curb accessibility not confirmed', accessible: null, priority: confirmed ? 8 : 10 };
  }).filter(Boolean).sort((a, b) => a.priority - b.priority || a.distance - b.distance).slice(0, 10);
  return { lots, street };
}
function isCpp(place, q = '') { return `${place?.name || ''} ${place?.address || ''} ${q}`.toLowerCase().includes('cal poly pomona'); }
function curatedCpp(place, maxMiles) {
  return CPP_LOTS.map(([id, name, lat, lng]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name, area: name.includes('Structure') ? 'Parking structure' : 'Campus lot', bestLot: `Cal Poly Pomona campus • ${name}`, address: 'Cal Poly Pomona campus', crossStreets: '', distance, capacity: name.includes('Structure') ? 700 : 120, price: 'CPP permit or posted payment rules may apply', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: `Curated CPP parking result for ${name}. Check the campus map, entrance signs, permit zone, and accessibility markings.`, lat, lng, mapQuery: `Cal Poly Pomona ${name}`, kind: 'lot', source: 'CPP curated data', accessibility: 'Accessibility not confirmed', accessible: null, priority: 0 };
  }).filter((item) => item.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
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
    const context = await mappedContext(place, meters, maxMiles);
    const curated = isCpp(place, q) ? curatedCpp(place, maxMiles) : [];
    const lots = [...curated, ...context.lots.filter((item) => !curated.some((c) => c.name.toLowerCase() === item.name.toLowerCase()))].sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance);
    return res.status(200).json({ place, results: [...lots, ...context.street], sections: { lots, street: context.street }, radiusMinutes: minutes, radiusMiles: maxMiles, note: `Showing parking within about ${minutes} minutes walking. Addresses and cross streets are included when map data provides enough context.` });
  } catch (error) {
    return res.status(200).json({ place: null, results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}
