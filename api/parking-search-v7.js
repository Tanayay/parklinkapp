const DEFAULT_CENTER = { lat: 33.8358, lng: -118.3406, label: 'Torrance, CA' };

const aliases = {
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  csudh: 'California State University Dominguez Hills, Carson, California',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven',
  '7 eleven': '7-Eleven',
  disneyworld: 'Walt Disney World Resort, Florida',
  'disney world': 'Walt Disney World Resort, Florida',
  disneyland: 'Disneyland Resort, Anaheim, California',
  'disney land': 'Disneyland Resort, Anaheim, California'
};

const CATEGORY_EXPANSIONS = [
  { keys: ['taco', 'tacos'], terms: ['taco', 'Taco Bell', 'Del Taco', 'taqueria', 'Mexican restaurant', 'Chipotle', 'burrito'] },
  { keys: ['toy', 'toys', 'toy store', 'toystore'], terms: ['toy store', 'Toys R Us', 'Target', 'Walmart', 'LEGO Store', 'Build-A-Bear Workshop', 'GameStop', 'Disney Store', 'mall toy store'] },
  { keys: ['food', 'restaurant', 'restaurants'], terms: ['restaurant', 'food', 'cafe', 'fast food', 'diner'] },
  { keys: ['coffee'], terms: ['coffee', 'Starbucks', 'Dunkin', 'Peets Coffee', 'cafe'] },
  { keys: ['burger', 'burgers'], terms: ['burger', 'McDonalds', 'Burger King', 'In-N-Out Burger', 'Five Guys', 'Wendys', 'Shake Shack'] },
  { keys: ['pizza'], terms: ['pizza', 'Pizza Hut', 'Dominos', 'Papa Johns', 'Little Caesars', 'pizzeria'] },
  { keys: ['gas', 'gas station'], terms: ['gas station', 'Chevron', 'Shell', 'Mobil', '76', 'Arco', 'Costco Gasoline'] },
  { keys: ['grocery', 'groceries'], terms: ['grocery store', 'supermarket', 'Ralphs', 'Vons', 'Trader Joes', 'Whole Foods', 'Target', 'Walmart'] },
  { keys: ['mall', 'shopping'], terms: ['shopping mall', 'shopping center', 'department store', 'Target', 'Macy’s', 'Nordstrom'] }
];

const GENERIC_NAMES = new Set(['taco shop', 'toy store', 'restaurant', 'restaurants', 'shop', 'store', 'place', 'food', 'mexican restaurant', 'fast food tacos', 'mall toy store', 'parking lot', 'mapped parking lot']);

const DISNEY_PLACES = [
  ['wdw', 'Walt Disney World Resort', 'Orlando / Lake Buena Vista, FL', 28.3772, -81.5707, 'Walt Disney World Resort, Lake Buena Vista, FL'],
  ['mk', 'Magic Kingdom Park', 'World Dr, Lake Buena Vista, FL', 28.4177, -81.5812, 'Magic Kingdom Park, Lake Buena Vista, FL'],
  ['epcot', 'EPCOT', 'Epcot Center Dr, Lake Buena Vista, FL', 28.3747, -81.5494, 'EPCOT, Lake Buena Vista, FL'],
  ['springs', 'Disney Springs', 'Buena Vista Dr, Lake Buena Vista, FL', 28.3702, -81.5190, 'Disney Springs, Lake Buena Vista, FL'],
  ['hollywood', 'Disney’s Hollywood Studios', 'Hollywood Blvd, Lake Buena Vista, FL', 28.3575, -81.5583, 'Disney Hollywood Studios, Lake Buena Vista, FL'],
  ['animal', 'Disney’s Animal Kingdom', 'Osceola Pkwy, Lake Buena Vista, FL', 28.3554, -81.5905, 'Disney Animal Kingdom, Lake Buena Vista, FL'],
  ['dlr', 'Disneyland Resort', 'Anaheim, CA', 33.8121, -117.9189, 'Disneyland Resort, Anaheim, CA'],
  ['dlp', 'Disneyland Park', 'Disneyland Dr, Anaheim, CA', 33.8121, -117.9190, 'Disneyland Park, Anaheim, CA'],
  ['dca', 'Disney California Adventure Park', 'Disneyland Dr, Anaheim, CA', 33.8059, -117.9193, 'Disney California Adventure, Anaheim, CA']
];

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
  ['wdw-ttc', 'Transportation and Ticket Center Parking', 'Magic Kingdom / TTC parking', 28.4054, -81.5794, 'World Dr, Lake Buena Vista, FL', 'Main parking for Magic Kingdom access via monorail/ferry.'],
  ['wdw-epcot', 'EPCOT Parking', 'Theme park parking lot', 28.3766, -81.5506, 'Epcot Center Dr, Lake Buena Vista, FL', 'Primary EPCOT guest parking area.'],
  ['wdw-hollywood', 'Hollywood Studios Parking', 'Theme park parking lot', 28.3585, -81.5562, 'Osceola Pkwy / Buena Vista Dr, Lake Buena Vista, FL', 'Primary Hollywood Studios guest parking area.'],
  ['wdw-animal', 'Animal Kingdom Parking', 'Theme park parking lot', 28.3568, -81.5907, 'Osceola Pkwy, Lake Buena Vista, FL', 'Primary Animal Kingdom guest parking area.'],
  ['wdw-orange', 'Disney Springs Orange Garage', 'Parking garage', 28.3701, -81.5199, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage.'],
  ['wdw-lime', 'Disney Springs Lime Garage', 'Parking garage', 28.3712, -81.5161, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage.'],
  ['wdw-grapefruit', 'Disney Springs Grapefruit Garage', 'Parking garage', 28.3726, -81.5117, 'Buena Vista Dr, Lake Buena Vista, FL', 'Named Disney Springs parking garage.']
];
const DISNEYLAND_PARKING = [
  ['dl-mickey', 'Mickey & Friends Parking Structure', 'Parking structure', 33.8157, -117.9269, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-pixar', 'Pixar Pals Parking Structure', 'Parking structure', 33.8144, -117.9255, 'Disneyland Dr, Anaheim, CA', 'Major Disneyland Resort parking structure.'],
  ['dl-toy-story', 'Toy Story Parking Area', 'Guest parking lot', 33.7969, -117.9142, 'Harbor Blvd, Anaheim, CA', 'Large Disneyland guest parking area with shuttle access.'],
  ['dl-simba', 'Simba Parking Lot', 'Downtown Disney parking lot', 33.8086, -117.9275, 'Disneyland Dr / Magic Way, Anaheim, CA', 'Downtown Disney parking; verify current rules.']
];

function clean(v = '') { return String(v).trim().replace(/\s+/g, ' '); }
function norm(v = '') { return clean(v).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
function compact(v = '') { return norm(v).replace(/\s+/g, ''); }
function toRad(v) { return v * Math.PI / 180; }
function distanceMiles(a,b,c,d){ const r=3958.8,x=toRad(c-a),y=toRad(d-b); const z=Math.sin(x/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(y/2)**2; return r*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z)); }
function radiusMiles(minutes){ return Math.max(0.2, Number(minutes || 10) / 18); }
function radiusMeters(minutes){ return Math.round(radiusMiles(minutes) * 1609.344); }
function resolveAlias(q){ return aliases[norm(q)] || aliases[compact(q)] || q; }
function tokens(q){ return norm(q).split(' ').filter(Boolean); }
function compactAddress(a={}){ const street=[a.house_number,a.road||a.pedestrian||a.footway].filter(Boolean).join(' '); const city=a.city||a.town||a.village||a.suburb||a.county; return [street,city,a.state].filter(Boolean).join(', '); }
function cityState(a={}){ const city=a.city||a.town||a.village||a.suburb||a.county; return [city,a.state].filter(Boolean).join(', '); }
function baseName(name=''){ return clean(name.split(' - ')[0].split(',')[0]); }
function accessLabel(t={}){ if(t.access==='private')return 'Private access — verify permission'; if(t.access==='customers')return 'Customer parking — verify with business'; if(t.access==='permit')return 'Permit parking — verify permit rules'; return 'Public/unspecified access — check signs'; }
function accessibility(t={}){ if(t.wheelchair==='yes'||t['capacity:disabled']||t.disabled_spaces)return 'Accessible parking indicated'; if(t.wheelchair==='limited')return 'Limited accessibility indicated'; if(t.wheelchair==='no')return 'Not wheelchair accessible'; return 'Accessibility not confirmed'; }
function officialParkingName(t={}){ return clean(t.name||t.operator||t.brand||t.ref||t.official_name||t.alt_name||''); }
function poiName(t={}){ return clean(t.name||t.brand||t.operator||''); }
function isGenericName(name=''){ return GENERIC_NAMES.has(norm(name)); }
function isCategory(q=''){ const x=norm(q); return CATEGORY_EXPANSIONS.some(g=>g.keys.some(k=>x.includes(k)||k.includes(x))) || x.length <= 12; }
function expansionTerms(q=''){
  const x=norm(q); const out=new Set([q, resolveAlias(q)]);
  for(const g of CATEGORY_EXPANSIONS) if(g.keys.some(k=>x.includes(k)||k.includes(x))) g.terms.forEach(t=>out.add(t));
  if(x.includes('disney')) ['Walt Disney World Resort Florida','Disneyland Resort Anaheim California','Magic Kingdom Park','EPCOT','Disney Springs'].forEach(t=>out.add(t));
  return [...out].filter(Boolean).slice(0,14);
}
function curatedPlace(id,name,address,lat,lng,mapQuery,anchor){ return { id:`curated-${id}`, name:`${name} - ${address}`, shortName:name, address, lat, lng, type:'curated', class:'place', mapQuery, distanceFromAnchor:anchor?distanceMiles(anchor.lat,anchor.lng,lat,lng):0, curated:true }; }
function disneyPlaceRows(q,anchor){ const x=norm(q); if(!x.includes('disney')&&!x.includes('magic kingdom')&&!x.includes('epcot')) return []; return DISNEY_PLACES.map(([id,n,a,lat,lng,m])=>curatedPlace(id,n,a,lat,lng,m,anchor)); }
async function nominatim(url){ const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'ParkLink search'}}); if(!r.ok) throw new Error('Location search failed.'); return r.json(); }
async function reverse(lat,lng){ try{ const p=new URLSearchParams({format:'json',addressdetails:'1',lat:String(lat),lon:String(lng),zoom:'18'}); const d=await nominatim(`https://nominatim.openstreetmap.org/reverse?${p}`); return { address: compactAddress(d.address||{}), city: cityState(d.address||{}), road: d.address?.road||d.address?.pedestrian||d.address?.footway||'', display:d.display_name||'' }; }catch{return {address:'',city:'',road:'',display:''};} }
function placeFromItem(item,anchor){ const lat=Number(item.lat),lng=Number(item.lon); const addr=compactAddress(item.address||{}); const short=clean(item.name||item.display_name?.split(',')[0]||item.address?.shop||item.address?.amenity||''); if(!short || isGenericName(short)) return null; return { id:`place-${item.place_id||`${lat}-${lng}`}`, name:`${short} - ${addr||item.display_name||'Address not listed'}`, shortName:short, address:addr||item.display_name||'', lat,lng,type:item.type,class:item.class,mapQuery:addr?`${short}, ${addr}`:`${short}, ${item.display_name||''}`,distanceFromAnchor:anchor?distanceMiles(anchor.lat,anchor.lng,lat,lng):0 }; }
async function geocodeRows(term,anchor,bounded=false){ const p=new URLSearchParams({format:'json',limit:'10',addressdetails:'1',q:term}); if(anchor&&bounded){ p.set('viewbox',`${anchor.lng-.45},${anchor.lat+.45},${anchor.lng+.45},${anchor.lat-.45}`); p.set('bounded','1'); } const data=await nominatim(`https://nominatim.openstreetmap.org/search?${p}`); return data.map(x=>placeFromItem(x,anchor)).filter(Boolean); }
async function resolveHome(req){ const homeLat=req.query.homeLat?Number(req.query.homeLat):null, homeLng=req.query.homeLng?Number(req.query.homeLng):null; const text=clean(req.query.homeAddress||req.query.homeText||[req.query.homeCity,req.query.homeState].filter(Boolean).join(', ')); if(homeLat&&homeLng) return { lat:homeLat, lng:homeLng, label:text||'Saved address' }; if(text){ try{ const rows=await geocodeRows(text,null,false); if(rows[0]) return { lat:rows[0].lat,lng:rows[0].lng,label:rows[0].address||text }; }catch{} } return null; }
function score(p,q,anchor){ const hay=norm(`${p.shortName||''} ${p.name||''} ${p.address||''}`); let s=p.curated?50:0; for(const t of tokens(q)){ if(hay.includes(t)) s+=14; if(compact(hay).includes(t)) s+=8; } if(anchor&&p.lat&&p.lng) s-=Math.min(20,distanceMiles(anchor.lat,anchor.lng,p.lat,p.lng)/2); return s; }
async function localPoiSearch(q,anchor){ if(!anchor) return []; const searchTerms=expansionTerms(q).concat(tokens(q)).map(norm).filter(t=>t.length>1&&!GENERIC_NAMES.has(t)); const regex=[...new Set(searchTerms)].slice(0,18).map(t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|'); if(!regex) return []; const meters=isCategory(q)?7000:10000; const query=`[out:json][timeout:25];(node["name"~"${regex}",i](around:${meters},${anchor.lat},${anchor.lng});way["name"~"${regex}",i](around:${meters},${anchor.lat},${anchor.lng});relation["name"~"${regex}",i](around:${meters},${anchor.lat},${anchor.lng}););out center tags 60;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','User-Agent':'ParkLink POI search'},body:query}); if(!r.ok) return []; const data=await r.json(); const out=[];
  for(const item of data.elements||[]){ const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon,t=item.tags||{},name=poiName(t); if(!lat||!lng||!name||isGenericName(name)) continue; const d=distanceMiles(anchor.lat,anchor.lng,lat,lng); if(d>9) continue; let address=[[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' '),t['addr:city'],t['addr:state']].filter(Boolean).join(', '); if(!address){ const rev=await reverse(lat,lng); address=rev.address||rev.city||'Address not listed'; } out.push({id:`poi-${item.type}-${item.id}`,name:`${name} - ${address}`,shortName:name,address,lat,lng,type:t.shop||t.amenity||t.tourism||t.leisure||'place',class:'poi',mapQuery:`${name}, ${address}`,distanceFromAnchor:d,localPoi:true}); if(out.length>=16) break; }
  return out;
}
async function placeSearch(q,req){ const home=await resolveHome(req); const lat=req.query.lat?Number(req.query.lat):null, lng=req.query.lng?Number(req.query.lng):null; const anchor=home || (lat&&lng?{lat,lng,label:'Current location'}:DEFAULT_CENTER); const suggestions=[]; suggestions.push(...disneyPlaceRows(q,anchor)); try{ suggestions.push(...await localPoiSearch(q,anchor)); }catch{}
  const terms=expansionTerms(q); const homeText=anchor?.label||'';
  for(const term of terms){ try{ if(homeText && isCategory(q)) suggestions.push(...await geocodeRows(`${term} near ${homeText}`,anchor,false)); suggestions.push(...await geocodeRows(term,anchor,Boolean(anchor&&isCategory(q)&&home))); }catch{} }
  const seen=new Set(); const unique=suggestions.filter(p=>p&&p.shortName&&!isGenericName(p.shortName)).map(p=>({ ...p, matchScore:score(p,q,anchor) })).filter(p=>p.curated||p.localPoi||p.matchScore>0||!isCategory(q)).sort((a,b)=>b.matchScore-a.matchScore||a.distanceFromAnchor-b.distanceFromAnchor).filter(p=>{ const key=`${norm(p.shortName)}-${Math.round(p.lat*10000)}-${Math.round(p.lng*10000)}`; if(seen.has(key))return false; seen.add(key); return true; }).slice(0,20);
  if(!unique.length) throw new Error('No specific places found. Try adding city/state or set your address.'); return { place:unique[0], suggestions:unique, homeContext:home||null };
}
function isCpp(place,q=''){ return norm(`${place?.name||''} ${q}`).includes('cal poly pomona'); }
function isDisneyWorld(place,q=''){ const x=norm(`${place?.name||''} ${q}`); return x.includes('walt disney world')||x.includes('magic kingdom')||x.includes('epcot')||x.includes('disney springs')||x.includes('hollywood studios')||x.includes('animal kingdom')||(x.includes('disney')&&x.includes('florida')); }
function isDisneyland(place,q=''){ const x=norm(`${place?.name||''} ${q}`); return x.includes('disneyland')||x.includes('disney california adventure')||(x.includes('disney')&&x.includes('anaheim')); }
function curatedLots(place,rows,maxMiles,source){ return rows.map(([id,name,area,lat,lng,address,reason])=>{ const d=distanceMiles(place.lat,place.lng,lat,lng); return {id,name,fullName:name,address,area,bestLot:`${address} • ${area}`,distance:d,capacity:area.toLowerCase().includes('garage')||area.toLowerCase().includes('structure')?1200:600,price:'Verify current pricing, permits, and access rules',walk:`${Math.max(1,Math.round(d*18))} min walk`,reason,lat,lng,mapQuery:`${name}, ${address}`,kind:'lot',source,accessibility:'Accessibility likely; verify marked spaces/signage',priority:0}; }).filter(x=>x.distance<=maxMiles).sort((a,b)=>a.distance-b.distance); }
function curatedCpp(place,maxMiles){ return CPP_LOTS.map(([id,short,full,lat,lng,address])=>{ const d=distanceMiles(place.lat,place.lng,lat,lng); return {id,name:short,fullName:full,address,area:'Campus parking',bestLot:`${address} • CPP permit/payment rules may apply`,distance:d,capacity:short.includes('Structure')?700:120,price:'CPP permit or posted payment rules may apply',walk:`${Math.max(1,Math.round(d*18))} min walk`,reason:`${full}. ${address}. Verify permit zone, entrance, and accessible-space signage.`,lat,lng,mapQuery:`${full}, ${address}`,kind:'lot',source:'ParkLink curated CPP data',accessibility:'Accessibility not confirmed',priority:0}; }).filter(x=>x.distance<=maxMiles).sort((a,b)=>a.distance-b.distance); }
async function parkingContext(place,meters,maxMiles){ const query=`[out:json][timeout:25];(node["amenity"="parking"](around:${meters},${place.lat},${place.lng});way["amenity"="parking"](around:${meters},${place.lat},${place.lng});relation["amenity"="parking"](around:${meters},${place.lat},${place.lng});way["highway"]["name"](around:${meters},${place.lat},${place.lng});node["name"](around:${meters},${place.lat},${place.lng}););out center tags 120;`; const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','User-Agent':'ParkLink parking search'},body:query}); if(!r.ok)return {lots:[],street:[]}; const data=await r.json(); const elements=data.elements||[]; const pois=[],roads=[]; for(const item of elements){const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon,t=item.tags||{}; if(!lat||!lng)continue; const n=poiName(t); if(n&&!t.amenity?.includes?.('parking'))pois.push({name:n,lat,lng}); if(t.highway&&t.name)roads.push({name:t.name,lat,lng,type:t.highway,tags:t});} const nearest=(list,lat,lng,max=.35)=>list.map(x=>({...x,distance:distanceMiles(lat,lng,x.lat,x.lng)})).filter(x=>x.distance<=max).sort((a,b)=>a.distance-b.distance)[0]||null; const seen=new Set(); const raw=elements.filter(x=>x.tags?.amenity==='parking').map((item,i)=>{const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon,t=item.tags||{}; if(!lat||!lng)return null; const d=distanceMiles(place.lat,place.lng,lat,lng); if(d>maxMiles)return null; const official=officialParkingName(t); const road=nearest(roads,lat,lng,.25)?.name||t['addr:street']||''; const near=nearest(pois,lat,lng,.22); const key=`${official||road||i}-${Math.round(lat*10000)}-${Math.round(lng*10000)}`; if(seen.has(key))return null; seen.add(key); return {item,t,lat,lng,d,official,road,near,i};}).filter(Boolean).sort((a,b)=>a.d-b.d).slice(0,12); const lots=await Promise.all(raw.map(async e=>{ const rev=await reverse(e.lat,e.lng); const road=e.road||rev.road; const addr=[[e.t['addr:housenumber'],e.t['addr:street']].filter(Boolean).join(' '),rev.city].filter(Boolean).join(', ')||rev.address; const near=e.near?.name?`near ${e.near.name}`:''; const fallback=road?`Parking near ${road}`:addr?`Parking near ${addr}`:`Parking near ${baseName(place.name)}`; const name=e.official||fallback; const context=[addr||road,near].filter(Boolean).join(' • '); const area=e.t.parking==='multi-storey'?'Parking structure':e.t.parking==='underground'?'Underground parking':'Surface / mapped lot'; return {id:`${e.item.type}-${e.item.id}`,name,fullName:e.official||name,address:addr||road||'',area,bestLot:context||road||'Near destination',distance:e.d,capacity:Number(e.t.capacity||(area.includes('structure')?500:80)),price:e.t.fee==='yes'?'Payment indicated':e.t.fee==='no'?'Marked free':'Fee unknown',walk:`${Math.max(1,Math.round(e.d*18))} min walk`,reason:`${e.official?'Named':'Mapped'} parking area ${context||road||''}. ${accessLabel(e.t)}. ${accessibility(e.t)}.`,lat:e.lat,lng:e.lng,mapQuery:e.official?`${e.official}, ${addr||road}`:`parking near ${road||addr||baseName(place.name)}`,kind:'lot',source:'OpenStreetMap + address lookup',accessibility:accessibility(e.t),priority:e.official?0:2}; })); const street=roads.map((r,i)=>{const d=distanceMiles(place.lat,place.lng,r.lat,r.lng); if(d>maxMiles||['motorway','trunk','footway','path','cycleway','steps'].includes(r.type))return null; const lane=Boolean(r.tags['parking:lane:both']||r.tags['parking:lane:left']||r.tags['parking:lane:right']||r.tags['parking:both']||r.tags['parking:left']||r.tags['parking:right']); return {id:`street-${r.name}-${i}`,name:`Street Parking - ${r.name}`,address:`${r.name} near ${baseName(place.name)}`,area:lane?'Mapped street parking':'Likely curb parking',bestLot:`${r.name} • verify signs, meters, permits, sweeping days, and curbs`,distance:d,capacity:0,price:'Check posted rules',walk:`${Math.max(1,Math.round(d*18))} min walk`,reason:lane?`Parking-lane data exists on ${r.name}; posted signs still control.`:`${r.name} is a nearby drivable street where curb parking may exist. Verify signs.`,lat:r.lat,lng:r.lng,mapQuery:`${r.name} near ${place.name}`,kind:'street',source:lane?'OpenStreetMap parking-lane data':'Nearby street estimate',accessibility:'Curb accessibility not confirmed',priority:lane?8:10+i};}).filter(Boolean).sort((a,b)=>a.distance-b.distance).slice(0,8); return {lots,street}; }

export default async function handler(req,res){
  try{
    const q=clean(req.query.q||''),mode=clean(req.query.mode||'parking'),lat=req.query.lat?Number(req.query.lat):null,lng=req.query.lng?Number(req.query.lng):null,selectedName=clean(req.query.name||'');
    if(mode==='places'){ if(!q)return res.status(400).json({error:'Search query required.'}); return res.status(200).json(await placeSearch(q,req)); }
    const minutes=Math.min(60,Math.max(5,Number(req.query.radiusMinutes||10))), maxMiles=radiusMiles(minutes), meters=radiusMeters(minutes);
    let place = lat&&lng&&(selectedName||!q||norm(q)==='near me') ? { name:selectedName||'Your current location',address:'',lat,lng,mapQuery:selectedName||'Your current location' } : (await placeSearch(q,req)).place;
    const context=await parkingContext(place,meters,maxMiles).catch(()=>({lots:[],street:[]}));
    let curated=[]; if(isCpp(place,q))curated=curatedCpp(place,maxMiles); if(isDisneyWorld(place,q))curated=[...curated,...curatedLots(place,DISNEY_WORLD_PARKING,maxMiles,'ParkLink curated Disney data')]; if(isDisneyland(place,q))curated=[...curated,...curatedLots(place,DISNEYLAND_PARKING,maxMiles,'ParkLink curated Disney data')];
    const lots=[...curated,...context.lots.filter(x=>!curated.some(c=>norm(c.name)===norm(x.name)))].sort((a,b)=>(a.priority??2)-(b.priority??2)||a.distance-b.distance);
    return res.status(200).json({place,results:[...lots,...context.street],sections:{lots,street:context.street},radiusMinutes:minutes,radiusMiles:maxMiles,note:`Showing named, addressed, or street-context parking within about ${minutes} minutes walking.`});
  }catch(error){ return res.status(200).json({place:null,suggestions:[],results:[],sections:{lots:[],street:[]},warning:error.message||'Search failed.'}); }
}
