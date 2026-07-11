const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406 };

const EXPANSIONS = [
  {
    keys: ['taco', 'tacos', 'taqueria', 'mexican food'],
    terms: ['taco', 'taco bell', 'del taco', 'chipotle', 'taqueria', 'mexican restaurant', 'burrito', 'fast food tacos'],
    overpass: `(
      node["amenity"~"restaurant|fast_food"]["cuisine"~"mexican|taco|tex-mex|burrito",i](around:RADIUS,LAT,LNG);
      way["amenity"~"restaurant|fast_food"]["cuisine"~"mexican|taco|tex-mex|burrito",i](around:RADIUS,LAT,LNG);
      relation["amenity"~"restaurant|fast_food"]["cuisine"~"mexican|taco|tex-mex|burrito",i](around:RADIUS,LAT,LNG);
      node["name"~"taco|taqueria|del taco|taco bell|chipotle|burrito",i](around:RADIUS,LAT,LNG);
      way["name"~"taco|taqueria|del taco|taco bell|chipotle|burrito",i](around:RADIUS,LAT,LNG);
      relation["name"~"taco|taqueria|del taco|taco bell|chipotle|burrito",i](around:RADIUS,LAT,LNG);
    )`
  },
  {
    keys: ['toy', 'toys', 'toy store', 'toystore'],
    terms: ['toy store', 'toys', 'toys r us', 'lego store', 'build-a-bear', 'gamestop', 'target toys', 'walmart toys', 'mall toy store', 'disney store'],
    overpass: `(
      node["shop"="toys"](around:RADIUS,LAT,LNG);
      way["shop"="toys"](around:RADIUS,LAT,LNG);
      relation["shop"="toys"](around:RADIUS,LAT,LNG);
      node["name"~"toy|toys|lego|build-a-bear|gamestop|game stop|target|walmart|disney store",i](around:RADIUS,LAT,LNG);
      way["name"~"toy|toys|lego|build-a-bear|gamestop|game stop|target|walmart|disney store",i](around:RADIUS,LAT,LNG);
      relation["name"~"toy|toys|lego|build-a-bear|gamestop|game stop|target|walmart|disney store",i](around:RADIUS,LAT,LNG);
    )`
  },
  {
    keys: ['disney', 'disneyworld', 'disney world', 'walt disney world'],
    terms: ['walt disney world resort florida', 'magic kingdom park', 'epcot', 'disney springs', 'disney hollywood studios', 'disney animal kingdom'],
    curated: [
      ['wdw', 'Walt Disney World Resort', 'Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
      ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
      ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
      ['springs', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL'],
      ['hs', 'Disney’s Hollywood Studios', 'Hollywood Blvd, Lake Buena Vista, FL', 28.3575, -81.5583, 'Disney Hollywood Studios, Lake Buena Vista, FL'],
      ['ak', 'Disney’s Animal Kingdom', 'Osceola Pkwy, Lake Buena Vista, FL', 28.3554, -81.5905, 'Disney Animal Kingdom, Lake Buena Vista, FL']
    ]
  },
  {
    keys: ['disneyland', 'disney land'],
    terms: ['disneyland resort anaheim', 'disneyland park anaheim', 'disney california adventure', 'downtown disney anaheim'],
    curated: [
      ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
      ['dlp', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA'],
      ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA'],
      ['dd', 'Downtown Disney District', 'Disneyland Dr, Anaheim, CA', 33.8099, -117.9231, 'Downtown Disney District, Anaheim, CA']
    ]
  }
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
function addressFromTags(tags = {}) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  const city = tags['addr:city'] || tags['is_in:city'] || tags['addr:suburb'] || tags['addr:county'];
  const state = tags['addr:state'];
  return [street, city, state].filter(Boolean).join(', ');
}
function compactAddress(address = {}) {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  return [street, city, address.state].filter(Boolean).join(', ');
}
function businessName(tags = {}) {
  return clean(tags.name || tags.brand || tags.operator || tags['official_name'] || tags['alt_name'] || '');
}
function queryProfile(q) {
  const n = norm(q);
  const c = compact(q);
  return EXPANSIONS.find(group => group.keys.some(key => n.includes(norm(key)) || norm(key).includes(n) || c.includes(compact(key)) || compact(key).includes(c)));
}
function expansionTerms(q) {
  const profile = queryProfile(q);
  const terms = [q];
  if (profile?.terms) terms.push(...profile.terms);
  return [...new Set(terms.map(clean).filter(Boolean))].slice(0, 10);
}
async function fetchJson(url, options = {}) {
  const response = await fetch(url, { ...options, headers: { Accept: 'application/json', 'User-Agent': 'ParkLink specific place search', ...(options.headers || {}) } });
  if (!response.ok) return null;
  return response.json();
}
async function reverseAddress(lat, lng) {
  const params = new URLSearchParams({ format: 'json', addressdetails: '1', lat: String(lat), lon: String(lng), zoom: '18' });
  const data = await fetchJson(`https://nominatim.openstreetmap.org/reverse?${params}`);
  if (!data) return '';
  return compactAddress(data.address || {}) || data.display_name || '';
}
function makeSuggestion({ id, title, address, lat, lng, type = 'place', source = 'Search', mapQuery }) {
  const safeTitle = clean(title);
  const safeAddress = clean(address);
  if (!safeTitle || /^taco shop$|^toy store$|^restaurant$|^shop$|^store$|^place$/i.test(safeTitle)) return null;
  return {
    id: id || `${safeTitle}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`,
    name: safeAddress ? `${safeTitle} - ${safeAddress}` : safeTitle,
    shortName: safeTitle,
    address: safeAddress || 'Address not listed — tap for map location',
    lat: Number(lat),
    lng: Number(lng),
    type,
    class: 'poi',
    mapQuery: mapQuery || (safeAddress ? `${safeTitle}, ${safeAddress}` : safeTitle),
    source
  };
}
async function nominatimSearch(q, anchor) {
  const suggestions = [];
  for (const term of expansionTerms(q)) {
    const params = new URLSearchParams({ format: 'json', limit: '10', addressdetails: '1', q: term });
    if (anchor.localBias) {
      params.set('viewbox', `${anchor.lng - 0.45},${anchor.lat + 0.45},${anchor.lng + 0.45},${anchor.lat - 0.45}`);
      params.set('bounded', '1');
    }
    const data = await fetchJson(`https://nominatim.openstreetmap.org/search?${params}`);
    for (const item of data || []) {
      const lat = Number(item.lat);
      const lng = Number(item.lon);
      const address = compactAddress(item.address || {});
      const title = clean(item.name || item.display_name?.split(',')[0] || item.address?.shop || item.address?.amenity || '');
      const suggestion = makeSuggestion({ id: `nom-${item.place_id}`, title, address, lat, lng, type: item.type, source: 'Nominatim', mapQuery: address ? `${title}, ${address}` : item.display_name });
      if (suggestion) suggestions.push(suggestion);
    }
  }
  return suggestions;
}
async function overpassSpecificSearch(q, anchor) {
  if (!anchor.lat || !anchor.lng) return [];
  const profile = queryProfile(q);
  const escaped = norm(q).split(' ').filter(t => t.length > 1).map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const radius = profile ? 6500 : 4500;
  let blocks = '';
  if (profile?.overpass) blocks += profile.overpass.replaceAll('RADIUS', String(radius)).replaceAll('LAT', String(anchor.lat)).replaceAll('LNG', String(anchor.lng));
  if (escaped) {
    blocks += `(
      node["name"~"${escaped}",i](around:${radius},${anchor.lat},${anchor.lng});
      way["name"~"${escaped}",i](around:${radius},${anchor.lat},${anchor.lng});
      relation["name"~"${escaped}",i](around:${radius},${anchor.lat},${anchor.lng});
    )`;
  }
  if (!blocks) return [];
  const query = `[out:json][timeout:25];(${blocks});out center tags 80;`;
  const data = await fetchJson('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: query });
  const rows = [];
  for (const item of data?.elements || []) {
    const lat = item.lat ?? item.center?.lat;
    const lng = item.lon ?? item.center?.lon;
    const tags = item.tags || {};
    const title = businessName(tags);
    if (!lat || !lng || !title) continue;
    let address = addressFromTags(tags);
    if (!address) address = await reverseAddress(lat, lng);
    const suggestion = makeSuggestion({ id: `osm-${item.type}-${item.id}`, title, address, lat, lng, type: tags.shop || tags.amenity || tags.tourism || tags.leisure || 'place', source: 'OpenStreetMap', mapQuery: `${title}, ${address || `${lat},${lng}`}` });
    if (suggestion) rows.push(suggestion);
    if (rows.length >= 18) break;
  }
  return rows;
}
function curatedSearch(q) {
  const profile = queryProfile(q);
  return (profile?.curated || []).map(([id, title, address, lat, lng, mapQuery]) => makeSuggestion({ id: `curated-${id}`, title, address, lat, lng, type: 'curated', source: 'ParkLink curated', mapQuery })).filter(Boolean);
}
function score(item, q, anchor) {
  const hay = norm(`${item.shortName} ${item.name} ${item.address}`);
  let s = item.source === 'ParkLink curated' ? 80 : item.source === 'OpenStreetMap' ? 35 : 20;
  for (const token of norm(q).split(' ').filter(Boolean)) {
    if (hay.includes(token)) s += 12;
    if (compact(hay).includes(token)) s += 8;
  }
  const profile = queryProfile(q);
  if (profile) {
    for (const term of profile.terms || []) {
      const t = norm(term).split(' ')[0];
      if (t && hay.includes(t)) s += 5;
    }
  }
  if (anchor.lat && anchor.lng && item.lat && item.lng) s -= Math.min(25, distanceMiles(anchor.lat, anchor.lng, item.lat, item.lng) / 2);
  return s;
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    if (!q) return res.status(400).json({ error: 'Search query required.' });
    const anchor = { lat: lat || DEFAULT_CENTER.lat, lng: lng || DEFAULT_CENTER.lng, localBias: Boolean(lat && lng) };
    const [curated, osm, nom] = await Promise.all([
      Promise.resolve(curatedSearch(q)),
      overpassSpecificSearch(q, anchor).catch(() => []),
      nominatimSearch(q, anchor).catch(() => [])
    ]);
    const seen = new Set();
    const suggestions = [...curated, ...osm, ...nom]
      .filter(Boolean)
      .map(item => ({ ...item, distanceFromAnchor: distanceMiles(anchor.lat, anchor.lng, item.lat, item.lng), matchScore: score(item, q, anchor) }))
      .filter(item => item.shortName && item.lat && item.lng)
      .filter((item) => {
        const key = `${compact(item.shortName)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => b.matchScore - a.matchScore || a.distanceFromAnchor - b.distanceFromAnchor)
      .slice(0, 16);
    return res.status(200).json({ place: suggestions[0] || null, suggestions, mode: 'specific-place-search' });
  } catch (error) {
    return res.status(200).json({ place: null, suggestions: [], warning: error.message || 'Place search failed.' });
  }
}
