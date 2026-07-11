const DEFAULT_CENTER = { lat: 39.8283, lng: -98.5795 };

const categoryTerms = {
  taco: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  tacos: ['taco bell', 'del taco', 'taqueria', 'mexican restaurant', 'chipotle'],
  toy: ['toy store', 'target', 'walmart', 'lego store', 'build a bear', 'gamestop'],
  toys: ['toy store', 'target', 'walmart', 'lego store', 'build a bear', 'gamestop'],
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
function baseName(item = {}) {
  return clean(item.name || item.address?.shop || item.address?.amenity || item.display_name?.split(',')[0] || 'Place');
}
function placeFromItem(item, anchor) {
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  const address = compactAddress(item.address || {});
  const title = baseName(item);
  return {
    id: `fast-${item.place_id || `${lat}-${lng}`}`,
    name: address ? `${title} - ${address}` : title,
    shortName: title,
    address: address || item.display_name?.split(',').slice(1, 4).join(',').trim() || 'Address not listed',
    lat,
    lng,
    type: item.type,
    class: item.class,
    mapQuery: address ? `${title}, ${address}` : item.display_name || title,
    distanceFromAnchor: anchor ? distanceMiles(anchor.lat, anchor.lng, lat, lng) : 0
  };
}
function termsFor(q) {
  const n = norm(q);
  const terms = new Set([q]);
  for (const [key, list] of Object.entries(categoryTerms)) {
    if (n.includes(key) || key.includes(n)) list.forEach((term) => terms.add(term));
  }
  return [...terms].filter(Boolean).slice(0, 5);
}
async function nominatimSearch(term, anchorText, lat, lng) {
  const q = anchorText ? `${term} near ${anchorText}` : term;
  const params = new URLSearchParams({ format: 'json', limit: '5', addressdetails: '1', countrycodes: 'us', q });
  if (lat && lng) {
    params.set('viewbox', `${lng - 0.45},${lat + 0.45},${lng + 0.45},${lat - 0.45}`);
    params.set('bounded', '1');
  }
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, { headers: { Accept: 'application/json', 'User-Agent': 'ParkLink fast place search' } });
  if (!response.ok) return [];
  return response.json();
}

export default async function handler(req, res) {
  try {
    const q = clean(req.query.q || '');
    if (q.length < 2) return res.status(200).json({ suggestions: [], place: null });
    const homeLat = req.query.homeLat ? Number(req.query.homeLat) : null;
    const homeLng = req.query.homeLng ? Number(req.query.homeLng) : null;
    const homeText = clean(req.query.homeText || [req.query.homeAddress, req.query.homeCity, req.query.homeState].filter(Boolean).join(', '));
    const anchor = homeLat && homeLng ? { lat: homeLat, lng: homeLng } : DEFAULT_CENTER;
    const rows = [];
    for (const term of termsFor(q)) {
      const data = await nominatimSearch(term, homeText, homeLat, homeLng);
      rows.push(...data);
      if (rows.length >= 14) break;
    }
    const seen = new Set();
    const suggestions = rows
      .map((item) => placeFromItem(item, anchor))
      .filter((item) => item.shortName && !['place', 'shop', 'restaurant', 'store', 'toy store', 'taco shop'].includes(norm(item.shortName)))
      .filter((item) => {
        const key = `${norm(item.shortName)}-${Math.round(item.lat * 10000)}-${Math.round(item.lng * 10000)}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.distanceFromAnchor - b.distanceFromAnchor)
      .slice(0, 10);
    return res.status(200).json({ suggestions, place: suggestions[0] || null, mode: 'fast' });
  } catch (error) {
    return res.status(200).json({ suggestions: [], place: null, warning: error.message || 'Fast search failed.' });
  }
}
