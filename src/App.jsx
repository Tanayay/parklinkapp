import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bike,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Database,
  Home,
  Layers,
  LoaderCircle,
  LocateFixed,
  LockKeyhole,
  Map,
  MapPin,
  Navigation,
  Phone,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  Waves,
  Zap
} from 'lucide-react';
import {
  firebaseReady,
  releaseSpotInFirebase,
  reserveSpotInFirebase,
  saveVehicleInFirebase,
  sendFirebaseOtp,
  subscribeReservations,
  verifyFirebaseOtp
} from './firebase';

const DEMO_CODE = '123456';
const PARKING_CODE = '246810';
const RESERVATION_LENGTH_MS = 5 * 60 * 1000;

const initialSpots = [
  { id: 'A1', name: 'Lot A - Spot A1', distance: '0.2 mi', status: 'Available', type: 'Standard', confidence: 98, eta: '2 min', note: 'Closest open module near the main entrance.', lat: 34.0562, lng: -117.8211, frequent: true, recommended: true },
  { id: 'A2', name: 'Lot A - Spot A2', distance: '0.2 mi', status: 'Occupied', type: 'Standard', confidence: 96, eta: '2 min', note: 'Vehicle detected by LiDAR module.', lat: 34.0565, lng: -117.8216, frequent: false, recommended: false },
  { id: 'B4', name: 'Structure B - Level 2', distance: '0.4 mi', status: 'Available', type: 'EV Ready', confidence: 94, eta: '4 min', note: 'Near elevator and future charging module zone.', lat: 34.0572, lng: -117.8234, frequent: true, recommended: true },
  { id: 'R2', name: 'Bike Rack Module R2', distance: '0.5 mi', status: 'Available', type: 'Bike / Scooter', confidence: 91, eta: '5 min', note: 'Rack module has open capacity for bikes, scooters, and skateboards.', lat: 34.0554, lng: -117.8201, frequent: false, recommended: true }
];

const mobilityItems = [
  { icon: Bike, title: 'Bike rack capacity', text: 'Detects open rack space so users know where bikes can fit.' },
  { icon: Zap, title: 'Scooter parking zones', text: 'Future module view for scooter corrals and charging points.' },
  { icon: Layers, title: 'Skateboard storage', text: 'Concept tracking for campus-friendly board parking areas.' }
];

const fallbackParking = [
  { name: 'Closest public parking', area: 'Nearby lot', bestLot: 'Nearest marked parking area', distance: 0.2, capacity: 25, price: 'Fee unknown', walk: '3-5 min walk', reason: 'Fallback estimate when live map data is limited.' },
  { name: 'Larger structure option', area: 'Parking structure', bestLot: 'Large capacity garage', distance: 0.5, capacity: 120, price: 'May require payment', walk: '6-9 min walk', reason: 'Usually better odds because larger garages turn over faster.' },
  { name: 'Street parking zone', area: 'Street parking', bestLot: 'Side streets around destination', distance: 0.7, capacity: 18, price: 'Meter / permit possible', walk: '8-12 min walk', reason: 'Less predictable, but useful when lots are full.' }
];

function formatPhone(value) {
  const digits = value.replace(/[^0-9]/g, '').slice(0, 10);
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);
  if (digits.length > 6) return `(${a}) ${b}-${c}`;
  if (digits.length > 3) return `(${a}) ${b}`;
  if (digits.length > 0) return `(${a}`;
  return '';
}

function formatTime(ms) {
  const safe = Math.max(0, ms);
  const minutes = Math.floor(safe / 60000);
  const seconds = Math.floor((safe % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function getHour(timeString) {
  const [hour = '12', minute = '0'] = timeString.split(':');
  return Number(hour) + Number(minute) / 60;
}

function isValidTimeRange(arrival, departure) {
  return getHour(departure) > getHour(arrival);
}

function predictAvailabilityByTime(arrival, departure, distanceMiles = 0.4, capacity = 30) {
  if (!isValidTimeRange(arrival, departure)) return 0;
  const arrivalHour = getHour(arrival);
  const duration = Math.max(0.5, getHour(departure) - arrivalHour);
  let score = 74;
  if (arrivalHour >= 7 && arrivalHour <= 10) score -= 19;
  if (arrivalHour >= 11 && arrivalHour <= 14) score -= 11;
  if (arrivalHour >= 17 && arrivalHour <= 20) score -= 15;
  if (arrivalHour >= 21 || arrivalHour <= 6) score += 12;
  if (duration > 3) score -= 8;
  if (distanceMiles > 0.8) score += 8;
  if (distanceMiles < 0.15) score -= 8;
  if (capacity > 80) score += 8;
  if (capacity < 15) score -= 6;
  return Math.max(18, Math.min(96, Math.round(score)));
}

function busyLabel(score) {
  if (score >= 70) return 'Likely open';
  if (score >= 45) return 'Moderate';
  return 'Busy';
}

function distanceMiles(lat1, lon1, lat2, lon2) {
  const radius = 3958.8;
  const toRad = (value) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodePlace(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Location search failed.');
  const results = await response.json();
  if (!results.length) throw new Error('No location found.');
  return { name: results[0].display_name, lat: Number(results[0].lat), lng: Number(results[0].lon) };
}

async function fetchParkingNear(lat, lng) {
  const query = `[out:json][timeout:18];(node["amenity"="parking"](around:1400,${lat},${lng});way["amenity"="parking"](around:1400,${lat},${lng});relation["amenity"="parking"](around:1400,${lat},${lng}););out center tags 20;`;
  const response = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: query });
  if (!response.ok) throw new Error('Parking search failed.');
  const data = await response.json();
  return data.elements.map((item, index) => {
    const itemLat = item.lat ?? item.center?.lat;
    const itemLng = item.lon ?? item.center?.lon;
    const distance = itemLat && itemLng ? distanceMiles(lat, lng, itemLat, itemLng) : 0.4 + index * 0.1;
    const capacity = Number(item.tags?.capacity || 30);
    return {
      id: `${item.type}-${item.id}`,
      name: item.tags?.name || item.tags?.operator || `Parking option ${index + 1}`,
      area: item.tags?.parking ? `${item.tags.parking} parking` : 'Public parking',
      bestLot: item.tags?.access === 'private' ? 'Private / verify access' : 'OpenStreetMap parking area',
      distance,
      capacity,
      price: item.tags?.fee === 'yes' ? 'May require payment' : item.tags?.fee === 'no' ? 'Marked free' : 'Fee unknown',
      walk: `${Math.max(2, Math.round(distance * 18))} min walk`,
      reason: item.tags?.access === 'private' ? 'Listed near your destination, but access may be restricted.' : 'Found from live OpenStreetMap parking data near your destination.'
    };
  }).sort((a, b) => a.distance - b.distance).slice(0, 8);
}

function fallbackResultsFor(query) {
  return fallbackParking.map((item, index) => ({ ...item, id: `fallback-${index}`, name: `${item.name} near ${query || 'destination'}` }));
}

function getReservation(spotId, reservations) {
  const reservation = reservations[spotId];
  if (!reservation) return null;
  if (reservation.expiresAt <= Date.now()) return null;
  return reservation;
}

function getSpotState(spot, reservations) {
  if (spot.status === 'Occupied') return 'occupied';
  if (getReservation(spot.id, reservations)) return 'mine';
  return 'available';
}

function getStatusLabel(spot, reservations) {
  const state = getSpotState(spot, reservations);
  if (state === 'mine') return 'Reserved';
  if (state === 'occupied') return 'Occupied';
  return 'Available';
}

function getSpotIcon(spot, size = 18) {
  if (spot.type.includes('Bike')) return <Bike size={size} />;
  if (spot.type.includes('EV')) return <Zap size={size} />;
  return <Car size={size} />;
}

function LogoMark() { return <div className="logo-mark"><span className="logo-ring" /><Car size={28} strokeWidth={2.4} /></div>; }
function PhoneFrame({ children }) { return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>; }
function CoolLoader({ title = 'Loading ParkLink', subtitle = 'Syncing live modules...' }) { return <div className="cool-loader"><div className="loader-core"><span /><span /><span /></div><strong>{title}</strong><p>{subtitle}</p></div>; }
function LoadingScreen() { return <main className="loading-screen"><div className="orb orb-one" /><div className="orb orb-two" /><LogoMark /><h1>ParkLink</h1><p>Real-time parking, street, and mobility modules.</p><div className="loading-bar"><span /></div></main>; }
function ActionOverlay({ action }) { if (!action) return null; return <div className="action-overlay"><CoolLoader title={action.title} subtitle={action.subtitle} /></div>; }

function AuthScreen({ onVerify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const ready = name.trim().length > 1 && phone.replace(/[^0-9]/g, '').length === 10;
  async function submit() {
    setSending(true);
    setError('');
    try { await onVerify({ name: name.trim(), phone }); }
    catch (err) { setError(err.message || 'Could not send OTP.'); setSending(false); }
  }
  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><LogoMark /><p className="eyebrow">Welcome to ParkLink</p><h1>What should we call you?</h1><p className="muted">{firebaseReady ? 'Firebase phone OTP is enabled.' : 'Firebase is not configured yet, so demo OTP is active.'}</p><label className="input-label" htmlFor="name">Name</label><div className="input-row"><UserRound size={18} /><input id="name" placeholder="Tanay" value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label" htmlFor="phone">Phone number</label><div className="input-row"><Phone size={18} /><input id="phone" type="tel" inputMode="numeric" placeholder="(310) 555-0198" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} /></div><div id="recaptcha-container" />{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={!ready || sending} onClick={submit}>{sending ? <><LoaderCircle className="spin" size={18} /> Sending OTP...</> : <>Send OTP <ChevronRight size={18} /></>}</button><div className="auth-grid"><div><ShieldCheck size={20} /><strong>Phone OTP</strong><span>{firebaseReady ? 'Real Firebase SMS code.' : 'Demo code: 123456.'}</span></div><div><LockKeyhole size={20} /><strong>Shared data</strong><span>{firebaseReady ? 'Reservations sync live.' : 'Needs Firebase env vars.'}</span></div></div></section></main></PhoneFrame>;
}

function OtpScreen({ user, onComplete, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  async function verifyCode() {
    setVerifying(true); setError('');
    try { await onComplete(code); }
    catch (err) { setVerifying(false); setError(err.message || 'Wrong OTP.'); }
  }
  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card compact-card screen-pop"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><p className="eyebrow">Verify phone</p><h1>Enter code</h1><p className="muted">Code sent to <strong>{user.phone}</strong>. {!firebaseReady && 'Demo code: 123456.'}</p><input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={code.length !== 6 || verifying} onClick={verifyCode}>{verifying ? <><LoaderCircle className="spin" size={18} /> Verifying...</> : <>Verify and open app <CheckCircle2 size={18} /></>}</button></section></main></PhoneFrame>;
}

function StatCard({ label, value, detail, icon: Icon }) { return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>; }

function RealMap({ spots, reservations, dropPin, setDropPin }) { return <section className="real-map-card glass-card"><iframe title="ParkLink real map" className="real-map" src="https://www.openstreetmap.org/export/embed.html?bbox=-117.8295%2C34.0516%2C-117.8154%2C34.0618&layer=mapnik&marker=34.0562%2C-117.8211" /><button className={dropPin ? 'drop-pin active' : 'drop-pin'} onClick={() => setDropPin(!dropPin)}><MapPin size={16} /> {dropPin ? 'Pin dropped' : 'Drop pin'}</button><div className="map-overlay-list">{spots.map((spot) => <div key={spot.id} className={`mini-map-row ${getSpotState(spot, reservations)} ${dropPin && getSpotState(spot, reservations) === 'available' ? 'highlighted' : ''}`}><strong>{getSpotIcon(spot, 16)}</strong><span>{spot.name}</span></div>)}</div></section>; }
function SpotCard({ spot, reservations, onSelect, now }) { const state = getSpotState(spot, reservations); const reservation = getReservation(spot.id, reservations); return <button className={`spot-card glass-card spot-${state}`} onClick={() => onSelect(spot.id)}><div className={`spot-type-icon ${state}`}>{getSpotIcon(spot)}</div><div className="spot-main"><strong>{spot.name}</strong><span>{spot.type} • {spot.distance} • {spot.eta}</span>{reservation && <small className="reserved-line"><Timer size={13} /> {formatTime(reservation.expiresAt - now)} left</small>}</div><div className="spot-side"><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><ChevronRight size={18} /></div></button>; }
function SpotSection({ title, eyebrow, spots, reservations, now, onOpenSpot }) { return <section className="list-section"><div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section>; }
function HomeTab({ spots, reservations, user, onOpenSpot, now }) { const openCount = spots.filter((spot) => getSpotState(spot, reservations) === 'available').length; const reservedCount = Object.values(reservations).filter((item) => item.expiresAt > now).length; const recommended = spots.filter((spot) => spot.recommended && getSpotState(spot, reservations) !== 'occupied'); const frequent = spots.filter((spot) => spot.frequent && getSpotState(spot, reservations) !== 'occupied'); return <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {user.name || 'Driver'}</p><h1>Find the closest open spot.</h1><p>{firebaseReady ? 'Reservations now sync through Firebase.' : 'Firebase not configured yet; reservations are local only.'}</p></div><div className="hero-badge"><Sparkles size={20} /><span>1 active hold max</span></div></section><div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value={openCount} detail="Available nearby" /><StatCard icon={Timer} label="Active holds" value={reservedCount} detail={firebaseReady ? 'Shared live' : 'This device'} /></div><SpotSection eyebrow="AI picked" title="Recommended spots" spots={recommended} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /><SpotSection eyebrow="Your history" title="Frequently visited" spots={frequent} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /></div>; }
function MapTab({ spots, reservations, onOpenSpot, now }) { const [dropPin, setDropPin] = useState(false); return <div className="tab-content"><div className="section-header map-title"><div><p className="eyebrow">Actual map</p><h2>Drop a pin to highlight modules</h2></div></div><RealMap spots={spots} reservations={reservations} dropPin={dropPin} setDropPin={setDropPin} /><section className="list-section"><div className="section-header"><div><p className="eyebrow">Nearby pin results</p><h2>{dropPin ? 'Modules around your pin' : 'Nearby modules'}</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>; }
function SpacesTab({ spots, reservations, query, setQuery, onOpenSpot, now }) { const filtered = useMemo(() => spots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase()) || getStatusLabel(spot, reservations).toLowerCase().includes(query.toLowerCase())), [spots, query, reservations]); return <div className="tab-content"><div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>; }
function MobilityTab() { return <section className="activity-card glass-card tab-content"><div className="section-header"><div><p className="eyebrow">Mobility hub</p><h2>Bikes, scooters, boards</h2></div></div>{mobilityItems.map(({ icon: Icon, title, text }) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>; }
function AiRecommendationCard({ location }) { const availability = location.availability; const level = availability >= 70 ? 'good' : availability >= 45 ? 'medium' : 'low'; return <div className={`ai-result-card glass-card ${level}`}><div className="ai-score-ring"><strong>{availability}%</strong><span>{busyLabel(availability)}</span></div><div className="ai-result-main"><strong>{location.name}</strong><span>{location.area} • {location.bestLot}</span><small>{location.reason}</small><div className="ai-meta-row"><em>{location.walk}</em><em>{location.price}</em><em>{location.distance?.toFixed ? `${location.distance.toFixed(1)} mi` : 'nearby'}</em></div></div></div>; }
function FutureDataTab() { const [locationQuery, setLocationQuery] = useState('Cal Poly Pomona'); const [arrival, setArrival] = useState('10:30'); const [departure, setDeparture] = useState('12:00'); const [searchedPlace, setSearchedPlace] = useState(null); const [realResults, setRealResults] = useState(fallbackResultsFor('Cal Poly Pomona')); const [loading, setLoading] = useState(false); const [aiError, setAiError] = useState(''); const validTime = isValidTimeRange(arrival, departure); const rankedResults = useMemo(() => realResults.map((location) => ({ ...location, availability: predictAvailabilityByTime(arrival, departure, location.distance, location.capacity) })).sort((a, b) => b.availability - a.availability), [realResults, arrival, departure]); const best = rankedResults[0]; async function searchRealParking() { if (!validTime) return; setLoading(true); setAiError(''); try { const place = await geocodePlace(locationQuery); const parking = await fetchParkingNear(place.lat, place.lng); setSearchedPlace(place); setRealResults(parking.length ? parking : fallbackResultsFor(locationQuery)); if (!parking.length) setAiError('No live parking lots found there, so ParkLink is showing fallback recommendations.'); } catch (error) { setSearchedPlace({ name: locationQuery }); setRealResults(fallbackResultsFor(locationQuery)); setAiError('Live map search failed, so ParkLink is showing fallback recommendations.'); } finally { setLoading(false); } } return <section className="settings-list tab-content"><div className="profile-card glass-card"><Database size={34} /><div><p className="eyebrow">AI recommendations</p><h2>Search parking near a place</h2><span>Uses live map data when available, with fallback recommendations if the map API blocks the request.</span></div></div><div className="ai-search-card glass-card"><label className="input-label" htmlFor="ai-location">Where are you going?</label><div className="input-row"><Search size={18} /><input id="ai-location" placeholder="Try Del Amo, CPP, LAX, Torrance City Hall..." value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} /></div><div className="time-grid"><label><span>Arrival time</span><input type="time" value={arrival} onChange={(event) => setArrival(event.target.value)} /></label><label><span>Leave time</span><input type="time" value={departure} onChange={(event) => setDeparture(event.target.value)} /></label></div>{!validTime && <p className="error-text">Leave time has to be after arrival time.</p>}<button className="primary-button" disabled={!validTime || loading} onClick={searchRealParking}>{loading ? <><LoaderCircle className="spin" size={18} /> Searching...</> : <>Find parking nearby <Search size={18} /></>}</button></div>{searchedPlace && <div className="setting-row glass-card"><MapPin size={20} /><div><strong>Showing results near</strong><span>{searchedPlace.name}</span></div></div>}{aiError && <p className="error-text reservation-warning">{aiError}</p>}<div className="data-grid"><StatCard icon={Clock} label="Arrival" value={arrival} detail="Adjusted by you" /><StatCard icon={Sparkles} label="Best option" value={best ? `${best.availability}%` : '--'} detail={best?.name || 'Search first'} /></div><div className="ai-results-list">{rankedResults.map((location) => <AiRecommendationCard key={location.id} location={location} />)}</div></section>; }

function VehicleManager({ vehicles, onAddVehicle }) {
  const [showAdd, setShowAdd] = useState(false);
  const [vehicle, setVehicle] = useState({ nickname: '', plate: '', color: '', type: 'Car' });
  function addVehicle() { if (!vehicle.nickname.trim() && !vehicle.plate.trim()) return; onAddVehicle({ ...vehicle, id: `${Date.now()}` }); setVehicle({ nickname: '', plate: '', color: '', type: 'Car' }); setShowAdd(false); }
  return <div className="vehicles-card glass-card"><div className="section-header"><div><p className="eyebrow">Vehicles</p><h2>Your vehicles</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><div className="input-row"><Car size={18} /><input placeholder="Nickname ex: Civic" value={vehicle.nickname} onChange={(e) => setVehicle({ ...vehicle, nickname: e.target.value })} /></div><div className="input-row vehicle-input"><Layers size={18} /><input placeholder="Plate" value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value.toUpperCase() })} /></div><div className="time-grid"><label><span>Color</span><input value={vehicle.color} placeholder="Black" onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} /></label><label><span>Type</span><input value={vehicle.type} placeholder="Car" onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })} /></label></div><button className="primary-button" onClick={addVehicle}>Save vehicle</button></div>}{vehicles.length === 0 && <p className="muted vehicle-empty">No vehicles added yet.</p>}{vehicles.map((item) => <div className="linked-user-row" key={item.id}><span>{item.type?.slice(0, 2).toUpperCase() || 'CA'}</span><div><strong>{item.nickname || item.plate || 'Vehicle'}</strong><small>{item.color || 'Color not set'} • {item.plate || 'No plate'}</small></div></div>)}</div>;
}

function SettingsTab({ user, linkedUsers, onAddUser, onSaveProfile, vehicles, onAddVehicle }) { const [showAdd, setShowAdd] = useState(false); const [edit, setEdit] = useState(false); const [name, setName] = useState(user.name); const [phone, setPhone] = useState(user.phone); function save() { onSaveProfile({ name: name.trim() || user.name, phone }); setEdit(false); } return <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{user.name}</h2><span>{user.phone}</span></div><button className="mini-button" onClick={() => setEdit(!edit)}>Edit</button></div>{edit && <div className="device-card glass-card"><label className="input-label">Name</label><div className="input-row"><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label">Phone</label><div className="input-row"><Phone size={18} /><input value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} /></div><button className="primary-button" onClick={save}>Save profile</button></div>}<VehicleManager vehicles={vehicles} onAddVehicle={onAddVehicle} /><div className="device-card glass-card"><div className="section-header"><div><p className="eyebrow">Device details</p><h2>This device</h2></div><Phone size={20} /></div><div className="device-row"><span>Firebase</span><strong>{firebaseReady ? 'Connected' : 'Not configured'}</strong></div><div className="device-row"><span>Reservation sync</span><strong>{firebaseReady ? 'Realtime shared' : 'Local prototype only'}</strong></div><div className="device-row"><span>App version</span><strong>ParkLink v0.5</strong></div></div><div className="users-card glass-card"><div className="section-header"><div><p className="eyebrow">Multiple users</p><h2>Linked users</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><p>Real linked users need accounts in the backend. For now this adds a demo linked device card.</p><button className="primary-button" onClick={onAddUser}>Add demo user</button></div>}{linkedUsers.map((person) => <div key={person.id} className="linked-user-row"><span>{person.initials}</span><div><strong>{person.name}</strong><small>{person.phone}</small></div></div>)}</div></section>; }
function NotificationCenter({ onClose }) { return <div className="notification-panel glass-card"><div className="section-header"><div><p className="eyebrow">Notifications</p><h2>ParkLink alerts</h2></div><button className="mini-button" onClick={onClose}>Close</button></div><div className="activity-row"><Bell size={18} /><div><strong>Reservation limit active</strong><span>You can hold one spot at a time to prevent spam reservations.</span></div></div><div className="activity-row"><ShieldCheck size={18} /><div><strong>Parking OTP ready</strong><span>Use code 246810 to confirm you reached your reserved spot.</span></div></div><div className="activity-row"><Database size={18} /><div><strong>Firebase status</strong><span>{firebaseReady ? 'Realtime reservation sync is enabled.' : 'Add Firebase env vars in Vercel to enable shared reservations.'}</span></div></div></div>; }
const tabs = [{ id: 'home', label: 'Home', icon: Home }, { id: 'map', label: 'Map', icon: Map }, { id: 'spaces', label: 'Spaces', icon: Layers }, { id: 'mobility', label: 'Mobility', icon: Bike }, { id: 'data', label: 'AI Recs', icon: Database }, { id: 'settings', label: 'Settings', icon: Settings }];
function AppShell({ spots, reservations, user, linkedUsers, onAddUser, onOpenSpot, now, onSaveProfile, vehicles, onAddVehicle }) { const [activeTab, setActiveTab] = useState('home'); const [query, setQuery] = useState(''); const [transition, setTransition] = useState(null); const [notificationsOpen, setNotificationsOpen] = useState(false); const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label; function switchTab(tabId, label) { if (tabId === activeTab) return; setTransition({ title: `Opening ${label}`, subtitle: 'Rebuilding your ParkLink view...' }); setTimeout(() => setActiveTab(tabId), 260); setTimeout(() => setTransition(null), 850); } return <PhoneFrame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{activeLabel}</span></div></div><button className="icon-button bell-button" onClick={() => setNotificationsOpen(true)}><Bell size={20} /><span /></button></header>{notificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}<div key={activeTab} className="animated-tab-wrap">{activeTab === 'home' && <HomeTab spots={spots} reservations={reservations} user={user} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'map' && <MapTab spots={spots} reservations={reservations} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'spaces' && <SpacesTab spots={spots} reservations={reservations} query={query} setQuery={setQuery} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'mobility' && <MobilityTab />}{activeTab === 'data' && <FutureDataTab />}{activeTab === 'settings' && <SettingsTab user={user} linkedUsers={linkedUsers} onAddUser={onAddUser} onSaveProfile={onSaveProfile} vehicles={vehicles} onAddVehicle={onAddVehicle} />}</div><nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'tab-button active' : 'tab-button'} onClick={() => switchTab(id, label)}><Icon size={18} /><span>{label}</span></button>)}</nav><ActionOverlay action={transition} /></main></PhoneFrame>; }
function SpotDetail({ spot, reservations, user, onBack, onReserveAction, action, now, activeReservationId }) { const state = getSpotState(spot, reservations); const reservation = getReservation(spot.id, reservations); const canReserve = state === 'available' && !activeReservationId; const canUnreserve = state === 'mine'; const [parkingOtp, setParkingOtp] = useState(''); const [parkingVerified, setParkingVerified] = useState(false); const [otpError, setOtpError] = useState(''); const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`; function startNavigation() { window.open(mapsUrl, '_blank', 'noopener,noreferrer'); } function verifyParkingOtp() { if (parkingOtp === PARKING_CODE) { setParkingVerified(true); setOtpError(''); } else setOtpError('Wrong parking OTP. Demo code: 246810.'); } return <PhoneFrame><main className="app-shell phone-screen detail-shell"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><section className={`detail-hero glass-card detail-${state}`}><div className="detail-icon">{getSpotIcon(spot, 34)}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><p>{spot.note}</p>{reservation && <div className="reservation-banner"><Timer size={18} /><span>Reserved for {reservation.userName || user.name} • {formatTime(reservation.expiresAt - now)} left</span></div>}</section><section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>{activeReservationId && !canUnreserve && <p className="error-text reservation-warning">You already have a reserved spot. Unreserve it before holding another one.</p>}<button className="primary-button big-action" disabled={!canReserve && !canUnreserve} onClick={() => onReserveAction(spot.id)}>{canUnreserve ? 'Unreserve spot' : canReserve ? 'Reserve for 5 minutes' : 'Reservation unavailable'} <CheckCircle2 size={20} /></button>{reservation && <section className="parking-otp-card glass-card"><p className="eyebrow">Parking spot OTP</p><h2>Confirm arrival</h2><p>When you physically get to the reserved spot, enter the parking OTP. Demo code: <strong>246810</strong></p><div className="input-row"><ShieldCheck size={18} /><input placeholder="Parking OTP" inputMode="numeric" maxLength={6} value={parkingOtp} onChange={(event) => setParkingOtp(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /></div>{otpError && <p className="error-text">{otpError}</p>}{parkingVerified ? <div className="verified-pill"><CheckCircle2 size={16} /> Parking verified</div> : <button className="primary-button" disabled={parkingOtp.length !== 6} onClick={verifyParkingOtp}>Verify parking OTP</button>}</section>}<button className="primary-button big-action navigation-action" onClick={startNavigation}><Navigation size={20} /> Start navigation</button><ActionOverlay action={action} /></main></PhoneFrame>; }

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('parklink-user') || '{"name":"Tanay","phone":"(310) 555-0198"}'));
  const [pendingUser, setPendingUser] = useState(user);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [reservations, setReservations] = useState(() => JSON.parse(localStorage.getItem('parklink-reservations') || '{}'));
  const [vehicles, setVehicles] = useState(() => JSON.parse(localStorage.getItem('parklink-vehicles') || '[]'));
  const [linkedUsers, setLinkedUsers] = useState([{ id: 'main', name: 'You', phone: 'This device', initials: 'YO' }]);
  const [action, setAction] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setTimeout(() => setPhase('auth'), 1000); return () => clearTimeout(timer); }, []);
  useEffect(() => { localStorage.setItem('parklink-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('parklink-vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { if (!firebaseReady) localStorage.setItem('parklink-reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { const tick = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(tick); }, []);
  useEffect(() => { if (!firebaseReady) setReservations((current) => Object.fromEntries(Object.entries(current).filter(([, value]) => value.expiresAt > now))); }, [now]);
  useEffect(() => { if (!firebaseReady) return undefined; return subscribeReservations(setReservations); }, []);
  const selectedSpot = initialSpots.find((spot) => spot.id === selectedSpotId);
  const activeReservationId = Object.entries(reservations).find(([, value]) => value.expiresAt > now && value.phone === user.phone)?.[0] || null;
  async function requestOtp(value) { setPendingUser(value); if (firebaseReady) { const result = await sendFirebaseOtp(value.phone); setConfirmationResult(result); } setPhase('otp'); }
  async function completeOtp(code) { if (firebaseReady) await verifyFirebaseOtp(confirmationResult, code); else if (code !== DEMO_CODE) throw new Error('Wrong code. Demo code: 123456.'); setUser(pendingUser); setPhase('home'); }
  async function handleReservation(spotId) {
    const reservation = getReservation(spotId, reservations);
    const reserving = !reservation;
    if (reserving && activeReservationId) { setAction({ title: 'Reservation limit', subtitle: 'Unreserve your current spot before holding another.' }); setTimeout(() => setAction(null), 1200); return; }
    setAction({ title: reserving ? 'Reserving spot' : 'Unreserving spot', subtitle: reserving ? 'Starting your 5 minute hold...' : 'Releasing this space back to the lot...' });
    try {
      if (firebaseReady) {
        if (reserving) await reserveSpotInFirebase({ spotId, userName: user.name, phone: user.phone, expiresAt: Date.now() + RESERVATION_LENGTH_MS });
        else await releaseSpotInFirebase(spotId);
      } else {
        setReservations((current) => { const next = { ...current }; if (reserving) next[spotId] = { userName: user.name, phone: user.phone, expiresAt: Date.now() + RESERVATION_LENGTH_MS }; else delete next[spotId]; return next; });
      }
    } catch (error) { setAction({ title: 'Reservation failed', subtitle: error.message || 'Try again.' }); }
    setTimeout(() => setAction(null), 1400);
  }
  function handleAddUser() { const count = linkedUsers.length + 1; setLinkedUsers((current) => [...current, { id: `linked-${count}`, name: `Linked User ${count}`, phone: 'Invited device', initials: `U${count}` }]); }
  function handleAddVehicle(vehicle) { setVehicles((current) => [...current, vehicle]); if (firebaseReady) saveVehicleInFirebase(user.phone, vehicle).catch(() => null); }
  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={requestOtp} />;
  if (phase === 'otp') return <OtpScreen user={pendingUser} onBack={() => setPhase('auth')} onComplete={completeOtp} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} reservations={reservations} user={user} now={now} activeReservationId={activeReservationId} onBack={() => setSelectedSpotId(null)} onReserveAction={handleReservation} action={action} />;
  return <AppShell spots={initialSpots} reservations={reservations} user={user} linkedUsers={linkedUsers} onAddUser={handleAddUser} onSaveProfile={setUser} onOpenSpot={setSelectedSpotId} now={now} vehicles={vehicles} onAddVehicle={handleAddVehicle} />;
}
