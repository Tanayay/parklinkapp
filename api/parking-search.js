const SOCAL_CENTER = { lat: 33.8583, lng: -118.2207 };

const aliases = {
  csudh: 'California State University Dominguez Hills, Carson, California',
  'california state university dominguez hills': 'California State University Dominguez Hills, Carson, California',
  cpp: 'Cal Poly Pomona, Pomona, California',
  'cal poly pomona': 'Cal Poly Pomona, Pomona, California',
  'california state polytechnic university pomona': 'Cal Poly Pomona, Pomona, California',
  '7 11': '7-Eleven',
  '711': '7-Eleven',
  '7-11': '7-Eleven',
  '7 eleven': '7-Eleven',
  '7-eleven': '7-Eleven'
};

const CPP_LOTS = [
  { id:'cpp-lot-2', name:'Cal Poly Pomona Lot 2', area:'Campus parking lot', bestLot:'Near the central campus area', distance:0.35, capacity:120, price:'Campus permit rules apply', walk:'About 7 min walk', reason:'Curated CPP parking location. Check campus permit signs and posted restrictions.', mapQuery:'Cal Poly Pomona Lot 2', kind:'lot', source:'ParkLink curated campus data', priority:0, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-q', name:'Cal Poly Pomona Lot Q', area:'Campus parking lot', bestLot:'Near the eastern side of campus', distance:0.55, capacity:100, price:'Campus permit rules apply', walk:'About 10 min walk', reason:'Curated CPP parking location. Check campus permit signs and posted restrictions.', mapQuery:'Cal Poly Pomona Lot Q', kind:'lot', source:'ParkLink curated campus data', priority:0, accessibility:'Accessibility not confirmed' },
  { id:'cpp-ps1', name:'Cal Poly Pomona Parking Structure 1', area:'Campus parking structure', bestLot:'Large-capacity campus structure', distance:0.45, capacity:700, price:'Campus permit rules apply', walk:'About 9 min walk', reason:'Curated CPP parking structure. Verify entrance, permit zone, and accessible-space signage.', mapQuery:'Cal Poly Pomona Parking Structure 1', kind:'lot', source:'ParkLink curated campus data', priority:0, accessibility:'Accessible spaces likely; verify signage' },
  { id:'cpp-ps2', name:'Cal Poly Pomona Parking Structure 2', area:'Campus parking structure', bestLot:'Large-capacity campus structure', distance:0.65, capacity:900, price:'Campus permit rules apply', walk:'About 13 min walk', reason:'Curated CPP parking structure. Verify entrance, permit zone, and accessible-space signage.', mapQuery:'Cal Poly Pomona Parking Structure 2', kind:'lot', source:'ParkLink curated campus data', priority:0, accessibility:'Accessible spaces likely; verify signage' },
  { id:'cpp-lot-b', name:'Cal Poly Pomona Lot B', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.42, capacity:120, price:'Campus permit rules apply', walk:'About 8 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot B', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-c', name:'Cal Poly Pomona Lot C', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.48, capacity:120, price:'Campus permit rules apply', walk:'About 10 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot C', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-e', name:'Cal Poly Pomona Lot E', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.58, capacity:120, price:'Campus permit rules apply', walk:'About 12 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot E', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-f', name:'Cal Poly Pomona Lot F', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.62, capacity:120, price:'Campus permit rules apply', walk:'About 12 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot F', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-j', name:'Cal Poly Pomona Lot J', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.72, capacity:100, price:'Campus permit rules apply', walk:'About 14 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot J', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' },
  { id:'cpp-lot-m', name:'Cal Poly Pomona Lot M', area:'Campus parking lot', bestLot:'Campus surface lot', distance:0.82, capacity:100, price:'Campus permit rules apply', walk:'About 16 min walk', reason:'Curated CPP parking location. Verify permit type and posted restrictions.', mapQuery:'Cal Poly Pomona Lot M', kind:'lot', source:'ParkLink curated campus data', priority:1, accessibility:'Accessibility not confirmed' }
];

function clean(v=''){ return String(v).trim().replace(/\s+/g,' '); }
function resolveAlias(q){ return aliases[clean(q).toLowerCase()] || q; }
function toRad(v){ return v*Math.PI/180; }
function distanceMiles(a,b,c,d){ const r=3958.8, x=toRad(c-a), y=toRad(d-b); const z=Math.sin(x/2)**2+Math.cos(toRad(a))*Math.cos(toRad(c))*Math.sin(y/2)**2; return r*2*Math.atan2(Math.sqrt(z),Math.sqrt(1-z)); }
function shortAddress(a={}){ const street=[a.house_number,a.road||a.pedestrian].filter(Boolean).join(' '); const city=a.city||a.town||a.village||a.suburb||a.county; return [street,city,a.state].filter(Boolean).join(', '); }
function displayName(item){ const a=item.address||{}; const name=item.name||item.display_name?.split(',')[0]||a.shop||a.amenity||a.road||'Selected place'; const addr=shortAddress(a); return addr?`${name} - ${addr}`:(item.display_name||name); }
function placeFromNominatim(item,anchor){ const lat=Number(item.lat),lng=Number(item.lon),name=displayName(item); return {id:item.place_id?`place-${item.place_id}`:`${lat}-${lng}`,name,address:shortAddress(item.address||{}),lat,lng,type:item.type,class:item.class,mapQuery:name,distanceFromAnchor:anchor?distanceMiles(anchor.lat,anchor.lng,lat,lng):0}; }

async function geocode(query,lat,lng,limit=8){
  const anchor=lat&&lng?{lat,lng}:SOCAL_CENTER;
  const p=new URLSearchParams({format:'json',limit:String(limit),addressdetails:'1',countrycodes:'us',q:resolveAlias(query)});
  if(lat&&lng){p.set('viewbox',`${lng-.35},${lat+.35},${lng+.35},${lat-.35}`);p.set('bounded','1');}
  else {p.set('viewbox','-119.7,35.0,-117.0,32.5');p.set('bounded','1');}
  const r=await fetch(`https://nominatim.openstreetmap.org/search?${p}`,{headers:{Accept:'application/json','User-Agent':'ParkLink parking search'}});
  if(!r.ok) throw new Error('Location search failed.');
  const data=await r.json(); if(!data.length) throw new Error('No location found.');
  const suggestions=data.map(x=>placeFromNominatim(x,anchor)).sort((a,b)=>a.distanceFromAnchor-b.distanceFromAnchor);
  return {place:suggestions[0],suggestions};
}

function bestParkingName(t={},i=0){ return t.name||t.operator||t.brand||(t['addr:street']?`Parking Lot - ${t['addr:street']}`:t.parking==='multi-storey'?`Parking Structure ${i+1}`:t.parking==='underground'?`Underground Parking ${i+1}`:`Mapped Parking Lot ${i+1}`); }
function areaName(t={}){ return t.parking==='multi-storey'?'Parking structure':t.parking==='underground'?'Underground parking':t.parking==='surface'?'Surface lot':'Mapped parking'; }
function accessibilityLabel(t={}){
  if(t.wheelchair==='yes') return 'Wheelchair accessible';
  if(t.wheelchair==='limited') return 'Limited wheelchair accessibility';
  if(t.wheelchair==='no') return 'Not wheelchair accessible';
  if(t.access==='private') return 'Private access; accessibility unknown';
  if(t.access==='customers') return 'Customer access; accessibility not confirmed';
  if(t.access==='permit') return 'Permit access; accessibility not confirmed';
  return 'Accessibility not confirmed';
}
function poiName(tags={}){ return tags.name||tags.brand||tags.operator||tags.shop||tags.amenity||tags.tourism||tags.leisure||''; }
function nearestPoi(lat,lng,pois=[]){
  let best=null;
  for(const poi of pois){
    const d=distanceMiles(lat,lng,poi.lat,poi.lng);
    if(d<=0.22&&(!best||d<best.distance)) best={...poi,distance:d};
  }
  return best;
}

async function mappedContext(place,radiusMiles){
  const meters=Math.max(250,Math.round(radiusMiles*1609.34));
  const q=`[out:json][timeout:24];(
    node["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    relation["amenity"="parking"](around:${meters},${place.lat},${place.lng});
    way["highway"]["name"](around:${meters},${place.lat},${place.lng});
    node["name"]["shop"](around:${meters},${place.lat},${place.lng});
    node["name"]["amenity"](around:${meters},${place.lat},${place.lng});
    node["name"]["tourism"](around:${meters},${place.lat},${place.lng});
    node["name"]["leisure"](around:${meters},${place.lat},${place.lng});
  );out center tags 140;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','User-Agent':'ParkLink parking context search'},body:q});
  if(!r.ok) throw new Error('Parking search failed.');
  const data=await r.json();
  const elements=data.elements||[];
  const pois=elements.map(item=>{const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon,name=poiName(item.tags||{});return lat&&lng&&name?{name,lat,lng}:null;}).filter(Boolean);
  const parkingSeen=new Set();
  const lots=elements.filter(item=>item.tags?.amenity==='parking').map((item,i)=>{
    const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon;if(!lat||!lng)return null;
    const t=item.tags||{},distance=distanceMiles(place.lat,place.lng,lat,lng);if(distance>radiusMiles)return null;
    const name=bestParkingName(t,i),key=`${name}-${Math.round(lat*10000)}-${Math.round(lng*10000)}`;if(parkingSeen.has(key))return null;parkingSeen.add(key);
    const cap=Number(t.capacity||(t.parking==='multi-storey'?160:t.parking==='surface'?55:30));
    const street=t['addr:street']||'';
    const address=[t['addr:housenumber'],street].filter(Boolean).join(' ');
    const nearby=nearestPoi(lat,lng,pois);
    const locationParts=[];
    if(street) locationParts.push(`on ${street}`);
    if(nearby?.name&&nearby.name!==name) locationParts.push(`near ${nearby.name}`);
    const where=locationParts.length?locationParts.join(', '):'near the selected destination';
    const label=address?`${name} - ${address}`:name;
    const access=t.access==='private'?'Private access':t.access==='customers'?'Customer parking':t.access==='permit'?'Permit parking':'Public or unspecified access';
    return {
      id:`${item.type}-${item.id}`,name:label,area:areaName(t),bestLot:`${access}; ${where}`,distance,capacity:cap,
      price:t.fee==='yes'?'May require payment':t.fee==='no'?'Marked free':'Fee unknown',walk:`About ${Math.max(2,Math.round(distance*20))} min walk`,
      reason:`Mapped ${areaName(t).toLowerCase()} ${where}. ${access}. Check entrance signs, posted restrictions, and operating hours.`,
      lat,lng,mapQuery:address||`${name} near ${place.name}`,kind:'lot',source:'OpenStreetMap',priority:distance<.2?1:2,
      accessibility:accessibilityLabel(t)
    };
  }).filter(Boolean).sort((a,b)=>a.priority-b.priority||a.distance-b.distance);

  const streetSeen=new Set();
  const streets=elements.filter(item=>item.tags?.highway&&item.tags?.name).map((item,i)=>{
    const t=item.tags||{},street=t.name,lat=item.center?.lat,lng=item.center?.lon;if(!street||!lat||!lng||streetSeen.has(street))return null;
    const distance=distanceMiles(place.lat,place.lng,lat,lng);if(distance>radiusMiles)return null;
    const roadType=t.highway;
    if(['motorway','motorway_link','trunk','trunk_link','footway','path','cycleway','steps'].includes(roadType))return null;
    const hasMappedLane=Boolean(t['parking:lane:both']||t['parking:lane:left']||t['parking:lane:right']||t['parking:both']||t['parking:left']||t['parking:right']);
    const curbCandidate=['residential','unclassified','tertiary','secondary','primary','service','living_street'].includes(roadType);
    if(!hasMappedLane&&!curbCandidate)return null;
    streetSeen.add(street);
    const confidence=hasMappedLane?'Mapped curb-parking information':'Likely curb-parking street';
    return {
      id:`street-${item.id}`,name:`Street Parking - ${street}`,area:hasMappedLane?'Mapped street parking':'Likely curb parking',
      bestLot:`${confidence}; verify signs, meters, sweeping days, permits, and red curbs`,distance,capacity:0,price:'Check posted rules',
      walk:`About ${Math.max(2,Math.round(distance*20))} min walk`,
      reason:hasMappedLane?`Parking-lane information is mapped on ${street}, but posted signs still control.`:`${street} is a nearby drivable street where curb parking may exist. Map data does not confirm individual legal spaces, so verify all posted restrictions.`,
      lat,lng,mapQuery:`${street} near ${place.name}`,kind:'street',source:hasMappedLane?'OpenStreetMap parking-lane data':'Nearby street estimate',priority:hasMappedLane?8:10+i,
      accessibility:'Curb accessibility not confirmed',confirmed:hasMappedLane
    };
  }).filter(Boolean).sort((a,b)=>(Number(b.confirmed)-Number(a.confirmed))||a.distance-b.distance).slice(0,8);

  return {lots,streets};
}

function isCpp(place,q=''){ const x=`${place?.name||''} ${q}`.toLowerCase(); return x.includes('cal poly pomona')||x.includes('california state polytechnic university'); }

export default async function handler(req,res){
  try{
    const q=clean(req.query.q||''),lat=req.query.lat?Number(req.query.lat):null,lng=req.query.lng?Number(req.query.lng):null,mode=clean(req.query.mode||'parking'),selectedName=clean(req.query.name||'');
    const radiusMinutes=Math.min(30,Math.max(5,Number(req.query.radiusMinutes||10)));
    const radiusMiles=radiusMinutes/20;
    if(mode==='places'){if(!q)return res.status(400).json({error:'Search query required.'});const g=await geocode(q,lat,lng,10);return res.status(200).json({...g});}
    if(!q&&(!lat||!lng))return res.status(400).json({error:'Search query or location required.'});
    const g=lat&&lng&&(selectedName||!q||q.toLowerCase()==='near me')?{place:{name:selectedName||'Your current location',address:'',lat,lng,mapQuery:selectedName||'Your current location'},suggestions:[]}:await geocode(q,lat,lng,10);
    const context=await mappedContext(g.place,radiusMiles).catch(()=>({lots:[],streets:[]}));
    const curated=isCpp(g.place,q)?CPP_LOTS.filter(x=>x.distance<=radiusMiles):[];
    const lots=[...curated,...context.lots].filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i).sort((a,b)=>(a.priority??2)-(b.priority??2)||a.distance-b.distance);
    const street=context.streets;
    return res.status(200).json({
      place:g.place,suggestions:g.suggestions,results:[...lots,...street],sections:{lots,street},radiusMinutes,radiusMiles,
      info:`Showing mapped or curated parking within about ${radiusMinutes} minutes walking. Streets labeled “likely curb parking” are nearby candidates, not confirmed legal spaces.`
    });
  }catch(error){return res.status(200).json({place:{name:clean(req.query.q||'Unknown destination'),lat:SOCAL_CENTER.lat,lng:SOCAL_CENTER.lng,mapQuery:clean(req.query.q||'Unknown destination')},suggestions:[],results:[],warning:error.message||'Parking search failed.'});}
}
