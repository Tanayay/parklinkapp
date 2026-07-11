const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

const aliases = {
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  csudh: 'California State University Dominguez Hills, Carson, California',
  'california state university dominguez hills': 'California State University Dominguez Hills, Carson, California',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven',
  '7 eleven': '7-Eleven',
  'disney world': 'Walt Disney World Resort, Florida',
  'walt disney world': 'Walt Disney World Resort, Florida'
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Lot 2', 'Cal Poly Pomona Lot 2', 34.05945, -117.82192, 'near University Drive'],
  ['cpp-lot-q', 'Lot Q', 'Cal Poly Pomona Lot Q', 34.05372, -117.81598, 'near South Campus Drive'],
  ['cpp-ps-1', 'Parking Structure 1', 'Cal Poly Pomona Parking Structure 1', 34.05720, -117.82755, 'near Kellogg Drive'],
  ['cpp-ps-2', 'Parking Structure 2', 'Cal Poly Pomona Parking Structure 2', 34.05495, -117.82470, 'near Temple Avenue'],
  ['cpp-lot-b', 'Lot B', 'Cal Poly Pomona Lot B', 34.06105, -117.82355, 'near University Drive'],
  ['cpp-lot-c', 'Lot C', 'Cal Poly Pomona Lot C', 34.06155, -117.82050, 'near University Drive'],
  ['cpp-lot-e', 'Lot E', 'Cal Poly Pomona Lot E', 34.05895, -117.81590, 'near South Campus Drive'],
  ['cpp-lot-f', 'Lot F', 'Cal Poly Pomona Lot F', 34.05715, -117.81495, 'near South Campus Drive'],
  ['cpp-lot-j', 'Lot J', 'Cal Poly Pomona Lot J', 34.05285, -117.82480, 'near Temple Avenue'],
  ['cpp-lot-m', 'Lot M', 'Cal Poly Pomona Lot M', 34.05215, -117.82060, 'near Temple Avenue']
];

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function resolveAlias(q) { return aliases[clean(q).toLowerCase()] || q; }
function toRad(v) { return (v * Math.PI) / 180; }
function distanceMiles(a, b, c, d) {
  const r = 3958.8;
  const x = toRad(c - a);
  const y = toRad(d - b);
  const z = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z));
}
function radiusMiles(minutes) { return Math.max(0.2, Number(minutes || 10) / 18); }
function radiusMeters(minutes) { return Math.round(radiusMiles(minutes) * 1609.344); }
function compactAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}
function cityState(address = {}) {
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [city, address.state].filter(Boolean).join(', ');
}
function accessLabel(tags = {}) {
  if (tags.access === 'private') return 'Private access — verify permission';
  if (tags.access === 'customers') return 'Customer parking — verify with business';
  if (tags.access === 'permit') return 'Permit parking — verify permit rules';
  return 'Public/unspecified access — check posted signs';
}
function accessibility(tags = {}) {
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return 'Accessible parking indicated';
  if (tags.wheelchair === 'limited') return 'Limited accessibility indicated';
  if (tags.wheelchair === 'no') return 'Not wheelchair accessible';
  return 'Accessibility not confirmed';
}
function officialParkingName(tags = {}) {
  return clean(tags.name || tags.operator || tags.brand || tags.ref || tags['official_name'] || tags['alt_name'] || '');
}
function roadName(tags = {}) { return clean(tags.name || tags['addr:street'] || ''); }
function placeBase(name = '') { return clean(name.split(' - ')[0].split(',')[0]); }

async function nominatim(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'ParkLink parking search' } });
  if (!response.ok) throw new Error('Location search failed.');
  return response.json();
}
async function reverseGeocode(lat, lng) {
  try {
    const p = new URLSearchParams({ format: 'json', addressdetails: '1', lat: String(lat), lon: String(lng), zoom: '18' });
    const data = await nominatim(`https://nominatim.openstreetmap.org/reverse?${p}`);
    return { address: compactAddress(data.address || {}), city: cityState(data.address || {}), road: data.address?.road || data.address?.pedestrian || data.address?.footway || '', display: data.display_name || '' };
  } catch {
    return { address: '', city: '', road: '', display: '' };
  }
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const address = compactAddress(item.address || {});
  const base = clean(item.name || item.display_name?.split(',')[0] || item.address?.shop || item.address?.amenity || 'Selected place');
  const name = address ? `${base} - ${address}` : item.display_name || base;
  return { id: `place-${item.place_id || `${lat}-${lng}`}`, name, address, lat, lng, type: item.type, class: item.class, mapQuery: address ? `${base}, ${address}` : item.display_name || base, distanceFromAnchor: distanceMiles(anchor.lat, anchor.lng, lat, lng) };
}
function genericQuery(q) {
  const x = clean(q).toLowerCase();
  return ['7-eleven', '7 eleven', '7 11', '711', 'restaurant', 'coffee', 'gas', 'food', 'pizza', 'burger', 'taco'].some(term => x.includes(term));
}
async function geocode(query, lat, lng) {
  const anchor = lat && lng ? { lat, lng } : DEFAULT_CENTER;
  const q = resolveAlias(query);
  const params = new URLSearchParams({ format: 'json', limit: '12', addressdetails: '1', countrycodes: 'us', q });
  if (lat && lng && genericQuery(query)) {
    params.set('viewbox', `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`);
    params.set('bounded', '1');
  }
  const data = await nominatim(`https://nominatim.openstreetmap.org/search?${params}`);
  const suggestions = data.map(item => placeFromItem(item, anchor)).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor);
  if (!suggestions.length) throw new Error('No location found.');
  return { place: suggestions[0], suggestions };
}
function isCpp(place, q = '') { return `${place?.name || ''} ${q}`.toLowerCase().includes('cal poly pomona'); }
function curatedCpp(place, maxMiles) {
  return CPP_LOTS.map(([id, short, full, lat, lng, context]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name: short, fullName: full, address: context, area: 'Campus parking', bestLot: `${context} • CPP permit/payment rules may apply`, distance, capacity: short.includes('Structure') ? 700 : 120, price: 'CPP permit or posted payment rules may apply', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: `${full}. ${context}. Verify current permit zone, entrance, and accessible-space signage.`, lat, lng, mapQuery: `${full}, Pomona, CA`, kind: 'lot', source: 'ParkLink curated CPP data', accessibility: 'Accessibility not confirmed', priority: 0 };
  }).filter(item => item.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
}

async function overpassContext(place, meters, maxMiles) {
  const query = `[out:json][timeout:25];(
    node["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["highway"]["name"](around:${meters},${place.lat},${place.lng});
    node["name"](around:${meters},${place.lat},${place.lng});
  );out center tags 160;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink named parking search' }, body: query });
  if (!response.ok) return { lots: [], streets: [], pois: [], roads: [] };
  const data = await response.json();
  const elements = data.elements || [];
  const pois = [];
  const roads = [];
  for (const item of elements) {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) continue;
    const tags = item.tags || {};
    const name = clean(tags.name || tags.brand || tags.operator || '');
    if (name && !tags.amenity?.includes?.('parking')) pois.push({ name, lat, lng });
    if (tags.highway && tags.name) roads.push({ name: tags.name, lat, lng, type: tags.highway, tags });
  }
  function nearest(list, lat, lng, max = 0.35) {
    return list.map(item => ({ ...item, distance: distanceMiles(lat, lng, item.lat, item.lng) })).filter(item => item.distance <= max).sort((a, b) => a.distance - b.distance)[0] || null;
  }
  const seen = new Set();
  const rawLots = elements.filter(item => item.tags?.amenity === 'parking').map((item, index) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const tags = item.tags || {};
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles) return null;
    const official = officialParkingName(tags);
    const street = tags['addr:street'] || roadName(nearest(roads, lat, lng, 0.25)?.tags || {}) || nearest(roads, lat, lng, 0.25)?.name || '';
    const near = nearest(pois, lat, lng, 0.22);
    const key = `${official || street || index}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    return { item, tags, lat, lng, distance, official, street, near, index };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance).slice(0, 14);

  const lots = await Promise.all(rawLots.map(async (entry) => {
    const rev = await reverseGeocode(entry.lat, entry.lng);
    const street = entry.street || rev.road;
    const city = rev.city;
    const address = [ [entry.tags['addr:housenumber'], entry.tags['addr:street']].filter(Boolean).join(' '), city ].filter(Boolean).join(', ') || rev.address;
    const nearText = entry.near?.name ? `near ${entry.near.name}` : '';
    const cross = street ? `on ${street}` : city ? `in ${city}` : `near ${placeBase(place.name)}`;
    const fallbackTitle = street ? `Parking near ${street}` : city ? `Parking in ${city}` : `Parking near ${placeBase(place.name)}`;
    const shortTitle = entry.official || fallbackTitle;
    const mapQuery = entry.official ? `${entry.official}, ${address || city || placeBase(place.name)}` : `parking near ${street || address || placeBase(place.name)}`;
    const context = [address || cross, nearText].filter(Boolean).join(' • ');
    const capacity = Number(entry.tags.capacity || (entry.tags.parking === 'multi-storey' ? 500 : 80));
    return {
      id: `${entry.item.type}-${entry.item.id}`,
      name: shortTitle,
      fullName: entry.official || shortTitle,
      address: address || cross,
      area: entry.tags.parking === 'multi-storey' ? 'Parking structure' : entry.tags.parking === 'underground' ? 'Underground parking' : 'Surface / mapped lot',
      bestLot: context || cross,
      distance: entry.distance,
      capacity,
      price: entry.tags.fee === 'yes' ? 'Payment indicated' : entry.tags.fee === 'no' ? 'Marked free' : 'Fee unknown',
      walk: `${Math.max(1, Math.round(entry.distance * 18))} min walk`,
      reason: `${entry.official ? 'Named parking area' : 'Mapped parking area'} ${context || cross}. ${accessLabel(entry.tags)}. ${accessibility(entry.tags)}.`,
      lat: entry.lat,
      lng: entry.lng,
      mapQuery,
      kind: 'lot',
      source: 'OpenStreetMap + address lookup',
      accessibility: accessibility(entry.tags),
      priority: entry.official ? 0 : 2
    };
  }));

  const streetSeen = new Set();
  const streets = roads.map((road, index) => {
    const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
    if (distance > maxMiles || streetSeen.has(road.name)) return null;
    if (['motorway', 'motorway_link', 'trunk', 'trunk_link', 'footway', 'path', 'cycleway', 'steps'].includes(road.type)) return null;
    const hasLane = Boolean(road.tags['parking:lane:both'] || road.tags['parking:lane:left'] || road.tags['parking:lane:right'] || road.tags['parking:both'] || road.tags['parking:left'] || road.tags['parking:right']);
    const curbCandidate = ['residential', 'unclassified', 'tertiary', 'secondary', 'primary', 'service', 'living_street'].includes(road.type);
    if (!hasLane && !curbCandidate) return null;
    streetSeen.add(road.name);
    const cross = nearest(roads.filter(r => r.name !== road.name), road.lat, road.lng, 0.15)?.name;
    const name = cross ? `Street Parking - ${road.name} near ${cross}` : `Street Parking - ${road.name}`;
    return { id: `street-${index}-${road.name}`, name, address: cross ? `${road.name} & ${cross}` : road.name, area: hasLane ? 'Mapped street parking' : 'Likely curb parking', bestLot: `${cross ? `${road.name} & ${cross}` : road.name} • verify signs`, distance, capacity: 0, price: 'Check posted signs/meters', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: hasLane ? `Parking-lane data is mapped on ${road.name}. Posted signs still control.` : `${road.name} is a nearby drivable street where curb parking may exist. Verify signs, meters, permits, red curbs, and sweeping days.`, lat: road.lat, lng: road.lng, mapQuery: `${road.name}${cross ? ` and ${cross}` : ''} near ${placeBase(place.name)}`, kind: 'street', source: hasLane ? 'Mapped street-parking data' : 'Nearby street estimate', accessibility: 'Curb accessibility not confirmed', priority: hasLane ? 8 : 10 + index };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance).slice(0, 8);

  return { lots: lots.sort((a, b) => a.priority - b.priority || a.distance - b.distance), streets };
}

async function localPoiSearch(q, lat, lng) {
  if (!lat || !lng || clean(q).length < 2) return [];
  const meters = 5000;
  const safe = clean(q).toLowerCase().replace(/[^a-z0-9 '&-]/g, '');
  const query = `[out:json][timeout:18];(
    node["name"~"${safe}",i](around:${meters},${lat},${lng});
    way["name"~"${safe}",i](around:${meters},${lat},${lng});
    relation["name"~"${safe}",i](around:${meters},${lat},${lng});
  );out center tags 20;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink local place search' }, body: query });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.elements || []).map(item => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    const tags = item.tags || {};
    if (!itemLat || !itemLng || !tags.name) return null;
    const type = tags.cuisine || tags.amenity || tags.shop || tags.tourism || tags.leisure || 'place';
    return { id: `poi-${item.type}-${item.id}`, name: tags.name, address: type, lat: itemLat, lng: itemLng, type, class: tags.amenity || tags.shop || 'poi', mapQuery: `${tags.name}, ${type}`, distanceFromAnchor: distanceMiles(lat, lng, itemLat, itemLng) };
  }).filter(Boolean).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor).slice(0, 8);
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
      const geo = await geocode(q, lat, lng).catch(() => ({ suggestions: [], place: null }));
      const local = await localPoiSearch(q, lat, lng).catch(() => []);
      const combined = [...local, ...geo.suggestions].filter((item, i, arr) => arr.findIndex(x => x.name === item.name && Math.abs(x.lat - item.lat) < 0.0001 && Math.abs(x.lng - item.lng) < 0.0001) === i).sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor).slice(0, 12);
      if (!combined.length) return res.status(404).json({ error: 'No matching places found.' });
      return res.status(200).json({ suggestions: combined, place: combined[0] });
    }

    let place;
    if (lat && lng && (selectedName || !q || q.toLowerCase() === 'near me')) place = { name: selectedName || 'Your current location', address: '', lat, lng, mapQuery: selectedName || 'Your current location' };
    else place = (await geocode(q, lat, lng)).place;

    const context = await overpassContext(place, meters, maxMiles).catch(() => ({ lots: [], streets: [] }));
    const curated = isCpp(place, q) ? curatedCpp(place, maxMiles) : [];
    const lots = [...curated, ...context.lots].filter((item, index, arr) => arr.findIndex(x => x.name === item.name && Math.abs((x.lat || 0) - (item.lat || 0)) < 0.0003) === index).sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance);
    const street = context.streets;
    return res.status(200).json({ place, results: [...lots, ...street], sections: { lots, street }, radiusMinutes: minutes, radiusMiles: maxMiles, note: `Showing named parking, addresses, and cross-street context within about ${minutes} minutes walking.` });
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}
