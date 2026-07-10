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
  { id:'cpp-lot-2', name:'Cal Poly Pomona Lot 2', area:'Campus parking lot', bestLot:'Official campus lot', distance:0.35, capacity:120, price:'Campus permit rules apply', walk:'About 7 min walk', reason:'Manually curated CPP parking location.', mapQuery:'Cal Poly Pomona Lot 2', kind:'lot', source:'ParkLink curated campus data', priority:0 },
  { id:'cpp-lot-q', name:'Cal Poly Pomona Lot Q', area:'Campus parking lot', bestLot:'Official campus lot', distance:0.55, capacity:100, price:'Campus permit rules apply', walk:'About 10 min walk', reason:'Manually curated CPP parking location.', mapQuery:'Cal Poly Pomona Lot Q', kind:'lot', source:'ParkLink curated campus data', priority:0 }
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

async function overpassParking(place,radiusMiles){
  const meters=Math.max(200,Math.round(radiusMiles*1609.34));
  const q=`[out:json][timeout:20];(node["amenity"="parking"](around:${meters},${place.lat},${place.lng});way["amenity"="parking"](around:${meters},${place.lat},${place.lng});relation["amenity"="parking"](around:${meters},${place.lat},${place.lng}););out center tags 60;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','User-Agent':'ParkLink parking search'},body:q});
  if(!r.ok) throw new Error('Parking search failed.');
  const data=await r.json(),seen=new Set();
  return (data.elements||[]).map((item,i)=>{const lat=item.lat??item.center?.lat,lng=item.lon??item.center?.lon;if(!lat||!lng)return null;const t=item.tags||{},distance=distanceMiles(place.lat,place.lng,lat,lng);if(distance>radiusMiles)return null;const name=bestParkingName(t,i),key=`${name}-${Math.round(lat*10000)}-${Math.round(lng*10000)}`;if(seen.has(key))return null;seen.add(key);const cap=Number(t.capacity||(t.parking==='multi-storey'?160:t.parking==='surface'?55:30));const address=[t['addr:housenumber'],t['addr:street']].filter(Boolean).join(' ');const label=address?`${name} - ${address}`:name;return {id:`${item.type}-${item.id}`,name:label,area:areaName(t),bestLot:t.access==='private'?'Private / verify access':'Mapped parking area',distance,capacity:cap,price:t.fee==='yes'?'May require payment':t.fee==='no'?'Marked free':'Fee unknown',walk:`About ${Math.max(2,Math.round(distance*20))} min walk`,reason:'Found from mapped parking data near the selected destination.',lat,lng,mapQuery:label,kind:'lot',source:'OpenStreetMap',priority:distance<.2?1:2};}).filter(Boolean).sort((a,b)=>a.priority-b.priority||a.distance-b.distance);
}

async function mappedStreetParking(place,radiusMiles){
  const meters=Math.max(200,Math.round(radiusMiles*1609.34));
  const q=`[out:json][timeout:20];way(around:${meters},${place.lat},${place.lng})["highway"]["name"](if:t["parking:lane:both"]||t["parking:lane:left"]||t["parking:lane:right"]);out tags center 30;`;
  const r=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8','User-Agent':'ParkLink street parking search'},body:q});
  if(!r.ok)return [];
  const data=await r.json(),seen=new Set();
  return (data.elements||[]).map((item,i)=>{const street=item.tags?.name,lat=item.center?.lat,lng=item.center?.lon;if(!street||!lat||!lng||seen.has(street))return null;const distance=distanceMiles(place.lat,place.lng,lat,lng);if(distance>radiusMiles)return null;seen.add(street);return {id:`street-${item.id}`,name:`Street Parking - ${street}`,area:'Mapped street parking',bestLot:'Verify signs, meters, permits, and hours',distance,capacity:0,price:'Check posted rules',walk:`About ${Math.max(2,Math.round(distance*20))} min walk`,reason:'Street parking is shown only because mapped parking-lane data exists on this street.',lat,lng,mapQuery:`${street} near ${place.name}`,kind:'street',source:'OpenStreetMap parking-lane data',priority:9+i};}).filter(Boolean).sort((a,b)=>a.distance-b.distance);
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
    const [live,street]=await Promise.all([overpassParking(g.place,radiusMiles).catch(()=>[]),mappedStreetParking(g.place,radiusMiles).catch(()=>[])]);
    const curated=isCpp(g.place,q)?CPP_LOTS.filter(x=>x.distance<=radiusMiles):[];
    const lots=[...curated,...live].filter((x,i,a)=>a.findIndex(y=>y.name===x.name)===i).sort((a,b)=>(a.priority??2)-(b.priority??2)||a.distance-b.distance);
    return res.status(200).json({place:g.place,suggestions:g.suggestions,results:[...lots,...street],sections:{lots,street},radiusMinutes,radiusMiles,note:`Showing verified or curated parking within about ${radiusMinutes} minutes walking. Street parking only appears when mapped parking-lane data exists.`});
  }catch(error){return res.status(200).json({place:{name:clean(req.query.q||'Unknown destination'),lat:SOCAL_CENTER.lat,lng:SOCAL_CENTER.lng,mapQuery:clean(req.query.q||'Unknown destination')},suggestions:[],results:[],warning:error.message||'Parking search failed.'});}
}
