const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406 };

const CATEGORY_TERMS = {
  taco: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle', 'taco'],
  tacos: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle', 'taco'],
  toy: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  coffee: ['starbucks', 'coffee', 'cafe', 'peets coffee'],
  pizza: ['pizza', 'pizzeria', 'dominos', 'pizza hut'],
  burger: ['in-n-out', 'burger', 'mcdonalds', 'burger king', 'five guys'],
  gas: ['gas station', 'chevron', 'shell', 'arco', 'mobil'],
  disney: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca', 'walt disney world resort florida', 'disney springs florida'],
  disneyworld: ['walt disney world resort florida', 'magic kingdom park florida', 'epcot florida', 'disney springs florida'],
  disneyland: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca']
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

const CURATED_DESTINATIONS = {
  disney: [
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dtd-ca', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA'],
    ['wdw', 'Walt Disney World Resort', 'Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['ds-fl', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL']
  ],
  disneyland: [
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dtd-ca', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA']
  ],
  disneyworld: [
    ['wdw', 'Walt Disney World Resort', 'Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
    ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
    ['ds-fl', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL']
  ]
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Lot 2', 'Campus parking lot', 34.05945, -117.82192, 'University Dr, Pomona, CA', 'Cal Poly Pomona Lot 2'],
  ['cpp-lot-q', 'Lot Q', 'Campus parking lot', 34.05372, -117.81598, 'South Campus Dr, Pomona, CA', 'Cal Poly Pomona Lot Q'],
  ['cpp-ps1', 'Parking Structure 1', 'Campus parking structure', 34.05720, -117.82755, 'Kellogg Dr, Pomona, CA', 'Cal Poly Pomona Parking Structure 1'],
  ['cpp-ps2', 'Parking Structure 2', 'Campus parking structure', 34.05495, -117.82470, 'Temple Ave, Pomona, CA', 'Cal Poly Pomona Parking Structure 2']
];

const DISNEYLAND_LOTS = [
  ['dl-mickey', 'Mickey & Friends Parking Structure', 'Parking structure', 33.8157, -117.9269, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-pixar', 'Pixar Pals Parking Structure', 'Parking structure', 33.8144, -117.9255, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure connected to Mickey & Friends.'],
  ['dl-toy', 'Toy Story Parking Area', 'Guest parking lot', 33.7969, -117.9142, 'Harbor Blvd, Anaheim, CA', 'Large Disneyland guest parking area with shuttle access.'],
  ['dl-simba', 'Simba Parking Lot', 'Downtown Disney parking lot', 33.8086, -117.9275, 'Disneyland Dr / Magic Way, Anaheim, CA', 'Downtown Disney parking; verify current access rules.']
];

const DISNEYWORLD_LOTS = [
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

function clean(v = '') { return String(v).trim().replace(/\s+/g, ' '); }
function norm(v = '') { return clean(v).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function compact(v = '') { return norm(v).replace(/\s+/g, ''); }
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
function titleFrom(item = {}) {
  const a = item.address || {};
  return clean(item.name || a.shop || a.amenity || a.tourism || a.leisure || a.building || item.display_name?.split(',')[0] || '');
}
function isGenericName(name = '') {
  return ['place', 'shop', 'store', 'restaurant', 'food', 'parking', 'parking lot', 'mapped parking lot', 'taco shop', 'toy store'].includes(norm(name));
}
function homeText(req) {
  return clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
}
function homeAnchor(req) {
  const lat = req.query.homeLat ? Number(req.query.homeLat) : null;
  const lng = req.query.homeLng ? Number(req.query.homeLng) : null;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
function explicitLocation(q = '') {
  const x = norm(q);
  return x.includes('near ') || x.includes(' in ') || x.includes(' anaheim') || x.includes('orlando') || x.includes('florida') || x.includes('california') || x.includes('disney world') || x.includes('disneyland') || /,\s*[a-z]{2}\b/i.test(q);
}
function resolveAlias(q = '') { return ALIASES[norm(q)] || ALIASES[compact(q)] || q; }
function searchTerms(q = '') {
  const x = norm(q);
  const terms = new Set([resolveAlias(q), q]);
  for (const [key, list] of Object.entries(CATEGORY_TERMS)) {
    if (x.includes(key) || key.includes(x)) list.slice(0, 5).forEach(term => terms.add(term));
  }
  return [...terms].filter(Boolean).slice(0, 6);
}
function curatedDestinationRows(q, req) {
  const x = norm(q);
  let rows = [];
  if (x.includes('disneyland') || x.includes('anaheim')) rows = CURATED_DESTINATIONS.disneyland;
  else if (x.includes('disneyworld') || x.includes('disney world') || x.includes('orlando') || x.includes('florida')) rows = CURATED_DESTINATIONS.disneyworld;
  else if (x.includes('disney')) rows = CURATED_DESTINATIONS.disney;
  const anchor = homeAnchor(req) || DEFAULT_CENTER;
  return rows.map(([id, name, address, lat, lng, mapQuery]) => ({
    id: `curated-${id}`,
    name: `${name} - ${address}`,
    shortName: name,
    address,
    lat,
    lng,
    type: 'curated',
    class: 'destination',
    mapQuery,
    distanceFromAnchor: distanceMiles(anchor.lat, anchor.lng, lat, lng),
    curated: true
  }));
}
async function jsonFetch(url, timeoutMs = 3800) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json', 'User-Agent': 'ParkLink v10 search' } });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
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
  return jsonFetch(`https://nominatim.openstreetmap.org/search?${p}`, 3600);
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const address = shortAddress(item.address || {}) || item.display_name?.split(',').slice(1, 4).map(clean).filter(Boolean).join(', ') || 'Address not listed';
  const title = titleFrom(item);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !title || isGenericName(title)) return null;
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
  const curated = curatedDestinationRows(q, req);
  for (const term of searchTerms(q)) {
    const data = await nominatimSearch(term, req, 5);
    rows.push(...data);
    if (rows.length >= 18) break;
  }
  const seen = new Set();
  const suggestions = [...curated, ...rows.map(item => placeFromItem(item, anchor)).filter(Boolean)]
    .filter((item) => {
      const key = `${norm(item.shortName)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => (b.curated ? 1 : 0) - (a.curated ? 1 : 0) || a.distanceFromAnchor - b.distanceFromAnchor)
    .slice(0, 10);
  return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'v10-places' });
}
function basePlaceName(name = '') { return clean(name.split(' - ')[0].split(',')[0]); }
function addressFromName(name = '') { return clean(name.split(' - ').slice(1).join(' - ')); }
async function geocodePlace(q, req) {
  const data = await nominatimSearch(q, req, 1);
  const first = data[0];
  return first ? placeFromItem(first, homeAnchor(req) || DEFAULT_CENTER) : null;
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
  return `Parking near ${destination || 'destination'}`;
}
function areaName(tags = {}) {
  if (tags.parking === 'multi-storey') return 'Parking structure';
  if (tags.parking === 'underground') return 'Underground parking';
  if (tags.parking === 'surface') return 'Surface parking lot';
  return 'Mapped parking lot';
}
function isMajorDestination(place, q = '') {
  const x = norm(`${place?.name || ''} ${q}`);
  return x.includes('disney') || x.includes('cal poly pomona') || x.includes('university') || x.includes('stadium') || x.includes('airport') || x.includes('arena') || x.includes('theme park');
}
function curatedLotsFor(place, q = '', radiusMiles = 0.6) {
  const x = norm(`${place?.name || ''} ${q}`);
  let rows = [];
  let source = '';
  if (x.includes('cal poly pomona')) { rows = CPP_LOTS; source = 'ParkLink curated CPP data'; }
  else if (x.includes('disneyland') || x.includes('anaheim')) { rows = DISNEYLAND_LOTS; source = 'ParkLink curated Disneyland data'; }
  else if (x.includes('disney') || x.includes('magic kingdom') || x.includes('epcot') || x.includes('lake buena vista')) { rows = DISNEYWORLD_LOTS; source = 'ParkLink curated Disney World data'; }
  return rows.map(([id, name, area, lat, lng, address, reason]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return {
      id,
      name,
      fullName: name,
      address,
      area,
      bestLot: `${address} • ${area}`,
      distance,
      capacity: area.toLowerCase().includes('garage') || area.toLowerCase().includes('structure') ? 1200 : 500,
      price: 'Verify current pricing, permits, and access rules',
      walk: `${Math.max(1, Math.round(distance * 18))} min walk`,
      reason,
      lat,
      lng,
      mapQuery: `${name}, ${address}`,
      kind: 'lot',
      source,
      accessibility: 'Accessibility likely, verify marked spaces/signage',
      priority: 0
    };
  }).filter(item => rows === DISNEYWORLD_LOTS || item.distance <= radiusMiles).sort((a, b) => a.distance - b.distance);
}
function mainLotFor(place, q = '') {
  if (isMajorDestination(place, q)) return null;
  const name = basePlaceName(place.name || q);
  const address = place.address || addressFromName(place.name) || homeText({ query: {} }) || 'Address not listed';
  if (!name || isGenericName(name)) return null;
  return {
    id: `main-${Math.round(place.lat * 10000)}-${Math.round(place.lng * 10000)}`,
    name: `Main Lot — ${name}`,
    fullName: `Main Lot — ${name}`,
    address,
    area: 'Likely customer/shared lot',
    bestLot: `${address} • verify signs/customer access`,
    distance: 0.03,
    capacity: 20,
    price: 'Customer/shared parking rules may apply',
    walk: '1-2 min walk',
    reason: `Best first check for ${name}. This is treated as likely customer/shared parking near the destination; verify posted signs, towing rules, and access limits.`,
    lat: place.lat,
    lng: place.lng,
    mapQuery: `${name} parking, ${address}`,
    kind: 'lot',
    source: 'ParkLink destination-lot estimate',
    accessibility: 'Accessibility not confirmed',
    priority: 1
  };
}
async function overpassParking(place, radiusMeters, radiusMiles) {
  const q = `[out:json][timeout:18];(
    node["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});
    way["highway"]["name"](around:${radiusMeters},${place.lat},${place.lng});
  );out center tags 80;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink v10 parking' }, body: q });
  if (!response.ok) return { lots: [], street: [] };
  const data = await response.json();
  const elements = data.elements || [];
  const roads = elements.filter(e => e.tags?.highway && e.tags?.name).map(e => ({ name: e.tags.name, lat: e.center?.lat, lng: e.center?.lon, tags: e.tags })).filter(e => e.lat && e.lng);
  function nearestRoad(lat, lng) {
    return roads.map(r => ({ ...r, d: distanceMiles(lat, lng, r.lat, r.lng) })).filter(r => r.d <= 0.25).sort((a, b) => a.d - b.d)[0] || null;
  }
  const seen = new Set();
  const lots = elements.filter(e => e.tags?.amenity === 'parking').map((item, i) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > radiusMiles) return null;
    const tags = item.tags || {};
    const road = nearestRoad(lat, lng);
    const street = clean(tags['addr:street'] || road?.name || '');
    const title = parkingName(tags, street, basePlaceName(place.name));
    const key = `${title}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || (street ? `${street}` : place.address || addressFromName(place.name));
    const named = clean(tags.name || tags.operator || tags.brand || tags.ref || '');
    return {
      id: `${item.type}-${item.id}`,
      name: title,
      fullName: named || title,
      address: address || 'Address not listed',
      area: areaName(tags),
      bestLot: `${address || street || 'near destination'} • ${accessLabel(tags)}`,
      distance,
      capacity: Number(tags.capacity || (tags.parking === 'multi-storey' ? 400 : 70)),
      price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown',
      walk: `${Math.max(1, Math.round(distance * 18))} min walk`,
      reason: `${named ? 'Named mapped parking area' : 'Mapped parking area'} near ${basePlaceName(place.name)}. ${accessLabel(tags)}. ${accessibility(tags)}.`,
      lat,
      lng,
      mapQuery: `${title}, ${address || street || basePlaceName(place.name)}`,
      kind: 'lot',
      source: 'OpenStreetMap parking data',
      accessibility: accessibility(tags),
      priority: named ? 2 : 3
    };
  }).filter(Boolean).sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5) || a.distance - b.distance).slice(0, 10);

  const streetSeen = new Set();
  const street = roads.map((road, i) => {
    const tags = road.tags || {};
    const hasVerifiedParking = Boolean(tags['parking:lane:both'] || tags['parking:lane:left'] || tags['parking:lane:right'] || tags['parking:both'] || tags['parking:left'] || tags['parking:right']);
    if (!hasVerifiedParking || streetSeen.has(road.name)) return null;
    const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
    if (distance > radiusMiles) return null;
    streetSeen.add(road.name);
    return {
      id: `street-${i}-${road.name}`,
      name: `Street Parking — ${road.name}`,
      fullName: `Verified mapped street parking on ${road.name}`,
      address: road.name,
      area: 'Verified mapped street parking',
      bestLot: `${road.name} • verify signs/meters/sweeping`,
      distance,
      capacity: 0,
      price: 'Check posted rules',
      walk: `${Math.max(1, Math.round(distance * 18))} min walk`,
      reason: `Shown because parking-lane/curb-parking tags are mapped on ${road.name}. Posted signs and meters still control.`,
      lat: road.lat,
      lng: road.lng,
      mapQuery: `${road.name} near ${basePlaceName(place.name)}`,
      kind: 'street',
      source: 'OpenStreetMap verified parking-lane tags',
      accessibility: 'Curb accessibility not confirmed',
      priority: 9
    };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance).slice(0, 6);
  return { lots, street };
}
export default async function handler(req, res) {
  try {
    const mode = clean(req.query.mode || 'parking');
    if (mode === 'places') return placesMode(req, res);
    const q = clean(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const selectedName = clean(req.query.name || '');
    let place = null;
    if (Number.isFinite(lat) && Number.isFinite(lng) && (selectedName || !q || norm(q) === 'near me')) {
      place = { name: selectedName || 'Your current location', shortName: basePlaceName(selectedName || 'Your current location'), address: addressFromName(selectedName), lat, lng, mapQuery: selectedName || 'Your current location' };
    } else {
      place = await geocodePlace(q, req);
    }
    if (!place) return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: 'Destination not found.' });
    const minutes = Math.min(60, Math.max(5, Number(req.query.radiusMinutes || 10)));
    const radiusMiles = milesFor(minutes);
    const radiusMeters = metersFor(minutes);
    const [mapped, curated] = await Promise.all([
      overpassParking(place, radiusMeters, radiusMiles).catch(() => ({ lots: [], street: [] })),
      Promise.resolve(curatedLotsFor(place, q, radiusMiles))
    ]);
    const main = mainLotFor(place, q);
    const lots = [main, ...curated, ...mapped.lots]
      .filter(Boolean)
      .filter((item, index, arr) => arr.findIndex(other => norm(other.name) === norm(item.name) && Math.abs(other.distance - item.distance) < 0.08) === index)
      .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5) || a.distance - b.distance)
      .slice(0, 12);
    const street = mapped.street;
    const results = [...lots, ...street];
    const info = street.length
      ? `Showing named/estimated lots and verified mapped street parking within about ${minutes} minutes walking.`
      : `No verified mapped street-parking tags found here. Showing destination/customer lots and mapped lots first; verify all signs and access rules.`;
    return res.status(200).json({ place, suggestions: [], results, sections: { lots, street }, radiusMinutes: minutes, radiusMiles, info, note: 'Availability is estimated until ParkLink sensors or live parking feeds are connected.' });
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}
