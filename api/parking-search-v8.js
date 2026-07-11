const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406 };

const CATEGORY_TERMS = {
  taco: ['taco', 'taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  tacos: ['taco', 'taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  toy: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  coffee: ['coffee', 'starbucks', 'cafe'],
  pizza: ['pizza', 'pizzeria', 'dominos', 'pizza hut'],
  burger: ['burger', 'in-n-out', 'mcdonalds', 'burger king', 'five guys'],
  gas: ['gas station', 'chevron', 'shell', 'arco', 'mobil'],
  disney: ['walt disney world resort florida', 'disneyland resort anaheim california', 'magic kingdom park', 'epcot', 'disney springs']
};

const ALIASES = {
  cpp: 'Cal Poly Pomona, Pomona, CA',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, CA',
  csudh: 'California State University Dominguez Hills, Carson, CA',
  disneyworld: 'Walt Disney World Resort, Lake Buena Vista, FL',
  'disney world': 'Walt Disney World Resort, Lake Buena Vista, FL',
  disneyland: 'Disneyland Resort, Anaheim, CA',
  'disney land': 'Disneyland Resort, Anaheim, CA',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven'
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Lot 2', 'Campus parking lot', 34.05945, -117.82192, 'University Dr, Pomona, CA', 'Cal Poly Pomona Lot 2'],
  ['cpp-lot-q', 'Lot Q', 'Campus parking lot', 34.05372, -117.81598, 'South Campus Dr, Pomona, CA', 'Cal Poly Pomona Lot Q'],
  ['cpp-ps1', 'Parking Structure 1', 'Campus parking structure', 34.05720, -117.82755, 'Kellogg Dr, Pomona, CA', 'Cal Poly Pomona Parking Structure 1'],
  ['cpp-ps2', 'Parking Structure 2', 'Campus parking structure', 34.05495, -117.82470, 'Temple Ave, Pomona, CA', 'Cal Poly Pomona Parking Structure 2'],
  ['cpp-lot-b', 'Lot B', 'Campus parking lot', 34.06105, -117.82355, 'University Dr, Pomona, CA', 'Cal Poly Pomona Lot B'],
  ['cpp-lot-c', 'Lot C', 'Campus parking lot', 34.06155, -117.82050, 'University Dr, Pomona, CA', 'Cal Poly Pomona Lot C'],
  ['cpp-lot-e', 'Lot E', 'Campus parking lot', 34.05895, -117.81590, 'South Campus Dr, Pomona, CA', 'Cal Poly Pomona Lot E'],
  ['cpp-lot-f', 'Lot F', 'Campus parking lot', 34.05715, -117.81495, 'South Campus Dr, Pomona, CA', 'Cal Poly Pomona Lot F'],
  ['cpp-lot-j', 'Lot J', 'Campus parking lot', 34.05285, -117.82480, 'Temple Ave, Pomona, CA', 'Cal Poly Pomona Lot J'],
  ['cpp-lot-m', 'Lot M', 'Campus parking lot', 34.05215, -117.82060, 'Temple Ave, Pomona, CA', 'Cal Poly Pomona Lot M']
];

const DISNEY_WORLD_LOTS = [
  ['wdw-ttc', 'Transportation and Ticket Center Parking', 'Magic Kingdom / TTC parking', 28.4054, -81.5794, 'World Dr, Lake Buena Vista, FL', 'Main Magic Kingdom guest parking via monorail/ferry.'],
  ['wdw-heroes', 'Magic Kingdom Heroes Parking', 'Magic Kingdom parking zone', 28.4046, -81.5807, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near TTC.'],
  ['wdw-villains', 'Magic Kingdom Villains Parking', 'Magic Kingdom parking zone', 28.4029, -81.5832, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near TTC.'],
  ['wdw-epcot', 'EPCOT Parking', 'Theme park parking lot', 28.3766, -81.5506, 'Epcot Center Dr, Lake Buena Vista, FL', 'Primary EPCOT guest parking.'],
  ['wdw-hollywood', 'Hollywood Studios Parking', 'Theme park parking lot', 28.3585, -81.5562, 'Osceola Pkwy / Buena Vista Dr, Lake Buena Vista, FL', 'Primary Hollywood Studios guest parking.'],
  ['wdw-animal', 'Animal Kingdom Parking', 'Theme park parking lot', 28.3568, -81.5907, 'Osceola Pkwy, Lake Buena Vista, FL', 'Primary Animal Kingdom guest parking.'],
  ['wdw-orange', 'Disney Springs Orange Garage', 'Parking garage', 28.3701, -81.5199, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage near Town Center.'],
  ['wdw-lime', 'Disney Springs Lime Garage', 'Parking garage', 28.3712, -81.5161, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage near Marketplace.'],
  ['wdw-grapefruit', 'Disney Springs Grapefruit Garage', 'Parking garage', 28.3726, -81.5117, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs garage on the east side.']
];

const DISNEYLAND_LOTS = [
  ['dl-mickey', 'Mickey & Friends Parking Structure', 'Parking structure', 33.8157, -117.9269, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-pixar', 'Pixar Pals Parking Structure', 'Parking structure', 33.8144, -117.9255, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-toy', 'Toy Story Parking Area', 'Guest parking lot', 33.7969, -117.9142, 'Harbor Blvd, Anaheim, CA', 'Large Disneyland guest parking area with shuttle access.'],
  ['dl-simba', 'Simba Parking Lot', 'Downtown Disney parking lot', 33.8086, -117.9275, 'Disneyland Dr / Magic Way, Anaheim, CA', 'Downtown Disney parking; verify current access rules.']
];

function clean(v = '') { return String(v).trim().replace(/\s+/g, ' '); }
function norm(v = '') { return clean(v).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function toRad(v) { return (v * Math.PI) / 180; }
function distanceMiles(a, b, c, d) {
  const r = 3958.8;
  const x = toRad(c - a);
  const y = toRad(d - b);
  const z = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z));
}
function milesFor(minutes) { return Math.max(0.25, Number(minutes || 10) / 18); }
function metersFor(minutes) { return Math.round(milesFor(minutes) * 1609.344); }
function shortAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}
function cityState(address = {}) {
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [city, address.state].filter(Boolean).join(', ');
}
function titleFrom(item = {}) {
  const a = item.address || {};
  return clean(item.name || a.shop || a.amenity || a.tourism || a.leisure || a.building || item.display_name?.split(',')[0] || 'Place');
}
function isGenericName(name = '') {
  return ['place', 'shop', 'store', 'restaurant', 'food', 'parking', 'parking lot', 'mapped parking lot', 'taco shop', 'toy store'].includes(norm(name));
}
function resolveAlias(q = '') { return ALIASES[norm(q)] || ALIASES[norm(q).replace(/\s+/g, '')] || q; }
function searchTerms(q = '') {
  const x = norm(q);
  const terms = new Set([resolveAlias(q), q]);
  for (const [key, list] of Object.entries(CATEGORY_TERMS)) {
    if (x.includes(key) || key.includes(x)) list.slice(0, 5).forEach((term) => terms.add(term));
  }
  return [...terms].filter(Boolean).slice(0, 6);
}
function explicitLocation(q = '') {
  const x = norm(q);
  return x.includes('near ') || x.includes(' in ') || x.includes(' anaheim') || x.includes('orlando') || x.includes('florida') || x.includes('disney world') || x.includes('disneyland') || x.includes('cal poly pomona') || /,\s*[a-z]{2}\b/i.test(q);
}
function homeText(req) {
  return clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
}
function homeAnchor(req) {
  const lat = req.query.homeLat ? Number(req.query.homeLat) : null;
  const lng = req.query.homeLng ? Number(req.query.homeLng) : null;
  return lat && lng ? { lat, lng } : null;
}
async function jsonFetch(url, timeoutMs = 5500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json', 'User-Agent': 'ParkLink v8 search' } });
    if (!response.ok) return [];
    return response.json();
  } finally {
    clearTimeout(timer);
  }
}
async function nominatimSearch(term, req, limit = 6) {
  const anchor = homeAnchor(req);
  const area = homeText(req);
  const q = area && !explicitLocation(term) ? `${term} near ${area}` : term;
  const p = new URLSearchParams({ format: 'json', limit: String(limit), addressdetails: '1', countrycodes: 'us', q });
  if (anchor && !explicitLocation(term)) {
    p.set('viewbox', `${anchor.lng - 0.55},${anchor.lat + 0.55},${anchor.lng + 0.55},${anchor.lat - 0.55}`);
    p.set('bounded', '1');
  }
  return jsonFetch(`https://nominatim.openstreetmap.org/search?${p}`, 5200).catch(() => []);
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const address = shortAddress(item.address || {}) || item.display_name?.split(',').slice(1, 4).map(clean).filter(Boolean).join(', ') || 'Address not listed';
  const title = titleFrom(item);
  if (!lat || !lng || !title || isGenericName(title)) return null;
  return {
    id: `place-${item.place_id || `${lat}-${lng}`}`,
    name: `${title} - ${address}`,
    shortName: title,
    address,
    lat,
    lng,
    type: item.type,
    class: item.class,
    mapQuery: `${title}, ${address}`,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}
async function placesMode(req, res) {
  const q = clean(req.query.q || '');
  if (q.length < 2) return res.status(200).json({ suggestions: [], place: null });
  const anchor = homeAnchor(req) || DEFAULT_CENTER;
  const rows = [];
  for (const term of searchTerms(q)) {
    const data = await nominatimSearch(term, req, 5);
    rows.push(...data);
    if (rows.length >= 18) break;
  }
  const seen = new Set();
  const suggestions = rows
    .map((item) => placeFromItem(item, anchor))
    .filter(Boolean)
    .filter((item) => {
      const key = `${norm(item.shortName)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor)
    .slice(0, 10);
  return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'v8-fast' });
}
function basePlaceName(name = '') { return clean(name.split(' - ')[0].split(',')[0]); }
function addressFromName(name = '') { return clean(name.split(' - ').slice(1).join(' - ')); }
async function geocodePlace(q, req) {
  const data = await nominatimSearch(q, req, 1);
  const first = data[0];
  if (!first) return null;
  return placeFromItem(first, homeAnchor(req) || DEFAULT_CENTER);
}
function accessLabel(tags = {}) {
  if (tags.access === 'private') return 'Private access — verify permission';
  if (tags.access === 'customers') return 'Customer/shared parking — verify signs';
  if (tags.access === 'permit') return 'Permit parking — verify permit rules';
  return 'Public/unspecified access — check posted signs';
}
function accessibility(tags = {}) {
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return 'Accessible parking indicated';
  if (tags.wheelchair === 'limited') return 'Limited accessibility indicated';
  if (tags.wheelchair === 'no') return 'Not wheelchair accessible';
  return 'Accessibility not confirmed';
}
function parkingName(tags = {}, street = '', destination = '') {
  const official = clean(tags.name || tags.operator || tags.brand || tags.ref || tags.official_name || tags.alt_name || '');
  if (official && !isGenericName(official)) return official;
  if (street) return `Parking near ${street}`;
  return `Parking near ${basePlaceName(destination)}`;
}
async function overpassParking(place, minutes) {
  const meters = metersFor(minutes);
  const maxMiles = milesFor(minutes);
  const q = `[out:json][timeout:18];(
    node["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["highway"]["name"](around:${meters},${place.lat},${place.lng});
  );out center tags 90;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink v8 parking' }, body: q });
  if (!response.ok) return { lots: [], streets: [] };
  const data = await response.json();
  const elements = data.elements || [];
  const roads = elements.map((item) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    const tags = item.tags || {};
    return lat && lng && tags.highway && tags.name ? { name: tags.name, lat, lng, type: tags.highway, tags } : null;
  }).filter(Boolean);
  function nearestRoad(lat, lng, max = 0.25) {
    return roads.map((r) => ({ ...r, d: distanceMiles(lat, lng, r.lat, r.lng) })).filter((r) => r.d <= max).sort((a, b) => a.d - b.d)[0] || null;
  }
  const seen = new Set();
  const lots = elements.filter((item) => item.tags?.amenity === 'parking').map((item, index) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const tags = item.tags || {};
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles) return null;
    const road = nearestRoad(lat, lng);
    const street = tags['addr:street'] || road?.name || '';
    const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || street || place.address || `near ${basePlaceName(place.name)}`;
    const name = parkingName(tags, street, place.name);
    const key = `${name}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const capacity = Number(tags.capacity || (tags.parking === 'multi-storey' ? 450 : 70));
    return {
      id: `${item.type}-${item.id}`,
      name,
      fullName: name,
      address,
      area: tags.parking === 'multi-storey' ? 'Parking structure' : tags.parking === 'underground' ? 'Underground parking' : 'Mapped parking lot',
      bestLot: `${address} • ${accessLabel(tags)}`,
      distance,
      capacity,
      price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown',
      walk: `${Math.max(1, Math.round(distance * 18))} min walk`,
      reason: `${name} ${address}. ${accessLabel(tags)}. ${accessibility(tags)}.`,
      lat,
      lng,
      mapQuery: `${name}, ${address}`,
      kind: 'lot',
      source: 'Mapped parking data',
      accessibility: accessibility(tags),
      priority: tags.name ? 1 : 2
    };
  }).filter(Boolean).sort((a, b) => a.priority - b.priority || a.distance - b.distance).slice(0, 10);
  const streetSeen = new Set();
  const streets = roads.map((road, index) => {
    const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
    if (distance > maxMiles || streetSeen.has(road.name)) return null;
    if (['motorway', 'motorway_link', 'trunk', 'trunk_link', 'footway', 'path', 'cycleway', 'steps'].includes(road.type)) return null;
    streetSeen.add(road.name);
    const hasLane = Boolean(road.tags['parking:lane:both'] || road.tags['parking:lane:left'] || road.tags['parking:lane:right'] || road.tags['parking:both'] || road.tags['parking:left'] || road.tags['parking:right']);
    return {
      id: `street-${road.name}-${index}`,
      name: `Street Parking — ${road.name}`,
      address: `${road.name} near ${basePlaceName(place.name)}`,
      area: hasLane ? 'Mapped street parking' : 'Likely curb parking',
      bestLot: `${road.name} • verify signs, meters, sweeping days, permits, and red curbs`,
      distance,
      capacity: 0,
      price: 'Check posted rules',
      walk: `${Math.max(1, Math.round(distance * 18))} min walk`,
      reason: hasLane ? `Parking-lane data exists on ${road.name}; posted signs still control.` : `${road.name} is nearby, but legal curb spaces are not guaranteed. Verify posted rules.`,
      lat: road.lat,
      lng: road.lng,
      mapQuery: `${road.name} near ${basePlaceName(place.name)}`,
      kind: 'street',
      source: hasLane ? 'Mapped parking-lane data' : 'Nearby street candidate',
      accessibility: 'Curb accessibility not confirmed',
      priority: hasLane ? 8 : 10
    };
  }).filter(Boolean).sort((a, b) => a.priority - b.priority || a.distance - b.distance).slice(0, 6);
  return { lots, streets };
}
function mainLot(place) {
  const title = basePlaceName(place.name || place.mapQuery || 'Destination');
  const address = place.address || addressFromName(place.name) || place.mapQuery || 'Selected destination';
  return {
    id: 'destination-main-lot',
    name: `Main Lot — ${title}`,
    fullName: `Main Lot — ${title}`,
    address,
    area: 'Destination/customer parking',
    bestLot: `${address} • likely attached/shared customer lot`,
    distance: 0.02,
    capacity: 24,
    price: 'Verify signs / customer rules',
    walk: '1 min walk',
    reason: `Start here first. If ${title} has an attached, shared, or customer lot, this is the most likely parking area. Verify posted signs, towing rules, permits, and hours.`,
    lat: place.lat,
    lng: place.lng,
    mapQuery: `${title} parking, ${address}`,
    kind: 'lot',
    source: 'Destination parking estimate',
    accessibility: 'Accessibility not confirmed',
    priority: 0
  };
}
function curatedRows(place, rows, maxMiles, source) {
  return rows.map(([id, name, area, lat, lng, address, reason]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name, fullName: name, address, area, bestLot: `${address} • ${area}`, distance, capacity: area.toLowerCase().includes('garage') || area.toLowerCase().includes('structure') ? 1200 : 500, price: 'Verify current pricing/access rules', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason, lat, lng, mapQuery: `${name}, ${address}`, kind: 'lot', source, accessibility: 'Accessibility likely; verify marked spaces/signage', priority: 0 };
  }).filter((x) => x.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
}
function curatedCpp(place, maxMiles) {
  return CPP_LOTS.map(([id, name, area, lat, lng, address, mapQuery]) => ({ id, name, fullName: mapQuery, address, area, bestLot: `${address} • CPP permit/payment rules may apply`, distance: distanceMiles(place.lat, place.lng, lat, lng), capacity: area.includes('structure') ? 700 : 120, price: 'CPP permit or posted payment rules may apply', walk: `${Math.max(1, Math.round(distanceMiles(place.lat, place.lng, lat, lng) * 18))} min walk`, reason: `${mapQuery}. Verify current permit zone, entrance, and accessible-space signage.`, lat, lng, mapQuery: `${mapQuery}, ${address}`, kind: 'lot', source: 'ParkLink curated CPP data', accessibility: 'Accessibility not confirmed', priority: 0 })).filter((x) => x.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
}
function isCpp(place, q = '') { return norm(`${place.name} ${q}`).includes('cal poly pomona'); }
function isDisneyWorld(place, q = '') { const x = norm(`${place.name} ${q}`); return x.includes('disney world') || x.includes('walt disney') || x.includes('magic kingdom') || x.includes('epcot') || x.includes('disney springs') || x.includes('animal kingdom') || x.includes('hollywood studios'); }
function isDisneyland(place, q = '') { const x = norm(`${place.name} ${q}`); return x.includes('disneyland') || x.includes('disney california adventure') || x.includes('downtown disney') || x.includes('anaheim disney'); }
async function parkingMode(req, res) {
  const minutes = Math.min(30, Math.max(5, Number(req.query.radiusMinutes || 10)));
  const maxMiles = milesFor(minutes);
  const q = clean(req.query.q || '');
  const selectedName = clean(req.query.name || q || 'Selected place');
  const lat = req.query.lat ? Number(req.query.lat) : null;
  const lng = req.query.lng ? Number(req.query.lng) : null;
  let place = lat && lng ? { name: selectedName, address: addressFromName(selectedName), lat, lng, mapQuery: selectedName } : null;
  if (!place) place = await geocodePlace(q || selectedName, req);
  if (!place) return res.status(200).json({ place: null, results: [], sections: { lots: [], street: [] }, warning: 'Could not locate that place.' });
  const base = [mainLot(place)];
  const [mapped, curated] = await Promise.all([
    overpassParking(place, minutes).catch(() => ({ lots: [], streets: [] })),
    Promise.resolve(isCpp(place, q) ? curatedCpp(place, maxMiles) : isDisneyWorld(place, q) ? curatedRows(place, DISNEY_WORLD_LOTS, Math.max(maxMiles, 3.5), 'ParkLink curated Disney World data') : isDisneyland(place, q) ? curatedRows(place, DISNEYLAND_LOTS, Math.max(maxMiles, 2.2), 'ParkLink curated Disneyland data') : [])
  ]);
  const lots = [...base, ...curated, ...mapped.lots]
    .filter((item, index, arr) => arr.findIndex((x) => norm(x.name) === norm(item.name) && Math.abs((x.distance || 0) - (item.distance || 0)) < 0.04) === index)
    .sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance)
    .slice(0, 12);
  const street = mapped.streets || [];
  return res.status(200).json({
    place,
    suggestions: [],
    results: [...lots, ...street],
    sections: { lots, street },
    radiusMinutes: minutes,
    radiusMiles: maxMiles,
    info: 'Destination/customer lots are shown first, then mapped lots, then street-parking candidates. Verify posted signs before parking.'
  });
}

export default async function handler(req, res) {
  try {
    if (clean(req.query.mode || '') === 'places') return placesMode(req, res);
    return parkingMode(req, res);
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: error.message || 'Search failed.' });
  }
}
