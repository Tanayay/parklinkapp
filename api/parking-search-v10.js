const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406, label: 'Torrance, CA' };

const CATEGORY_TERMS = {
  taco: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle', 'taco'],
  tacos: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle', 'taco'],
  toy: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  coffee: ['starbucks', 'coffee', 'cafe', 'peets coffee'],
  pizza: ['pizza', 'pizzeria', 'dominos', 'pizza hut'],
  burger: ['in-n-out', 'burger', 'mcdonalds', 'burger king', 'five guys'],
  gas: ['gas station', 'chevron', 'shell', 'arco', 'mobil'],
  grocery: ['grocery store', 'supermarket', 'ralphs', 'vons', 'trader joes', 'whole foods', 'target', 'walmart'],
  topgolf: ['topgolf', 'top golf', 'golf driving range', 'golf entertainment'],
  golf: ['topgolf', 'golf driving range', 'golf course', 'golf entertainment'],
  school: ['college', 'university', 'campus'],
  schools: ['college', 'university', 'campus'],
  college: ['college', 'community college', 'university', 'campus'],
  colleges: ['college', 'community college', 'university', 'campus'],
  university: ['university', 'college', 'campus'],
  disney: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca', 'disney store', 'walt disney world resort florida', 'disney springs florida'],
  disneyland: ['disneyland resort anaheim ca', 'downtown disney district anaheim ca', 'disney california adventure anaheim ca'],
  disneyworld: ['walt disney world resort florida', 'magic kingdom park florida', 'epcot florida', 'disney springs florida']
};

const ALIASES = {
  cpp: 'Cal Poly Pomona, Pomona, CA',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, CA',
  'cal poly': 'Cal Poly Pomona, Pomona, CA',
  ucla: 'University of California Los Angeles, Los Angeles, CA',
  usc: 'University of Southern California, Los Angeles, CA',
  uci: 'University of California Irvine, Irvine, CA',
  ucsd: 'University of California San Diego, La Jolla, CA',
  ucsb: 'University of California Santa Barbara, Santa Barbara, CA',
  ucr: 'University of California Riverside, Riverside, CA',
  csulb: 'California State University Long Beach, Long Beach, CA',
  csuf: 'California State University Fullerton, Fullerton, CA',
  csudh: 'California State University Dominguez Hills, Carson, CA',
  sdsu: 'San Diego State University, San Diego, CA',
  disneyworld: 'Walt Disney World Resort, Lake Buena Vista, FL',
  'disney world': 'Walt Disney World Resort, Lake Buena Vista, FL',
  disneyland: 'Disneyland Resort, Anaheim, CA',
  'disney land': 'Disneyland Resort, Anaheim, CA',
  bisney: 'Disney',
  topgolf: 'Topgolf',
  'top golf': 'Topgolf',
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
  ],
  topgolf: [
    ['tg-el-segundo', 'Topgolf El Segundo', '400 S Pacific Coast Hwy, El Segundo, CA', 33.9156, -118.3951, 'Topgolf El Segundo, 400 S Pacific Coast Hwy, El Segundo, CA'],
    ['tg-montebello', 'Topgolf Montebello', 'Montebello, CA', 34.0207, -118.1110, 'Topgolf Montebello, CA'],
    ['tg-ontario', 'Topgolf Ontario', 'Ontario, CA', 34.0633, -117.6509, 'Topgolf Ontario, CA']
  ]
};

const CPP_LOTS = [
  ['cpp-lot-2', 'Cal Poly Pomona Lot 2', 'Campus parking lot', 34.05945, -117.82192, 'University Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-q', 'Cal Poly Pomona Lot Q', 'Campus parking lot', 34.05372, -117.81598, 'South Campus Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-m', 'Cal Poly Pomona Lot M', 'Campus parking lot', 34.05215, -117.8206, 'Temple Ave, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-b', 'Cal Poly Pomona Lot B', 'Campus parking lot', 34.06105, -117.82355, 'University Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-c', 'Cal Poly Pomona Lot C', 'Campus parking lot', 34.06155, -117.8205, 'University Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-e', 'Cal Poly Pomona Lot E', 'Campus parking lot', 34.05895, -117.8159, 'South Campus Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-f', 'Cal Poly Pomona Lot F', 'Campus parking lot', 34.05715, -117.81495, 'South Campus Dr, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-lot-j', 'Cal Poly Pomona Lot J', 'Campus parking lot', 34.05285, -117.8248, 'Temple Ave, Pomona, CA', 'Campus lot. CPP permit/payment rules may apply.'],
  ['cpp-ps1', 'Cal Poly Pomona Parking Structure 1', 'Campus parking structure', 34.0572, -117.82755, 'Kellogg Dr, Pomona, CA', 'Campus structure. CPP permit/payment rules may apply.'],
  ['cpp-ps2', 'Cal Poly Pomona Parking Structure 2', 'Campus parking structure', 34.05495, -117.8247, 'Temple Ave, Pomona, CA', 'Campus structure. CPP permit/payment rules may apply.']
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

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function norm(value = '') { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function compact(value = '') { return norm(value).replace(/\s+/g, ''); }
function toRad(value) { return (value * Math.PI) / 180; }
function distanceMiles(lat1, lng1, lat2, lng2) {
  const r = 3958.8;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function walkText(distance) { return `${Math.max(1, Math.round(distance * 18))} min walk`; }
function milesFor(minutes) { return Math.max(0.25, Number(minutes || 10) / 18); }
function metersFor(minutes) { return Math.round(milesFor(minutes) * 1609.344); }
function availabilityFor(id, distance, priority) {
  const seed = String(id).split('').reduce((total, char) => total + char.charCodeAt(0), 0);
  const raw = 78 - Math.round(distance * 12) - (priority || 0) * 3 + (seed % 13);
  return Math.max(18, Math.min(92, raw));
}
function homeText(req) { return clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', ')); }
function homeAnchor(req) {
  const lat = req.query.homeLat ? Number(req.query.homeLat) : null;
  const lng = req.query.homeLng ? Number(req.query.homeLng) : null;
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
function explicitLocation(query = '') {
  const text = norm(query);
  return text.includes(' near ') || text.includes(' in ') || text.includes(' anaheim') || text.includes('orlando') || text.includes('florida') || text.includes('california') || text.includes('disney world') || text.includes('disneyland') || /,\s*[a-z]{2}\b/i.test(query);
}
function resolveAlias(query = '') { return ALIASES[norm(query)] || ALIASES[compact(query)] || query; }
function searchTerms(query = '') {
  const text = norm(query);
  const terms = new Set([resolveAlias(query), query]);
  for (const [key, list] of Object.entries(CATEGORY_TERMS)) {
    if (text.includes(key) || key.includes(text)) list.slice(0, 6).forEach((term) => terms.add(term));
  }
  return [...terms].filter(Boolean).slice(0, 8);
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
function escapeRegex(value = '') { return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function poiName(tags = {}) { return clean(tags.name || tags.brand || tags.operator || ''); }
function displayAddressFromTags(tags = {}, fallback = 'near saved search area') {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const city = tags['addr:city'] || tags['is_in:city'] || '';
  const state = tags['addr:state'] || '';
  return [street, city, state].filter(Boolean).join(', ') || tags['addr:street'] || fallback;
}
function categoryRegex(query = '') {
  const rawTerms = searchTerms(query).concat(norm(query).split(' '));
  const terms = [...new Set(rawTerms.map((term) => norm(term)).filter((term) => term.length > 1))].slice(0, 12);
  return terms.map(escapeRegex).join('|') || escapeRegex(norm(query));
}
function relevanceScore(place, query, anchor) {
  const hay = norm(`${place.shortName || ''} ${place.name || ''} ${place.address || ''} ${place.type || ''}`);
  const tokens = norm(query).split(' ').filter(Boolean);
  let score = place.curated ? 100 : place.localPoi ? 25 : 0;
  tokens.forEach((token) => { if (hay.includes(token)) score += 15; });
  if (anchor && place.lat && place.lng) score -= Math.min(35, distanceMiles(anchor.lat, anchor.lng, place.lat, place.lng) * 2);
  return score;
}
function isCampusQuery(value = '') {
  const text = norm(value);
  return text.includes('college') || text.includes('university') || text.includes('campus') || text.includes('cal poly') || text.includes('cal state') || text.includes('csu') || text.includes('uc ') || text.includes('ucla') || text.includes('usc') || text.includes('community college') || text.includes('school');
}
async function jsonFetch(url, timeoutMs = 4200) {
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
async function postText(url, body, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: 'POST', signal: controller.signal, headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink v10 search' }, body });
    if (!response.ok) return { elements: [] };
    return response.json();
  } catch {
    return { elements: [] };
  } finally {
    clearTimeout(timer);
  }
}
async function geocodeText(text) {
  const value = clean(text);
  if (!value) return null;
  const params = new URLSearchParams({ format: 'json', limit: '1', addressdetails: '1', countrycodes: 'us', q: value });
  const data = await jsonFetch(`https://nominatim.openstreetmap.org/search?${params}`, 3200);
  const first = data[0];
  if (!first) return null;
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}
async function getAnchor(req) { return homeAnchor(req) || await geocodeText(homeText(req)) || DEFAULT_CENTER; }
async function nominatimSearch(term, req, anchor, limit = 5) {
  const area = homeText(req);
  const q = area && !explicitLocation(term) ? `${term} near ${area}` : term;
  const params = new URLSearchParams({ format: 'json', limit: String(limit), addressdetails: '1', countrycodes: 'us', q });
  if (anchor && !explicitLocation(term)) {
    params.set('viewbox', `${anchor.lng - 0.7},${anchor.lat + 0.7},${anchor.lng + 0.7},${anchor.lat - 0.7}`);
    params.set('bounded', '1');
  }
  return jsonFetch(`https://nominatim.openstreetmap.org/search?${params}`, 3600);
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const title = titleFrom(item);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !title || isGenericName(title)) return null;
  const address = shortAddress(item.address || {}) || (item.display_name || '').split(',').slice(1, 4).map(clean).filter(Boolean).join(', ') || 'Address not listed';
  return { id: `place-${item.place_id || `${lat}-${lng}`}`, name: `${title} - ${address}`, shortName: title, address, lat, lng, type: item.type || 'place', class: item.class || 'place', mapQuery: `${title}, ${address}`, distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0 };
}
function placeFromPoi(element, anchor, fallbackLabel) {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;
  const tags = element.tags || {};
  const name = poiName(tags);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !name || isGenericName(name)) return null;
  const address = displayAddressFromTags(tags, fallbackLabel);
  return { id: `poi-${element.type}-${element.id}`, name: `${name} - ${address}`, shortName: name, address, lat, lng, type: tags.shop || tags.amenity || tags.tourism || tags.leisure || tags.sport || 'place', class: 'poi', mapQuery: `${name}, ${address}`, distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0, localPoi: true };
}
async function localPoiSearch(query, anchor, label) {
  if (!anchor) return [];
  const regex = categoryRegex(query);
  const body = `[out:json][timeout:16];(
    node["name"~"${regex}",i](around:30000,${anchor.lat},${anchor.lng});
    way["name"~"${regex}",i](around:30000,${anchor.lat},${anchor.lng});
    relation["name"~"${regex}",i](around:30000,${anchor.lat},${anchor.lng});
    node["brand"~"${regex}",i](around:30000,${anchor.lat},${anchor.lng});
    way["brand"~"${regex}",i](around:30000,${anchor.lat},${anchor.lng});
    node["amenity"~"restaurant|fast_food|cafe|college|university|school",i](around:12000,${anchor.lat},${anchor.lng});
    way["amenity"~"restaurant|fast_food|cafe|college|university|school",i](around:12000,${anchor.lat},${anchor.lng});
    relation["amenity"~"college|university|school",i](around:30000,${anchor.lat},${anchor.lng});
    node["shop"~"toys|department_store|supermarket|convenience|mall",i](around:9000,${anchor.lat},${anchor.lng});
    way["shop"~"toys|department_store|supermarket|convenience|mall",i](around:9000,${anchor.lat},${anchor.lng});
    node["sport"="golf"](around:30000,${anchor.lat},${anchor.lng});
    way["sport"="golf"](around:30000,${anchor.lat},${anchor.lng});
    node["leisure"~"golf_course|sports_centre",i](around:30000,${anchor.lat},${anchor.lng});
    way["leisure"~"golf_course|sports_centre",i](around:30000,${anchor.lat},${anchor.lng});
  );out center tags 140;`;
  const data = await postText('https://overpass-api.de/api/interpreter', body, 5600);
  return (data?.elements || []).map((element) => placeFromPoi(element, anchor, label)).filter(Boolean);
}
function curatedDestinationRows(query, req, anchor) {
  const text = norm(query);
  let rows = [];
  if (text.includes('topgolf') || text.includes('top golf') || text.includes('golf')) rows = CURATED_DESTINATIONS.topgolf;
  else if (text.includes('disneyland') || text.includes('anaheim')) rows = CURATED_DESTINATIONS.disneyland;
  else if (text.includes('disneyworld') || text.includes('disney world') || text.includes('orlando') || text.includes('florida')) rows = CURATED_DESTINATIONS.disneyworld;
  else if (text.includes('disney') || text.includes('bisney')) rows = CURATED_DESTINATIONS.disney;
  return rows.map(([id, name, address, lat, lng, mapQuery]) => ({ id: `curated-${id}`, name: `${name} - ${address}`, shortName: name, address, lat, lng, type: 'curated', class: 'destination', mapQuery, distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0, curated: true }));
}
async function placesMode(req, res) {
  const q = clean(req.query.q || '');
  if (q.length < 2) return res.status(200).json({ suggestions: [], place: null });
  const anchor = await getAnchor(req);
  const areaLabel = homeText(req) || 'saved search area';
  const terms = searchTerms(q).slice(0, 4);
  const [nominatimRows, poiRows] = await Promise.all([
    Promise.all(terms.map((term) => nominatimSearch(term, req, anchor, 4))).then((parts) => parts.flat()).catch(() => []),
    localPoiSearch(q, anchor, areaLabel).catch(() => [])
  ]);
  const seen = new Set();
  const suggestions = [...curatedDestinationRows(q, req, anchor), ...poiRows, ...nominatimRows.map((item) => placeFromItem(item, anchor)).filter(Boolean)]
    .map((item) => ({ ...item, matchScore: relevanceScore(item, q, anchor) }))
    .filter((item) => item.curated || item.localPoi || item.matchScore > -20)
    .filter((item) => {
      const key = `${norm(item.shortName)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.matchScore - a.matchScore || a.distanceFromAnchor - b.distanceFromAnchor)
    .slice(0, 12);
  return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'v10-campus-local', anchor, areaLabel });
}
function basePlaceName(name = '') { return clean(name.split(' - ')[0].split(',')[0]); }
function addressFromName(name = '') { return clean(name.split(' - ').slice(1).join(' - ')); }
function accessLabel(tags = {}) {
  if (tags.access === 'private') return 'Private access — verify permission';
  if (tags.access === 'customers') return 'Customer/shared parking — verify signs';
  if (tags.access === 'permit' || tags.access === 'permissive') return 'Permit/controlled parking — verify permit rules';
  return 'Public/unspecified access — check posted signs';
}
function accessibility(tags = {}) {
  if (tags.wheelchair === 'yes' || tags['capacity:disabled'] || tags.disabled_spaces) return 'Accessible parking indicated';
  if (tags.wheelchair === 'limited') return 'Limited accessibility indicated';
  if (tags.wheelchair === 'no') return 'Not wheelchair accessible';
  return 'Accessibility not confirmed';
}
function parkingArea(tags = {}, campus = false) {
  if (tags.parking === 'multi-storey') return campus ? 'Campus parking structure' : 'Parking structure';
  if (tags.parking === 'underground') return 'Underground parking';
  if (tags.parking === 'surface') return campus ? 'Campus surface lot' : 'Surface parking lot';
  return campus ? 'Campus mapped parking lot' : 'Mapped parking lot';
}
function isMajorDestination(place, query = '') {
  const text = norm(`${place?.name || ''} ${query}`);
  return text.includes('disney') || text.includes('stadium') || text.includes('airport') || text.includes('arena') || text.includes('theme park') || text.includes('topgolf') || text.includes('top golf');
}
function isCampusDestination(place, query = '') {
  const text = norm(`${place?.name || ''} ${place?.address || ''} ${query}`);
  return isCampusQuery(text) || text.includes('cal poly pomona') || text.includes('ucla') || text.includes('usc') || text.includes('csulb') || text.includes('csuf') || text.includes('sdsu');
}
function campusLotTitle(tags = {}, street = '') {
  const official = clean(tags.name || tags.official_name || tags.alt_name || tags.ref || '');
  if (official && !isGenericName(official)) {
    if (/^(lot|parking|structure|garage|ps\s*\d|p\d|[a-z]\d?|\d+[a-z]?)\b/i.test(official)) return official.match(/^lot\b/i) ? official : official;
    if (/^[a-z0-9-]{1,5}$/i.test(official)) return `Lot ${official.toUpperCase()}`;
    return official;
  }
  if (tags.ref && /^[a-z0-9-]{1,6}$/i.test(tags.ref)) return `Lot ${String(tags.ref).toUpperCase()}`;
  if (street) return `Unnamed mapped campus lot near ${street}`;
  return 'Unnamed mapped campus lot';
}
function curatedLotsFor(place, query = '') {
  const text = norm(`${place?.name || ''} ${query}`);
  let rows = [];
  let source = '';
  if (text.includes('cal poly pomona')) { rows = CPP_LOTS; source = 'ParkLink curated CPP data'; }
  else if (text.includes('disneyland') || text.includes('anaheim')) { rows = DISNEYLAND_LOTS; source = 'ParkLink curated Disneyland data'; }
  else if (text.includes('disney') || text.includes('magic kingdom') || text.includes('epcot') || text.includes('lake buena vista')) { rows = DISNEYWORLD_LOTS; source = 'ParkLink curated Disney World data'; }
  else if (text.includes('topgolf') || text.includes('top golf')) {
    rows = [[`topgolf-main-${Math.round(place.lat * 1000)}`, `Main Lot — ${basePlaceName(place.name) || 'Topgolf'}`, 'Customer parking lot', place.lat, place.lng, place.address || addressFromName(place.name) || 'Address not listed', 'Primary customer parking for Topgolf. Verify posted signs, hours, and event restrictions.']];
    source = 'ParkLink curated Topgolf estimate';
  }
  return rows.map(([id, name, area, lat, lng, address, reason], index) => {
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    return { id, name, fullName: name, address, area, bestLot: `${address} • ${area}`, distance, capacity: area.toLowerCase().includes('garage') || area.toLowerCase().includes('structure') ? 1200 : 120, price: 'Verify current pricing, permits, and access rules', walk: walkText(distance), reason, lat, lng, mapQuery: `${name}, ${address}`, kind: 'lot', source, accessibility: 'Accessibility likely, verify marked spaces/signage', priority: index, availability: availabilityFor(id, distance, index) };
  }).sort((a, b) => a.distance - b.distance);
}
function mainLotFor(place, query = '') {
  if (isMajorDestination(place, query) || isCampusDestination(place, query)) return null;
  const name = basePlaceName(place.name || query);
  const address = place.address || addressFromName(place.name) || 'Address not listed';
  if (!name || isGenericName(name)) return null;
  return { id: `main-${Math.round(place.lat * 10000)}-${Math.round(place.lng * 10000)}`, name: `Main Lot — ${name}`, fullName: `Main Lot — ${name}`, address, area: 'Likely customer/shared lot', bestLot: `${address} • verify signs/customer access`, distance: 0.03, capacity: 20, price: 'Customer/shared parking rules may apply', walk: '1-2 min walk', reason: `Best first check for ${name}. This is an estimated customer/shared lot near the destination; verify posted signs, towing rules, and access limits.`, lat: place.lat, lng: place.lng, mapQuery: `${name} parking, ${address}`, kind: 'lot', source: 'ParkLink destination-lot estimate', accessibility: 'Accessibility not confirmed', priority: 1, availability: availabilityFor(`main-${name}`, 0.03, 1) };
}
async function overpassParking(place, radiusMeters, radiusMiles, campus = false) {
  const searchMeters = campus ? Math.max(radiusMeters, 3200) : radiusMeters;
  const searchMiles = campus ? Math.max(radiusMiles, 2.0) : radiusMiles;
  const body = `[out:json][timeout:20];(
    node["amenity"="parking"](around:${searchMeters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${searchMeters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${searchMeters},${place.lat},${place.lng});
    way["highway"]["name"](around:${searchMeters},${place.lat},${place.lng});
  );out center tags 180;`;
  const data = await postText('https://overpass-api.de/api/interpreter', body, 7200);
  const elements = data?.elements || [];
  const roads = elements.filter((e) => e.tags?.highway && e.tags?.name).map((e) => ({ name: e.tags.name, lat: e.center?.lat, lng: e.center?.lon, tags: e.tags })).filter((e) => e.lat && e.lng);
  function nearestRoad(lat, lng) {
    return roads.map((road) => ({ ...road, distance: distanceMiles(lat, lng, road.lat, road.lng) })).filter((road) => road.distance <= 0.35).sort((a, b) => a.distance - b.distance)[0] || null;
  }
  const seen = new Set();
  const lots = elements.filter((e) => e.tags?.amenity === 'parking').map((item) => {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    if (!lat || !lng) return null;
    const distance = distanceMiles(place.lat, place.lng, lat, lng);
    if (distance > searchMiles) return null;
    const tags = item.tags || {};
    const road = nearestRoad(lat, lng);
    const street = clean(tags['addr:street'] || road?.name || '');
    const official = clean(tags.name || tags.official_name || tags.alt_name || tags.ref || '');
    const title = campus ? campusLotTitle(tags, street) : official && !isGenericName(official) ? official : street ? `Parking near ${street}` : `Parking near ${basePlaceName(place.name)}`;
    const key = `${title}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
    if (seen.has(key)) return null;
    seen.add(key);
    const address = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ') || street || place.address || addressFromName(place.name) || 'Address not listed';
    const namedCampus = campus && !title.toLowerCase().startsWith('unnamed');
    const priority = campus ? (namedCampus ? 1 : 7) : (official ? 3 : 4);
    return { id: `${item.type}-${item.id}`, name: title, fullName: official || title, address, area: parkingArea(tags, campus), bestLot: `${address} • ${accessLabel(tags)}`, distance, capacity: Number(tags.capacity || (tags.parking === 'multi-storey' ? 400 : 70)), price: tags.fee === 'yes' ? 'Payment indicated' : tags.fee === 'no' ? 'Marked free' : campus ? 'Permit/payment rules may apply' : 'Fee unknown', walk: walkText(distance), reason: campus ? `${namedCampus ? 'Named/ref campus parking area' : 'Mapped campus parking without an official name/ref in map data'} near ${basePlaceName(place.name)}. ${accessLabel(tags)}. ${accessibility(tags)}.` : `${official ? 'Named mapped parking area' : 'Mapped parking area'} near ${basePlaceName(place.name)}. ${accessLabel(tags)}. ${accessibility(tags)}.`, lat, lng, mapQuery: `${title}, ${address}`, kind: 'lot', source: campus ? 'OpenStreetMap campus parking data' : 'OpenStreetMap parking data', accessibility: accessibility(tags), priority, availability: availabilityFor(`${item.type}-${item.id}`, distance, priority) };
  }).filter(Boolean).sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5) || a.distance - b.distance).slice(0, campus ? 18 : 10);
  const street = campus ? [] : roads.map((road, index) => {
    const tags = road.tags || {};
    const hasVerifiedParking = Boolean(tags['parking:lane:both'] || tags['parking:lane:left'] || tags['parking:lane:right'] || tags['parking:both'] || tags['parking:left'] || tags['parking:right']);
    if (!hasVerifiedParking) return null;
    const distance = distanceMiles(place.lat, place.lng, road.lat, road.lng);
    if (distance > radiusMiles) return null;
    return { id: `street-${index}-${road.name}`, name: `Street Parking — ${road.name}`, fullName: `Verified mapped street parking on ${road.name}`, address: road.name, area: 'Verified mapped street parking', bestLot: `${road.name} • verify signs/meters/sweeping`, distance, capacity: 0, price: 'Check posted rules', walk: walkText(distance), reason: `Shown because parking-lane/curb-parking tags are mapped on ${road.name}. Posted signs and meters still control.`, lat: road.lat, lng: road.lng, mapQuery: `${road.name} near ${basePlaceName(place.name)}`, kind: 'street', source: 'OpenStreetMap verified parking-lane tags', accessibility: 'Curb accessibility not confirmed', priority: 9, availability: availabilityFor(`street-${road.name}`, distance, 9) };
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
    if (Number.isFinite(lat) && Number.isFinite(lng) && selectedName) {
      place = { name: selectedName, shortName: basePlaceName(selectedName), address: addressFromName(selectedName), lat, lng, mapQuery: selectedName };
    } else {
      const anchor = await getAnchor(req);
      const rows = await nominatimSearch(q, req, anchor, 1);
      place = rows[0] ? placeFromItem(rows[0], anchor) : curatedDestinationRows(q, req, anchor)[0] || null;
    }
    if (!place) return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: 'Destination not found.' });
    const campus = isCampusDestination(place, q);
    const minutes = Math.min(60, Math.max(5, Number(req.query.radiusMinutes || (campus ? 20 : 10))));
    const radiusMiles = campus ? Math.max(milesFor(minutes), 2.0) : milesFor(minutes);
    const radiusMeters = metersFor(campus ? Math.max(minutes, 20) : minutes);
    const [mapped, curated] = await Promise.all([
      overpassParking(place, radiusMeters, radiusMiles, campus).catch(() => ({ lots: [], street: [] })),
      Promise.resolve(curatedLotsFor(place, q))
    ]);
    const main = mainLotFor(place, q);
    const lots = [main, ...curated, ...mapped.lots]
      .filter(Boolean)
      .filter((item, index, arr) => arr.findIndex((other) => norm(other.name) === norm(item.name) && Math.abs(other.distance - item.distance) < 0.08) === index)
      .sort((a, b) => (a.priority ?? 5) - (b.priority ?? 5) || a.distance - b.distance)
      .slice(0, campus ? 18 : 12);
    const street = mapped.street;
    const results = [...lots, ...street];
    const info = campus
      ? `Campus parking mode: showing named/ref campus lots and structures first. Unnamed mapped lots are lower priority because the map does not provide official lot names.`
      : street.length ? `Showing named/estimated lots and verified mapped street parking within about ${minutes} minutes walking.` : `No verified mapped street-parking tags found here. Showing destination/customer lots and mapped lots first; verify all signs and access rules.`;
    return res.status(200).json({ place, suggestions: [], results, sections: { lots, street }, radiusMinutes: minutes, radiusMiles, info, note: campus ? 'Campus restrictions are estimates from map tags. Verify official school permits, visitor payment, event restrictions, and signs.' : 'Availability is estimated until ParkLink sensors or live parking feeds are connected.' });
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], results: [], sections: { lots: [], street: [] }, warning: error.message || 'Parking search failed.' });
  }
}