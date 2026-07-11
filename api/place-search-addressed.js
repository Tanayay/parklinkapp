const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

const categoryTerms = {
  taco: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  tacos: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  toy: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'target toys', 'walmart toys', 'lego store', 'build a bear', 'gamestop'],
  coffee: ['coffee', 'starbucks', 'cafe'],
  pizza: ['pizza', 'dominos', 'pizza hut', 'pizzeria'],
  burger: ['burger', 'mcdonalds', 'burger king', 'in-n-out', 'wendys'],
  burgers: ['burger', 'mcdonalds', 'burger king', 'in-n-out', 'wendys'],
  gas: ['gas station', 'chevron', 'shell', 'arco', 'mobil'],
  disney: ['walt disney world resort florida', 'disneyland resort anaheim california', 'magic kingdom park', 'epcot', 'disney springs'],
  disneyworld: ['walt disney world resort florida', 'magic kingdom park', 'epcot', 'disney springs'],
  disneyland: ['disneyland resort anaheim california', 'disney california adventure', 'downtown disney district']
};

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function norm(value = '') { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function toRad(v) { return (v * Math.PI) / 180; }
function distanceMiles(a, b, c, d) {
  const r = 3958.8;
  const x = toRad(c - a);
  const y = toRad(d - b);
  const z = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z));
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
function titleFromItem(item = {}) {
  const address = item.address || {};
  return clean(item.name || address.shop || address.amenity || address.restaurant || address.fast_food || item.display_name?.split(',')[0] || 'Place');
}
function fallbackAddressFromDisplay(item = {}) {
  return clean((item.display_name || '').split(',').slice(1, 5).join(', '));
}
function termsFor(q) {
  const n = norm(q);
  const terms = new Set([q]);
  for (const [key, list] of Object.entries(categoryTerms)) {
    if (n.includes(key) || key.includes(n)) list.slice(0, 4).forEach((term) => terms.add(term));
  }
  return [...terms].filter(Boolean).slice(0, 5);
}
async function nominatim(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': 'ParkLink addressed place search' } });
  if (!response.ok) return null;
  return response.json();
}
async function reverseAddress(lat, lng) {
  try {
    const p = new URLSearchParams({ format: 'json', addressdetails: '1', lat: String(lat), lon: String(lng), zoom: '18' });
    const data = await nominatim(`https://nominatim.openstreetmap.org/reverse?${p}`);
    if (!data) return '';
    return compactAddress(data.address || {}) || fallbackAddressFromDisplay(data) || cityState(data.address || '');
  } catch {
    return '';
  }
}
async function nominatimSearch(term, anchorText, lat, lng) {
  const query = anchorText ? `${term} near ${anchorText}` : term;
  const params = new URLSearchParams({ format: 'json', limit: '5', addressdetails: '1', countrycodes: 'us', q: query });
  if (lat && lng) {
    params.set('viewbox', `${lng - 0.35},${lat + 0.35},${lng + 0.35},${lat - 0.35}`);
    params.set('bounded', '1');
  }
  return (await nominatim(`https://nominatim.openstreetmap.org/search?${params}`)) || [];
}
async function overpassPoiSearch(q, lat, lng) {
  if (!lat || !lng) return [];
  const tokens = termsFor(q).flatMap((term) => norm(term).split(' ')).filter((x) => x.length > 2);
  const unique = [...new Set(tokens)].slice(0, 8);
  if (!unique.length) return [];
  const regex = unique.map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const query = `[out:json][timeout:16];(
    node["name"~"${regex}",i](around:4500,${lat},${lng});
    way["name"~"${regex}",i](around:4500,${lat},${lng});
    relation["name"~"${regex}",i](around:4500,${lat},${lng});
  );out center tags 24;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8', 'User-Agent': 'ParkLink nearby POI search' }, body: query });
  if (!response.ok) return [];
  const data = await response.json();
  return (data.elements || []).map((item) => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    const tags = item.tags || {};
    const name = clean(tags.name || tags.brand || tags.operator || '');
    if (!itemLat || !itemLng || !name) return null;
    const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
    const city = tags['addr:city'] || '';
    const state = tags['addr:state'] || '';
    return { rawId: `${item.type}-${item.id}`, title: name, lat: itemLat, lng: itemLng, address: [street, city, state].filter(Boolean).join(', '), source: 'nearby-map' };
  }).filter(Boolean);
}
async function enrich(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lng ?? item.lon);
  const title = clean(item.title || titleFromItem(item));
  let address = clean(item.address || compactAddress(item.addressdetails || {}) || compactAddress(item.address || {}) || fallbackAddressFromDisplay(item));
  if (!address || address === title) address = await reverseAddress(lat, lng);
  if (!address) address = 'Street address not listed — tap to open map';
  return {
    id: `addr-${item.rawId || item.place_id || `${lat}-${lng}`}`,
    name: `${title} - ${address}`,
    shortName: title,
    address,
    lat,
    lng,
    type: item.type || item.class || item.source || 'place',
    class: item.class || 'place',
    mapQuery: `${title}, ${address}`,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    if (q.length < 3) return res.status(200).json({ suggestions: [], place: null });
    const homeLat = req.query.homeLat ? Number(req.query.homeLat) : null;
    const homeLng = req.query.homeLng ? Number(req.query.homeLng) : null;
    const homeText = clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
    const anchor = homeLat && homeLng ? { lat: homeLat, lng: homeLng } : DEFAULT_CENTER;
    const rows = [];
    const terms = termsFor(q);
    const primary = terms.slice(0, 3);
    for (const term of primary) rows.push(...await nominatimSearch(term, homeText, homeLat, homeLng));
    rows.push(...await overpassPoiSearch(q, homeLat, homeLng));
    const seen = new Set();
    const candidates = rows.filter(Boolean).filter((item) => {
      const lat = Number(item.lat);
      const lng = Number(item.lng ?? item.lon);
      const title = clean(item.title || titleFromItem(item));
      if (!lat || !lng || !title) return false;
      if (['place', 'shop', 'store', 'restaurant', 'taco shop', 'toy store'].includes(norm(title))) return false;
      const key = `${norm(title)}-${Math.round(lat * 10000)}-${Math.round(lng * 10000)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
    const enriched = await Promise.all(candidates.map((item) => enrich(item, anchor)));
    const suggestions = enriched.sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor).slice(0, 8);
    return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'addressed-fast' });
  } catch (error) {
    return res.status(200).json({ suggestions: [], place: null, warning: error.message || 'Addressed place search failed.' });
  }
}