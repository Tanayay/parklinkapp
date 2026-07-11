const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

const expansions = {
  taco: ['taco', 'taco bell', 'del taco', 'taqueria'],
  tacos: ['taco', 'taco bell', 'del taco', 'taqueria'],
  toy: ['toy store', 'target toys', 'walmart toys'],
  toys: ['toy store', 'target toys', 'walmart toys'],
  coffee: ['coffee', 'starbucks', 'cafe'],
  pizza: ['pizza', 'pizzeria', 'pizza hut'],
  burger: ['burger', 'in-n-out burger', 'five guys'],
  gas: ['gas station', 'chevron', 'shell'],
  disney: ['disneyland resort anaheim california', 'walt disney world resort florida', 'disney springs'],
  disneyworld: ['walt disney world resort florida', 'magic kingdom park', 'epcot'],
  disneyland: ['disneyland resort anaheim california', 'disney california adventure', 'downtown disney district']
};

function clean(value = '') { return String(value).trim().replace(/\s+/g, ' '); }
function norm(value = '') { return clean(value).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function toRad(value) { return (value * Math.PI) / 180; }
function distanceMiles(a, b, c, d) {
  const r = 3958.8;
  const x = toRad(c - a);
  const y = toRad(d - b);
  const z = Math.sin(x / 2) ** 2 + Math.cos(toRad(a)) * Math.cos(toRad(c)) * Math.sin(y / 2) ** 2;
  return r * 2 * Math.atan2(Math.sqrt(z), Math.sqrt(1 - z));
}
function compactAddress(address = {}, display = '') {
  const street = [address.house_number, address.road || address.pedestrian || address.footway].filter(Boolean).join(' ');
  const city = address.city || address.town || address.village || address.suburb || address.county;
  const built = [street, city, address.state].filter(Boolean).join(', ');
  if (built) return built;
  const pieces = clean(display).split(',').map((x) => x.trim()).filter(Boolean);
  return pieces.slice(1, 4).join(', ') || 'Address not listed';
}
function titleFrom(item = {}) {
  const address = item.address || {};
  return clean(item.name || address.shop || address.amenity || address.tourism || address.leisure || address.building || item.display_name?.split(',')[0] || '');
}
function isGenericName(name = '') {
  const x = norm(name);
  return !x || ['place', 'shop', 'store', 'restaurant', 'food', 'business', 'building', 'retail'].includes(x);
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const shortName = titleFrom(item);
  const address = compactAddress(item.address || {}, item.display_name || '');
  return {
    id: `stable-${item.place_id || `${lat}-${lng}`}`,
    name: `${shortName} - ${address}`,
    shortName,
    address,
    lat,
    lng,
    type: item.type,
    class: item.class,
    mapQuery: `${shortName}, ${address}`,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}
function termsFor(query) {
  const q = clean(query);
  const x = norm(q);
  const terms = new Set([q]);
  for (const [key, list] of Object.entries(expansions)) {
    if (x === key || x.includes(key) || key.includes(x)) {
      list.slice(0, 4).forEach((term) => terms.add(term));
      break;
    }
  }
  return [...terms].filter(Boolean).slice(0, 4);
}
async function fetchJsonWithTimeout(url, ms = 2800) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'ParkLink stable place autocomplete' }
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}
async function nominatimSearch(term, contextText, lat, lng) {
  const query = contextText ? `${term} near ${contextText}` : term;
  const params = new URLSearchParams({ format: 'json', limit: '8', addressdetails: '1', countrycodes: 'us', q: query });
  if (lat && lng) {
    params.set('viewbox', `${lng - 0.45},${lat + 0.45},${lng + 0.45},${lat - 0.45}`);
    params.set('bounded', '1');
  }
  return fetchJsonWithTimeout(`https://nominatim.openstreetmap.org/search?${params.toString()}`);
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    if (q.length < 2) return res.status(200).json({ suggestions: [], place: null, mode: 'stable' });

    const homeLat = req.query.homeLat ? Number(req.query.homeLat) : null;
    const homeLng = req.query.homeLng ? Number(req.query.homeLng) : null;
    const homeText = clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
    const anchor = homeLat && homeLng ? { lat: homeLat, lng: homeLng } : DEFAULT_CENTER;

    const rows = [];
    const terms = termsFor(q);
    for (const term of terms) {
      const found = await nominatimSearch(term, homeText, homeLat, homeLng);
      rows.push(...found);
      if (rows.length >= 12) break;
    }

    if (!rows.length && homeText) rows.push(...await nominatimSearch(q, '', null, null));

    const seen = new Set();
    const suggestions = rows
      .map((item) => placeFromItem(item, anchor))
      .filter((item) => !isGenericName(item.shortName))
      .filter((item) => {
        const key = `${norm(item.shortName)}-${norm(item.address)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor)
      .slice(0, 10);

    return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'stable' });
  } catch (error) {
    return res.status(200).json({ suggestions: [], place: null, warning: error.message || 'Stable search failed.' });
  }
}
