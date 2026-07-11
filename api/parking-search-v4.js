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
  disneyworld: 'Walt Disney World Resort, Florida',
  'disney world': 'Walt Disney World Resort, Florida',
  'walt disney world': 'Walt Disney World Resort, Florida',
  disneyland: 'Disneyland Resort, Anaheim, California',
  'disney land': 'Disneyland Resort, Anaheim, California'
};

const RELATED_DESTINATIONS = {
  disney: [
    ['wdw', 'Walt Disney World Resort', 'Orlando / Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
    ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
    ['ds', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL'],
    ['dhs', 'Disney’s Hollywood Studios', 'Hollywood Blvd, Lake Buena Vista, FL', 28.3575, -81.5583, 'Disney Hollywood Studios, Lake Buena Vista, FL'],
    ['dak', 'Disney’s Animal Kingdom', 'Osceola Pkwy, Lake Buena Vista, FL', 28.3554, -81.5905, 'Disney Animal Kingdom, Lake Buena Vista, FL'],
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dlp', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA']
  ],
  'disney world': [
    ['wdw', 'Walt Disney World Resort', 'Orlando / Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
    ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
    ['ds', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL'],
    ['dhs', 'Disney’s Hollywood Studios', 'Hollywood Blvd, Lake Buena Vista, FL', 28.3575, -81.5583, 'Disney Hollywood Studios, Lake Buena Vista, FL'],
    ['dak', 'Disney’s Animal Kingdom', 'Osceola Pkwy, Lake Buena Vista, FL', 28.3554, -81.5905, 'Disney Animal Kingdom, Lake Buena Vista, FL']
  ],
  disneyworld: [
    ['wdw', 'Walt Disney World Resort', 'Orlando / Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
    ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
    ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
    ['ds', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL']
  ],
  disneyland: [
    ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
    ['dlp', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA'],
    ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA'],
    ['downtown-disney-ca', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA']
  ]
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Lot 2', 'Cal Poly Pomona Lot 2', 34.05945, -117.82192, 'University Dr, Pomona, CA'],
  ['cpp-lot-q', 'Lot Q', 'Cal Poly Pomona Lot Q', 34.05372, -117.81598, 'South Campus Dr, Pomona, CA'],
  ['cpp-ps-1', 'Parking Structure 1', 'Cal Poly Pomona Parking Structure 1', 34.05720, -117.82755, 'Kellogg Dr, Pomona, CA'],
  ['cpp-ps-2', 'Parking Structure 2', 'Cal Poly Pomona Parking Structure 2', 34.05495, -117.82470, 'Temple Ave, Pomona, CA'],
  ['cpp-lot-b', 'Lot B', 'Cal Poly Pomona Lot B', 34.06105, -117.82355, 'University Dr, Pomona, CA'],
  ['cpp-lot-c', 'Lot C', 'Cal Poly Pomona Lot C', 34.06155, -117.82050, 'University Dr, Pomona, CA'],
  ['cpp-lot-e', 'Lot E', 'Cal Poly Pomona Lot E', 34.05895, -117.81590, 'South Campus Dr, Pomona, CA'],
  ['cpp-lot-f', 'Lot F', 'Cal Poly Pomona Lot F', 34.05715, -117.81495, 'South Campus Dr, Pomona, CA'],
  ['cpp-lot-j', 'Lot J', 'Cal Poly Pomona Lot J', 34.05285, -117.82480, 'Temple Ave, Pomona, CA'],
  ['cpp-lot-m', 'Lot M', 'Cal Poly Pomona Lot M', 34.05215, -117.82060, 'Temple Ave, Pomona, CA']
];

const DISNEY_WORLD_PARKING = [
  ['wdw-ttc', 'Transportation and Ticket Center Parking', 'Magic Kingdom / TTC parking', 28.4054, -81.5794, 'World Dr, Lake Buena Vista, FL', 'Main parking area for Magic Kingdom access via monorail/ferry.'],
  ['wdw-magic-kingdom-heroes', 'Magic Kingdom Heroes Parking', 'Magic Kingdom parking zone', 28.4046, -81.5807, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near the Transportation and Ticket Center.'],
  ['wdw-magic-kingdom-villains', 'Magic Kingdom Villains Parking', 'Magic Kingdom parking zone', 28.4029, -81.5832, 'World Dr, Lake Buena Vista, FL', 'Named Magic Kingdom parking zone near the Transportation and Ticket Center.'],
  ['wdw-epcot', 'EPCOT Parking', 'Theme park parking lot', 28.3766, -81.5506, 'Epcot Center Dr, Lake Buena Vista, FL', 'Primary EPCOT guest parking area.'],
  ['wdw-hollywood-studios', 'Hollywood Studios Parking', 'Theme park parking lot', 28.3585, -81.5562, 'Osceola Pkwy / Buena Vista Dr, Lake Buena Vista, FL', 'Primary Hollywood Studios guest parking area.'],
  ['wdw-animal-kingdom', 'Animal Kingdom Parking', 'Theme park parking lot', 28.3568, -81.5907, 'Osceola Pkwy, Lake Buena Vista, FL', 'Primary Animal Kingdom guest parking area.'],
  ['wdw-disney-springs-orange', 'Disney Springs Orange Garage', 'Parking garage', 28.3701, -81.5199, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage near Town Center.'],
  ['wdw-disney-springs-lime', 'Disney Springs Lime Garage', 'Parking garage', 28.3712, -81.5161, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage near Marketplace.'],
  ['wdw-disney-springs-grapefruit', 'Disney Springs Grapefruit Garage', 'Parking garage', 28.3726, -81.5117, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage on the eastern side of Disney Springs.']
];

const DISNEYLAND_PARKING = [
  ['dl-mickey', 'Mickey & Friends Parking Structure', 'Parking structure', 33.8157, -117.9269, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-pixar', 'Pixar Pals Parking Structure', 'Parking structure', 33.8144, -117.9255, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure connected to Mickey & Friends.'],
  ['dl-toy-story', 'Toy Story Parking Area', 'Guest parking lot', 33.7969, -117.9142, 'Harbor Blvd, Anaheim, CA', 'Large Disneyland guest parking area with shuttle access.'],
  ['dl-simba', 'Simba Parking Lot', 'Downtown Disney parking lot', 33.8086, -117.9275, 'Disneyland Dr / Magic Way, Anaheim, CA', 'Parking for Downtown Disney area; verify current access rules.']
];

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function norm(value = '') { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function compact(value = '') { return norm(value).replace(/\s+/g, ''); }
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
function resolveAlias(q) { return aliases[norm(q)] || aliases[compact(q)] || q; }
function queryTokens(q) { return norm(q).split(' ').filter(Boolean); }
function relatedRows(q) {
  const n = norm(q);
  const c = compact(q);
  const rows = [];
  for (const [key, value] of Object.entries(RELATED_DESTINATIONS)) {
    const nk = norm(key);
    const ck = compact(key);
    if (n.includes(nk) || nk.includes(n) || c.includes(ck) || ck.includes(c) || (n.includes('disney') && nk.includes('disney'))) rows.push(...value);
  }
  return rows;
}
function curatedPlace(id, name, address, lat, lng, mapQuery) {
  return { id: `curated-${id}`, name: `${name} - ${address}`, shortName: name, address, lat, lng, type: 'curated', class: 'place', mapQuery, distanceFromAnchor: 0, curated: true };
}
function compactAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}
function cityState(address = {}) {
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [city, address.state].filter(Boolean).join(', ');
}
function baseName(name = '') { return clean(name.split(' - ')[0].split(',')[0]); }
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
function officialParkingName(tags = {}) { return clean(tags.name || tags.operator || tags.brand || tags.ref || tags.official_name || tags.alt_name || ''); }
function poiName(tags = {}) { return clean(tags.name || tags.brand || tags.operator || tags.shop || tags.amenity || tags.tourism || tags.leisure || ''); }
function isGenericQuery(q = '') {
  const x = norm(q);
  return ['restaurant', 'restaurants', 'food', 'coffee', 'pizza', 'burger', 'taco', 'gas', '711', '7 11', '7 eleven', '7 eleven'].some(t => x.includes(t));
}
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
  return { id: `place-${item.place_id || `${lat}-${lng}`}`, name, shortName: base, address, lat, lng, type: item.type, class: item.class, mapQuery: address ? `${base}, ${address}` : item.display_name || base, distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0 };
}
function scoreSuggestion(place, q, anchor) {
  const hay = norm(`${place.name} ${place.address} ${place.shortName || ''}`);
  const tokens = queryTokens(q);
  let score = 0;
  for (const token of tokens) {
    if (hay.includes(token)) score += 12;
    if (compact(hay).includes(token)) score += 8;
  }
  if (place.curated) score += 50;
  if (anchor && place.lat && place.lng) score -= Math.min(15, distanceMiles(anchor.lat, anchor.lng, place.lat, place.lng) / 3);
  return score;
}
async function nominatimSearch(query, lat, lng, limit = 10, bounded = false) {
  const params = new URLSearchParams({ format: 'json', limit: String(limit), addressdetails: '1', q: query });
  if (lat && lng && bounded) {
    params.set('viewbox', `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`);
    params.set('bounded', '1');
  }
  return nominatim(`https://nominatim.openstreetmap.org/search?${params}`);
}
async function localPoiSearch(q, lat, lng) {
  if (!lat || !lng) return [];
  const tokens = queryTokens(q).filter(t => t.length > 1);
  if (!tokens.length) return [];
  const regex = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const meters = isGenericQuery(q) ? 4500 : 9000;
  const query = `[out:json][timeout:22];(
    node["name"~"${regex}",i](around:${meters},${lat},${lng});
    way["name"~"${regex}",i](around:${meters},${lat},${lng});
    relation["name"~"${regex}",i](around:${meters},${lat},${lng});
  );out center tags 40;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink local POI search' }, body: query });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.elements || []).map((item) => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    const tags = item.tags || {};
    const name = poiName(tags);
    if (!itemLat || !itemLng || !name) return null;
    const street = tags['addr:street'] || '';
    const address = [tags['addr:housenumber'], street].filter(Boolean).join(' ');
    const city = tags['addr:city'] || tags['is_in:city'] || '';
    const displayAddress = [address, city, tags['addr:state']].filter(Boolean).join(', ') || (street ? street : 'Nearby place');
    return { id: `poi-${item.type}-${item.id}`, name: `${name} - ${displayAddress}`, shortName: name, address: displayAddress, lat: itemLat, lng: itemLng, type: tags.shop || tags.amenity || tags.tourism || tags.leisure || 'place', class: 'poi', mapQuery: `${name}, ${displayAddress}`, distanceFromAnchor: distanceMiles(lat, lng, itemLat, itemLng), localPoi: true };
  }).filter(Boolean);
}
async function geocode(query, lat, lng) {
  const anchor = lat && lng ? { lat, lng } : DEFAULT_CENTER;
  const suggestions = [];
  const related = relatedRows(query).map(([id, name, address, pLat, pLng, mapQuery]) => curatedPlace(id, name, address, pLat, pLng, mapQuery));
  suggestions.push(...related);
  const resolved = resolveAlias(query);
  const searches = [resolved];
  const n = norm(query);
  if (n.includes('disney') && !n.includes('world')) searches.push('Walt Disney World Resort Florida');
  if (n.includes('disney') && !n.includes('land')) searches.push('Disneyland Resort Anaheim California');
  if (!searches.includes(query)) searches.push(query);
  for (const term of [...new Set(searches)]) {
    try {
      const useBounds = Boolean(lat && lng && (isGenericQuery(query) || queryTokens(query).length <= 2));
      const rows = await nominatimSearch(term, lat, lng, 12, useBounds);
      suggestions.push(...rows.map(item => placeFromItem(item, anchor)));
    } catch {}
  }
  try { suggestions.push(...await localPoiSearch(query, lat, lng)); } catch {}
  const seen = new Set();
  const unique = suggestions.filter((item) => {
    const key = `${norm(item.shortName || item.name)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map(item => ({ ...item, matchScore: scoreSuggestion(item, query, anchor) }))
    .filter(item => item.curated || item.matchScore > 0 || !lat || !lng)
    .sort((a, b) => b.matchScore - a.matchScore || a.distanceFromAnchor - b.distanceFromAnchor)
    .slice(0, 14);
  if (!unique.length) throw new Error('No location found.');
  return { place: unique[0], suggestions: unique };
}
function isCpp(place, q = '') { return norm(`${place?.name || ''} ${q}`).includes('cal poly pomona'); }
function isDisneyWorld(place, q = '') {
  const x = norm(`${place?.name || ''} ${q}`);
  return x.includes('walt disney world') || x.includes('magic kingdom') || x.includes('epcot') || x.includes('disney springs') || x.includes('hollywood studios') || x.includes('animal kingdom') || (x.includes('disney') && x.includes('florida'));
}
function isDisneyland(place, q = '') {
  const x = norm(`${place?.name || ''} ${q}`);
  return x.includes('disneyland') || x.includes('disney california adventure') || (x.includes('disney') && x.includes('anaheim'));
}
function curatedLots(place, rows, maxMiles, source) {
  return rows.map(([id, shortName, area, lat, lng, address, reason]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name: shortName, fullName: shortName, address, area, bestLot: `${address} • ${area}`, distance, capacity: area.toLowerCase().includes('garage') || area.toLowerCase().includes('structure') ? 1200 : 600, price: 'Verify current pricing, permits, and access rules', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason, lat, lng, mapQuery: `${shortName}, ${address}`, kind: 'lot', source, accessibility: 'Accessibility likely, verify marked spaces/signage', priority: 0 };
  }).filter(item => item.distance <= maxMiles).sort((a, b) => a.distance - b.distance);
}
function curatedCpp(place, maxMiles) {
  return CPP_LOTS.map(([id, short, full, lat, lng, address]) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name: short, fullName: full, address, area: 'Campus parking', bestLot: `${address} • CPP permit/payment rules may apply`, distance, capacity: short.includes('Structure') ? 700 : 120, price: 'CPP permit or posted payment rules may apply', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: `${full}. ${address}. Verify current permit zone, entrance, and accessible-space signage.`, lat, lng, mapQuery: `${full}, ${address}`, kind: 'lot', source: 'ParkLink curated CPP data', accessibility: 'Accessibility not confirmed', priority: 0 };
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
  if (!response.ok) return { lots: [], streets: [] };
  const data = await response.json();
  const elements = data.elements || [];
  const pois = [];
  const roads = [];
  for (const item of elements) {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) continue;
    const tags = item.tags || {};
    const name = poiName(tags);
    if (name && tags.amenity !== 'parking') pois.push({ name, lat, lng });
    if (tags.highway && tags.name) roads.push({ name: tags.name, lat, lng, type: tags.highway, tags });
  }
  const nearest = (list, lat, lng, max = 0.35) => list.map(item => ({ ...item, distance: distanceMiles(lat, lng, item.lat, item.lng) })).filter(item => item.distance <= max).sort((a, b) => a.distance - b.distance)[0] || null;
  const seen = new Set();
  const rawLots = elements.filter(item => item.tags?.amenity === 'parking').map((item, index) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const tags = item.tags || {};
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > maxMiles) return null;
    const official = officialParkingName(tags);
    const nearestRoad = nearest(roads, lat, lng, 0.25);
    const street = tags['addr:street'] || nearestRoad?.name || '';
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
    const address = [[entry.tags['addr:housenumber'], entry.tags['addr:street']].filter(Boolean).join(' '), city].filter(Boolean).join(', ') || rev.address;
    const nearText = entry.near?.name ? `near ${entry.near.name}` : '';
    const cross = street ? `on ${street}` : city ? `in ${city}` : `near ${baseName(place.name)}`;
    const title = entry.official || (street ? `Parking near ${street}` : city ? `Parking in ${city}` : `Parking near ${baseName(place.name)}`);
    const mapQuery = entry.official ? `${entry.official}, ${address || city || baseName(place.name)}` : `parking near ${street || address || baseName(place.name)}`;
    const context = [address || cross, nearText].filter(Boolean).join(' • ');
    return { id: `${entry.item.type}-${entry.item.id}`, name: title, fullName: entry.official || title, address: address || cross, area: entry.tags.parking === 'multi-storey' ? 'Parking structure' : entry.tags.parking === 'underground' ? 'Underground parking' : 'Surface / mapped lot', bestLot: context || cross, distance: entry.distance, capacity: Number(entry.tags.capacity || (entry.tags.parking === 'multi-storey' ? 500 : 80)), price: entry.tags.fee === 'yes' ? 'Payment indicated' : entry.tags.fee === 'no' ? 'Marked free' : 'Fee unknown', walk: `${Math.max(1, Math.round(entry.distance * 18))} min walk`, reason: `${entry.official ? 'Named parking area' : 'Mapped parking area'} ${context || cross}. ${accessLabel(entry.tags)}. ${accessibility(entry.tags)}.`, lat: entry.lat, lng: entry.lng, mapQuery, kind: 'lot', source: 'OpenStreetMap + address lookup', accessibility: accessibility(entry.tags), priority: entry.official ? 0 : 2 };
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
    const title = `Street Parking - ${road.name}`;
    return { id: `street-${road.name}-${index}`, name: title, address: `${road.name} near ${baseName(place.name)}`, area: hasLane ? 'Mapped street parking' : 'Likely curb parking', bestLot: `${road.name} near ${baseName(place.name)} • verify signs/meters`, distance, capacity: 0, price: 'Check posted rules', walk: `${Math.max(1, Math.round(distance * 18))} min walk`, reason: hasLane ? `Parking-lane information is mapped on ${road.name}. Posted signs still control.` : `${road.name} is a nearby drivable street where curb parking may exist. Verify all posted restrictions.`, lat: road.lat, lng: road.lng, mapQuery: `${road.name} near ${baseName(place.name)}`, kind: 'street', source: hasLane ? 'OpenStreetMap parking-lane data' : 'Nearby street estimate', accessibility: 'Curb accessibility not confirmed', priority: hasLane ? 8 : 11 };
  }).filter(Boolean).sort((a, b) => a.distance - b.distance).slice(0, 8);
  return { lots, streets };
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
    if (lat && lng && (selectedName || !q || norm(q) === 'near me')) place = { name: selectedName || 'Your current location', address: '', lat, lng, mapQuery: selectedName || 'Your current location' };
    else place = (await geocode(q, lat, lng)).place;
    const context = await overpassContext(place, meters, maxMiles).catch(() => ({ lots: [], streets: [] }));
    const curated = [
      ...(isCpp(place, q) ? curatedCpp(place, maxMiles) : []),
      ...(isDisneyWorld(place, q) ? curatedLots(place, DISNEY_WORLD_PARKING, maxMiles, 'ParkLink curated Disney World data') : []),
      ...(isDisneyland(place, q) ? curatedLots(place, DISNEYLAND_PARKING, maxMiles, 'ParkLink curated Disneyland data') : [])
    ];
    const lots = [...curated, ...context.lots.filter(item => !curated.some(c => norm(c.name) === norm(item.name) || distanceMiles(c.lat, c.lng, item.lat, item.lng) < 0.05))]
      .sort((a, b) => (a.priority ?? 2) - (b.priority ?? 2) || a.distance - b.distance);
    return res.status(200).json({ place, suggestions: [], results: [...lots, ...context.streets], sections: { lots, street: context.streets }, radiusMinutes: minutes, radiusMiles: maxMiles, note: `Showing named, addressed, or context-built parking within about ${minutes} minutes walking.` });
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}
