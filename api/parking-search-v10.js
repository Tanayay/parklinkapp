const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406 };

const CATEGORY_TERMS = {
  taco: ['taco', 'taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  tacos: ['taco', 'taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  toy: ['toy store', 'toys', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'toys', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  coffee: ['coffee', 'starbucks', 'cafe', 'peets coffee'],
  pizza: ['pizza', 'pizzeria', 'dominos', 'pizza hut'],
  burger: ['burger', 'in-n-out', 'mcdonalds', 'burger king', 'five guys'],
  gas: ['gas station', 'chevron', 'shell', 'arco', 'mobil'],
  disney: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca', 'disney store', 'walt disney world resort florida', 'disney springs florida'],
  disneyland: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca'],
  disneyworld: ['walt disney world resort florida', 'magic kingdom park florida', 'epcot florida', 'disney springs florida']
};

const ALIASES = {
  cpp: 'Cal Poly Pomona, Pomona, CA',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, CA',
  disneyworld: 'Walt Disney World Resort, Lake Buena Vista, FL',
  'disney world': 'Walt Disney World Resort, Lake Buena Vista, FL',
  disneyland: 'Disneyland Resort, Anaheim, CA',
  'disney land': 'Disneyland Resort, Anaheim, CA',
  bisney: 'Disney',
  'bisney land': 'Disneyland Resort, Anaheim, CA',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven'
};

const CURATED_DESTINATIONS = {
  disney: [
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dtd-ca', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA'],
    ['dl-park', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA'],
    ['wdw', 'Walt Disney World Resort', 'Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['ds-fl', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL']
  ],
  disneyland: [
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dtd-ca', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA'],
    ['dl-park', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA']
  ],
  disneyworld: [
    ['wdw', 'Walt Disney World Resort', 'Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
    ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
    ['ds-fl', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL']
  ]
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Cal Poly Pomona Lot 2', 'Campus parking lot', 34.05945, -117.82192, 'University Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-q', 'Cal Poly Pomona Lot Q', 'Campus parking lot', 34.05372, -117.81598, 'South Campus Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-ps1', 'Cal Poly Pomona Parking Structure 1', 'Campus parking structure', 34.05720, -117.82755, 'Kellogg Dr, Pomona, CA', 'Campus structure. CPP permit/payment rules may apply.'],
  ['cpp-ps2', 'Cal Poly Pomona Parking Structure 2', 'Campus parking structure', 34.05495, -117.82470, 'Temple Ave, Pomona, CA', 'Campus structure. CPP permit/payment rules may apply.']
];

const DISNEYLAND_LOTS = [
  ['dl-mickey', 'Mickey & Friends Parking Structure', 'Parking structure', 33.8157, -117.9269, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure. Verify current pricing and tram/walk route.'],
  ['dl-pixar', 'Pixar Pals Parking Structure', 'Parking structure', 33.8144, -117.9255, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure connected to Mickey & Friends. Verify current pricing.'],
  ['dl-toy', 'Toy Story Parking Area', 'Guest parking lot', 33.7969, -117.9142, 'Harbor Blvd, Anaheim, CA', 'Large Disneyland guest parking area with shuttle access. Verify current pricing and hours.'],
  ['dl-simba', 'Simba Parking Lot', 'Downtown Disney parking lot', 33.8086, -117.9275, 'Disneyland Dr / Magic Way, Anaheim, CA', 'Downtown Disney parking. Verify validation and current access rules.']
];

const DISNEYWORLD_LOTS = [
  ['wdw-ttc', 'Transportation and Ticket Center Parking', 'Magic Kingdom / TTC parking', 28.4054, -81.5794, 'World Dr, Lake Buena Vista, FL', 'Main Magic Kingdom guest parking via monorail/ferry. Verify current pricing.'],
  ['wdw-heroes', 'Magic Kingdom Heroes Parking', 'Magic Kingdom parking zone', 28.4046, -81.5807, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near TTC. Verify signs.'],
  ['wdw-villains', 'Magic Kingdom Villains Parking', 'Magic Kingdom parking zone', 28.4029, -81.5832, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near TTC. Verify signs.'],
  ['wdw-epcot', 'EPCOT Parking', 'Theme park parking lot', 28.3766, -81.5506, 'Epcot Center Dr, Lake Buena Vista, FL', 'Primary EPCOT guest parking. Verify current pricing.'],
  ['wdw-hollywood', 'Hollywood Studios Parking', 'Theme park parking lot', 28.3585, -81.5562, 'Osceola Pkwy / Buena Vista Dr, Lake Buena Vista, FL', 'Primary Hollywood Studios guest parking. Verify current pricing.'],
  ['wdw-animal', 'Animal Kingdom Parking', 'Theme park parking lot', 28.3568, -81.5907, 'Osceola Pkwy, Lake Buena Vista, FL', 'Primary Animal Kingdom guest parking. Verify current pricing.'],
  ['wdw-orange', 'Disney Springs Orange Garage', 'Parking garage', 28.3701, -81.5199, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs garage near Town Center. Verify current access rules.'],
  ['wdw-lime', 'Disney Springs Lime Garage', 'Parking garage', 28.3712, -81.5161, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs garage near Marketplace. Verify current access rules.'],
  ['wdw-grapefruit', 'Disney Springs Grapefruit Garage', 'Parking garage', 28.3726, -81.5117, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs garage on the east side. Verify current access rules.']
];

function clean(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function norm(value = '') {
  return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function compact(value = '') {
  return norm(value).replace(/\s+/g, '');
}

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceMiles(lat1, lng1, lat2, lng2) {
  const r = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function walkText(distance) {
  return `${Math.max(1, Math.round(distance * 18))} min walk`;
}

function availabilityFor(id, distance, priority) {
  const seed = String(id).split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const raw = 78 - Math.round(distance * 12) - (priority || 0) * 3 + (seed % 13);
  return Math.max(18, Math.min(92, raw));
}

function homeText(req) {
  return clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
}

function homeAnchor(req) {
  const lat = req.query.homeLat ? Number(req.query.homeLat) : null;
  const lng = req.query.homeLng ? Number(req.query.homeLng) : null;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

function explicitLocation(query = '') {
  const text = norm(query);
  return text.includes(' near ') || text.includes(' in ') || text.includes(' anaheim') || text.includes('orlando') || text.includes('florida') || text.includes('california') || text.includes('disney world') || text.includes('disneyland') || /,\s*[a-z]{2}\b/i.test(query);
}

function resolveAlias(query = '') {
  return ALIASES[norm(query)] || ALIASES[compact(query)] || query;
}

function searchTerms(query = '') {
  const text = norm(query);
  const terms = new Set([resolveAlias(query), query]);
  for (const [key, list] of Object.entries(CATEGORY_TERMS)) {
    if (text.includes(key) || key.includes(text)) {
      list.slice(0, 5).forEach((term) => terms.add(term));
    }
  }
  return [...terms].filter(Boolean).slice(0, 6);
}

function shortAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}

function titleFrom(item = {}) {
  const address = item.address || {};
  return clean(item.name || address.shop || address.amenity || address.tourism || address.leisure || address.building || (item.display_name || '').split(',')[0]);
}

function isGenericName(name = '') {
  return ['place', 'shop', 'store', 'restaurant', 'food', 'parking', 'parking lot', 'mapped parking lot', 'taco shop', 'toy store'].includes(norm(name));
}

function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const title = titleFrom(item);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !title || isGenericName(title)) return null;
  const address = shortAddress(item.address || {}) || (item.display_name || '').split(',').slice(1, 4).map(clean).filter(Boolean).join(', ') || 'Address not listed';
  return {
    id: `place-${item.place_id || `${lat}-${lng}`}`,
    name: `${title} - ${address}`,
    shortName: title,
    address,
    lat,
    lng,
    type: item.type || 'place',
    class: item.class || 'place',
    mapQuery: `${title}, ${address}`,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}

function curatedDestinationRows(query, req) {
  const text = norm(query);
  let rows = [];
  if (text.includes('disneyland') || text.includes('anaheim')) rows = CURATED_DESTINATIONS.disneyland;
  else if (text.includes('disneyworld') || text.includes('disney world') || text.includes('orlando') || text.includes('florida')) rows = CURATED_DESTINATIONS.disneyworld;
  else if (text.includes('disney') || text.includes('bisney')) rows = CURATED_DESTINATIONS.disney;
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

async function jsonFetch(url, options = {}, timeoutMs = 3500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

async function nominatimSearch(term, req, limit = 5) {
  const anchor = homeAnchor(req);
  const area = homeText(req);
  const query = area && !explicitLocation(term) ? `${term} near ${area}` : term;
  const params = new URLSearchParams({ format: 'json', limit: String(limit), addressdetails: '1', countrycodes: 'us', q: query });
  if (anchor && !explicitLocation(term)) {
    params.set('viewbox', `${anchor.lng - 0.55},${anchor.lat + 0.55},${anchor.lng + 0.55},${anchor.lat - 0.55}`);
    params.set('bounded', '1');
  }
  return jsonFetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'ParkLink search' }
  }, 3300);
}

async function placesMode(req, res) {
  const query = clean(req.query.q || '');
  if (query.length < 2) return res.status(200).json({ suggestions: [], place: null });

  const anchor = homeAnchor(req) || DEFAULT_CENTER;
  const curated = curatedDestinationRows(query, req);
  const rawRows = [];

  for (const term of searchTerms(query)) {
    const data = await nominatimSearch(term, req, 4);
    rawRows.push(...data);
    if (rawRows.length >= 14) break;
  }

  const seen = new Set();
  const suggestions = [...curated, ...rawRows.map((item) => placeFromItem(item, anchor)).filter(Boolean)]
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

function basePlaceName(name = '') {
  return clean(name.split(' - ')[0].split(',')[0]);
}

function addressFromName(name = '') {
  return clean(name.split(' - ').slice(1).join(' - '));
}

async function geocodePlace(query, req) {
  const data = await nominatimSearch(query, req, 1);
  return data[0] ? placeFromItem(data[0], homeAnchor(req) || DEFAULT_CENTER) : null;
}

function accessLabel(tags = {}) {
  if (tags.access === 'private') return 'Private access - verify permission';
  if (tags.access === 'customers') return 'Customer/shared parking - verify signs';
  if (tags.access === 'permit') return 'Permit parking - verify permit rules';
  return 'Public/unspecified access - check posted signs';
}

function accessibility(tags = {}) {
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return 'Accessible parking indicated';
  if (tags.wheelchair === 'limited') return 'Limited accessibility indicated';
  if (tags.wheelchair === 'no') return 'Not wheelchair accessible';
  return 'Accessibility not confirmed';
}

function restrictionsFromTags(tags = {}) {
  const parts = [accessLabel(tags)];
  if (tags.fee === 'yes') parts.push('payment indicated');
  if (tags.fee === 'no') parts.push('marked free');
  if (tags.maxstay) parts.push(`max stay ${tags.maxstay}`);
  if (tags.opening_hours) parts.push(`hours: ${tags.opening_hours}`);
  return parts.join('; ');
}

function areaName(tags = {}) {
  if (tags.parking === 'multi-storey') return 'Parking structure';
  if (tags.parking === 'underground') return 'Underground parking';
  if (tags.parking === 'surface') return 'Surface parking lot';
  return 'Mapped parking lot';
}

function parkingName(tags = {}, street = '', destination = '') {
  const official = clean(tags.name || tags.operator || tags.brand || tags.ref || tags.official_name || tags.alt_name || '');
  if (official && !isGenericName(official)) return official;
  if (street) return `Parking near ${street}`;
  return `Parking near ${destination || 'destination'}`;
}

function isMajorDestination(place, query = '') {
  const text = norm(`${place && place.name ? place.name : ''} ${query}`);
  return text.includes('disney') || text.includes('cal poly pomona') || text.includes('university') || text.includes('stadium') || text.includes('airport') || text.includes('arena') || text.includes('theme park');
}

function curatedLotsFor(place, query = '', radiusMiles = 0.7) {
  const text = norm(`${place && place.name ? place.name : ''} ${query}`);
  let rows = [];
  let source = '';

  if (text.includes('cal poly pomona')) {
    rows = CPP_LOTS;
    source = 'ParkLink curated CPP data';
  } else if (text.includes('disneyland') || text.includes('anaheim') || text.includes('downtown disney')) {
    rows = DISNEYLAND_LOTS;
    source = 'ParkLink curated Disneyland data';
  } else if (text.includes('disney') || text.includes('magic kingdom') || text.includes('epcot') || text.includes('lake buena vista')) {
    rows = DISNEYWORLD_LOTS;
    source = 'ParkLink curated Disney World data';
  }

  return rows.map(([id, name, area, lat, lng, address, reason]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    const priority = 0;
    return {
      id,
      name,
      fullName: name,
      address,
      area,
      bestLot: `${address} - ${area}`,
      distance,
      capacity: area.toLowerCase().includes('garage') || area.toLowerCase().includes('structure') ? 1200 : 500,
      availability: availabilityFor(id, distance, priority),
      price: 'Verify current pricing, permits, and access rules',
      walk: walkText(distance),
      reason,
      restrictions: 'Verify current pricing, access, hours, and event restrictions before parking.',
      lat,
      lng,
      mapQuery: `${name}, ${address}`,
      kind: 'lot',
      source,
      accessibility: 'Accessibility likely, verify marked spaces/signage',
      priority
    };
  }).filter((item) => rows === DISNEYWORLD_LOTS || item.distance <= radiusMiles + 0.3).sort((a, b) => a.distance - b.distance);
}

function mainLotFor(place, query = '') {
  if (isMajorDestination(place, query)) return null;
  const name = basePlaceName(place.name || query);
  const address = place.address || addressFromName(place.name) || 'Address not listed';
  if (!name || isGenericName(name)) return null;

  const id = `main-${Math.round(place.lat * 10000)}-${Math.round(place.lng * 10000)}`;
  return {
    id,
    name: `Main Lot - ${name}`,
    fullName: `Main Lot - ${name}`,
    address,
    area: 'Likely customer/shared lot',
    bestLot: `${address} - verify signs/customer access`,
    distance: 0.03,
    capacity: 20,
    availability: availabilityFor(id, 0.03, 1),
    price: 'Customer/shared parking rules may apply',
    walk: '1-2 min walk',
    reason: `Best first check for ${name}. This is an estimated customer/shared lot near the destination; verify posted signs, towing rules, and access limits.`,
    restrictions: 'Estimated customer/shared lot - verify signs, towing rules, hours, and access limits.',
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
  const query = [
    '[out:json][timeout:14];(',
    `node["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});`,
    `way["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});`,
    `relation["amenity"="parking"](around:${radiusMeters},${place.lat},${place.lng});`,
    `way["highway"]["name"](around:${radiusMeters},${place.lat},${place.lng});`,
    ');out center tags 70;'
  ].join('');

  const data = await jsonFetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink parking' },
    body: query
  }, 7000);

  const elements = Array.isArray(data.elements) ? data.elements : [];
  const roads = elements
    .filter((item) => item.tags && item.tags.highway && item.tags.name)
    .map((item) => ({ name: item.tags.name, lat: item.center ? item.center.lat : item.lat, lng: item.center ? item.center.lon : item.lon, tags: item.tags }))
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng));

  function nearestRoad(lat, lng) {
    return roads
      .map((road) => ({ ...road, d: distanceMiles(lat, lng, road.lat, road.lng) }))
      .filter((road) => road.d <= 0.25)
      .sort((a, b) => a.d - b.d)[0] || null;
  }

  const seenLots = new Set();
  const lots = elements
    .filter((item) => item.tags && item.tags.amenity === 'parking')
    .map((item) => {
      const lat = item.lat != null ? item.lat : item.center ? item.center.lat : null;
      const lng = item.lon != null ? item.lon : item.center ? item.center.lon : null;
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

      const distance = distanceMiles(place.lat, place.lng, lat, lng);
      if (distance > radiusMiles) return null;

      const tags = item.tags || {};
      const road = nearestRoad(lat, lng);
      const street = clean(tags['addr:street'] || (road ? road.name : ''));
      const title = parkingName(tags, street, basePlaceName(place.name));
      const key = `${title}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
      if (seenLots.has(key)) return null;
      seenLots.add(key);

      const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || street || place.address || addressFromName(place.name) || 'Address not listed';
      const named = clean(tags.name || tags.operator || tags.brand || tags.ref || '');
      const priority = named ? 2 : 3;
      const id = `${item.type}-${item.id}`;

      return {
        id,
        name: title,
        fullName: named || title,
        address,
        area: areaName(tags),
        bestLot: `${address} - ${restrictionsFromTags(tags)}`,
        distance,
        capacity: Number(tags.capacity || (tags.parking === 'multi-storey' ? 400 : 70)),
        availability: availabilityFor(id, distance, priority),
        price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : 'Fee unknown',
        walk: walkText(distance),
        reason: `${named ? 'Named mapped parking area' : 'Mapped parking area'} near ${basePlaceName(place.name)}. ${restrictionsFromTags(tags)}. ${accessibility(tags)}.`,
        restrictions: restrictionsFromTags(tags),
        lat,
        lng,
        mapQuery: `${title}, ${address}`,
        kind: 'lot',
        source: 'OpenStreetMap parking data',
        accessibility: accessibility(tags),
        priority
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.priority || 5) - (b.priority || 5) || a.distance - b.distance)
    .slice(0, 10);

  const seenStreet = new Set();
  const street = roads
    .map((road, index) => {
      const tags = road.tags || {};
      const verified = Boolean(tags['parking:lane:both'] || tags['parking:lane:left'] || tags['parking:lane:right'] || tags['parking:both'] || tags['parking:left'] || tags['parking:right']);
      if (!verified || seenStreet.has(road.name)) return null;
      const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
      if (distance > radiusMiles) return null;
      seenStreet.add(road.name);
      const id = `street-${index}-${road.name}`;
      return {
        id,
        name: `Street Parking - ${road.name}`,
        fullName: `Verified mapped street parking on ${road.name}`,
        address: road.name,
        area: 'Verified mapped street parking',
        bestLot: `${road.name} - verify signs/meters/sweeping`,
        distance,
        capacity: 0,
        availability: availabilityFor(id, distance, 9),
        price: 'Check posted rules',
        walk: walkText(distance),
        reason: `Shown because parking-lane/curb-parking tags are mapped on ${road.name}. Posted signs and meters still control.`,
        restrictions: 'Verify posted signs, meter rules, permits, street sweeping, and event restrictions.',
        lat: road.lat,
        lng: road.lng,
        mapQuery: `${road.name} near ${basePlaceName(place.name)}`,
        kind: 'street',
        source: 'OpenStreetMap verified parking-lane tags',
        accessibility: 'Curb accessibility not confirmed',
        priority: 9
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 5);

  return { lots, street };
}

export default async function handler(req, res) {
  try {
    const mode = clean(req.query.mode || 'parking');
    if (mode === 'places') return placesMode(req, res);

    const query = clean(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const selectedName = clean(req.query.name || '');

    let place = null;
    if (Number.isFinite(lat) && Number.isFinite(lng) && (selectedName || !query || norm(query) === 'near me')) {
      place = {
        name: selectedName || 'Selected location',
        shortName: basePlaceName(selectedName || 'Selected location'),
        address: addressFromName(selectedName),
        lat,
        lng,
        mapQuery: selectedName || 'Selected location'
      };
    } else {
      place = await geocodePlace(query, req);
    }

    if (!place) {
      return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: 'Destination not found.' });
    }

    const minutes = Math.min(60, Math.max(5, Number(req.query.radiusMinutes || 10)));
    const radiusMiles = Math.max(0.25, minutes / 18);
    const radiusMeters = Math.round(radiusMiles * 1609.344);

    const mapped = await overpassParking(place, radiusMeters, radiusMiles).catch(() => ({ lots: [], street: [] }));
    const curated = curatedLotsFor(place, query, radiusMiles);
    const main = mainLotFor(place, query);

    const lots = [main, ...curated, ...mapped.lots]
      .filter(Boolean)
      .filter((item, index, arr) => arr.findIndex((other) => norm(other.name) === norm(item.name) && Math.abs((other.distance || 0) - (item.distance || 0)) < 0.08) === index)
      .sort((a, b) => (a.priority || 5) - (b.priority || 5) || (a.distance || 0) - (b.distance || 0))
      .slice(0, 12);

    const street = mapped.street || [];
    const results = [...lots, ...street];
    const info = street.length
      ? `Showing named/estimated lots and verified mapped street parking within about ${minutes} minutes walking.`
      : `No verified mapped street-parking tags found here. Showing destination/customer lots and mapped lots first; verify all signs and access rules.`;

    return res.status(200).json({
      place,
      suggestions: [],
      results,
      sections: { lots, street },
      radiusMinutes: minutes,
      radiusMiles,
      info,
      note: 'Availability is estimated until ParkLink sensors or live parking feeds are connected.'
    });
  } catch (error) {
    return res.status(200).json({
      place: null,
      suggestions: [],
      results: [],
      sections: { lots: [], street: [] },
      warning: error && error.message ? error.message : 'Parking search failed.'
    });
  }
}
