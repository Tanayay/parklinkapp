import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bike,
  Car,
  CheckCircle2,
  Clock,
  Database,
  Home,
  Layers,
  LoaderCircle,
  Map,
  MapPin,
  Navigation,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
  UserRound,
  Zap
} from 'lucide-react';
import { firebaseReady, saveVehicleInFirebase } from './firebase';

const HOLD_MS = 5 * 60 * 1000;

const initialSpots = [
  { id: 'A1', name: 'Lot A - Spot A1', distance: '0.2 mi', status: 'Available', type: 'Standard', confidence: 98, eta: '2 min', note: 'Closest open module near the main entrance.', lat: 34.0562, lng: -117.8211, frequent: true, recommended: true },
  { id: 'A2', name: 'Lot A - Spot A2', distance: '0.2 mi', status: 'Occupied', type: 'Standard', confidence: 96, eta: '2 min', note: 'Vehicle detected by LiDAR module.', lat: 34.0565, lng: -117.8216, frequent: false, recommended: false },
  { id: 'B4', name: 'Structure B - Level 2', distance: '0.4 mi', status: 'Available', type: 'EV Ready', confidence: 94, eta: '4 min', note: 'Near elevator and future charging module zone.', lat: 34.0572, lng: -117.8234, frequent: true, recommended: true },
  { id: 'R2', name: 'Bike Rack Module R2', distance: '0.5 mi', status: 'Available', type: 'Bike / Scooter', confidence: 91, eta: '5 min', note: 'Rack module has open capacity for bikes, scooters, and skateboards.', lat: 34.0554, lng: -117.8201, frequent: false, recommended: true }
];

const quickPlaces = [
  'Use my location',
  'CSUDH',
  'Cal Poly Pomona',
  'Del Amo Fashion Center',
  '2nd & PCH',
  'Torrance City Hall',
  'LAX',
  'Hollywood Sign'
];

const fallbackParking = [
  { id: 'fallback-1', name: 'Closest public parking', area: 'Nearby lot', bestLot: 'Nearest marked parking area', distance: 0.2, capacity: 25, price: 'Fee unknown', walk: '3-5 min walk', reason: 'Fallback estimate when live parking data is limited.', lat: 33.8583, lng: -118.2207, kind: 'lot' },
  { id: 'fallback-2', name: 'Street Parking - Nearby side streets', area: 'Street parking', bestLot: 'Check signs, meters, permit rules, and posted hours', distance: 0.35, capacity: 12, price: 'Meter / permit possible', walk: '5-7 min walk', reason: 'Street parking may exist near the destination. Always check posted rules.', lat: 33.8593, lng: -118.2217, kind: 'street' },
  { id: 'fallback-3', name: 'Larger parking structure', area: 'Parking structure', bestLot: 'Larger capacity garage', distance: 0.65, capacity: 120, price: 'May require payment', walk: '8-11 min walk', reason: 'Usually better odds because larger garages turn over faster.', lat: 33.8603, lng: -118.2227, kind: 'lot' }
];

function LogoMark() {
  return <div className="logo-mark"><span className="logo-ring" /><Car size={28} strokeWidth={2.4} /></div>;
}

function PhoneFrame({ children }) {
  return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>;
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function formatTime(ms) {
  const safe = Math.max(0, ms);
  return `${Math.floor(safe / 60000)}:${String(Math.floor((safe % 60000) / 1000)).padStart(2, '0')}`;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getHour(timeString) {
  const [hour = '12', minute = '0'] = timeString.split(':');
  return Number(hour) + Number(minute) / 60;
}

function isValidTimeRange(arrival, departure) {
  return getHour(departure) > getHour(arrival);
}

function isPopularPlace(placeName = '') {
  const place = placeName.toLowerCase();
  return ['university', 'college', 'csudh', 'cal poly', 'mall', 'fashion center', 'lax', 'hollywood', 'pch', 'beach', 'downtown', 'los angeles'].some((word) => place.includes(word));
}

function predictAvailability(arrival, departure, distance = 0.4, capacity = 30, placeName = '', kind = 'lot') {
  if (!isValidTimeRange(arrival, departure)) return 0;
  const hour = getHour(arrival);
  const duration = Math.max(0.5, getHour(departure) - hour);
  let score = kind === 'street' ? 44 : 62;
  if (hour >= 7 && hour <= 10) score -= 16;
  if (hour >= 11 && hour <= 14) score -= 24;
  if (hour >= 17 && hour <= 20) score -= 20;
  if (hour >= 21 || hour <= 6) score += 14;
  if (isPopularPlace(placeName)) score -= 18;
  if (duration > 3) score -= 6;
  if (distance < 0.2) score -= 8;
  if (distance > 0.8) score += 10;
  if (capacity > 100) score += 8;
  if (capacity < 20) score -= 8;
  return Math.max(8, Math.min(92, Math.round(score)));
}

function busyLabel(score) {
  if (score >= 70) return 'Likely open';
  if (score >= 45) return 'Moderate';
  return 'Busy';
}

function getReservation(spotId, reservations) {
  const reservation = reservations[spotId];
  if (!reservation) return null;
  if (reservation.parked) return reservation;
  if (reservation.expiresAt <= Date.now()) return null;
  return reservation;
}

function getSpotState(spot, reservations) {
  const reservation = getReservation(spot.id, reservations);
  if (reservation?.parked) return 'occupied';
  if (spot.status === 'Occupied') return 'occupied';
  if (reservation) return 'mine';
  return 'available';
}

function getStatusLabel(spot, reservations) {
  const state = getSpotState(spot, reservations);
  if (state === 'occupied') return 'Occupied';
  if (state === 'mine') return 'Reserved';
  return 'Available';
}

function getSpotIcon(spot, size = 18) {
  if (spot.type.includes('Bike')) return <Bike size={size} />;
  if (spot.type.includes('EV')) return <Zap size={size} />;
  return <Car size={size} />;
}

function vehicleLabel(vehicle) {
  const type = `${vehicle.type || vehicle.nickname || ''}`.toLowerCase();
  if (type.includes('air')) return 'AI';
  if (type.includes('dump')) return 'DU';
  if (type.includes('truck')) return 'TR';
  if (type.includes('suv')) return 'SU';
  if (type.includes('bike')) return 'BI';
  return (vehicle.type || vehicle.nickname || 'CA').slice(0, 2).toUpperCase();
}

async function sendEmail({ email, code, name, type = 'otp', spotName = '' }) {
  const response = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, name, type, spotName })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Email failed.');
  return data;
}

async function searchParkingBackend({ q, lat, lng }) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lat && lng) {
    params.set('lat', String(lat));
    params.set('lng', String(lng));
  }
  const response = await fetch(`/api/parking-search?${params.toString()}`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Parking search failed.');
  return data;
}

function LoadingScreen() {
  return <main className="loading-screen"><div className="orb orb-one" /><div className="orb orb-two" /><LogoMark /><h1>ParkLink</h1><p>Real-time parking, street, and mobility modules.</p><div className="loading-bar"><span /></div></main>;
}

function ActionOverlay({ action }) {
  if (!action) return null;
  return <div className="action-overlay"><div className="cool-loader"><div className="loader-core"><span /><span /><span /></div><strong>{action.title}</strong><p>{action.subtitle}</p></div></div>;
}

function StatCard({ icon: Icon, label, value, detail }) {
  return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function AuthScreen({ onVerify }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const ready = name.trim().length > 1 && isValidEmail(email.trim());

  async function submit() {
    setSending(true);
    setError('');
    const code = makeOtp();
    try {
      await sendEmail({ email: email.trim(), name: name.trim(), code, type: 'login' });
      sessionStorage.setItem('parklink-login-otp', code);
      await onVerify({ name: name.trim(), email: email.trim() });
    } catch (err) {
      setError(err.message || 'Could not send OTP email.');
      setSending(false);
    }
  }

  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><LogoMark /><p className="eyebrow">Welcome to ParkLink</p><h1>What should we call you?</h1><p className="muted">OTP means one-time passcode. Enter your email and ParkLinkAI will send a verification code.</p><label className="input-label">Name</label><div className="input-row"><UserRound size={18} /><input placeholder="Tanay" value={name} onChange={(e) => setName(e.target.value)} /></div><label className="input-label">Email</label><div className="input-row"><ShieldCheck size={18} /><input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={!ready || sending} onClick={submit}>{sending ? <><LoaderCircle className="spin" size={18} /> Sending OTP...</> : <>Send OTP to email <CheckCircle2 size={18} /></>}</button><div className="auth-grid"><div><ShieldCheck size={20} /><strong>Email OTP</strong><span>One-time passcode sent to your inbox.</span></div><div><Database size={20} /><strong>Parking OTP</strong><span>Second code proves you reached the spot.</span></div></div></section></main></PhoneFrame>;
}

function OtpScreen({ user, onComplete, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  async function verifyCode() {
    setVerifying(true);
    setError('');
    try { await onComplete(code); }
    catch (err) { setVerifying(false); setError(err.message || 'Wrong OTP.'); }
  }

  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card compact-card screen-pop"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><p className="eyebrow">Verify email</p><h1>Enter code</h1><p className="muted">Code sent to <strong>{user.email}</strong>.</p><input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={code.length !== 6 || verifying} onClick={verifyCode}>{verifying ? <><LoaderCircle className="spin" size={18} /> Verifying...</> : <>Verify and open app <CheckCircle2 size={18} /></>}</button></section></main></PhoneFrame>;
}

function SpotCard({ spot, reservations, onSelect, now }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  return <button className={`spot-card glass-card spot-${state}`} onClick={() => onSelect(spot.id)}><div className={`spot-type-icon ${state}`}>{getSpotIcon(spot)}</div><div className="spot-main"><strong>{spot.name}</strong><span>{spot.type} • {spot.distance} • {spot.eta}</span>{reservation && !reservation.parked && <small className="reserved-line"><Timer size={13} /> {formatTime(reservation.expiresAt - now)} left</small>}{reservation?.parked && <small className="reserved-line"><CheckCircle2 size={13} /> Parked / occupied</small>}</div><div className="spot-side"><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span></div></button>;
}

function HomeTab({ reservations, user, onOpenSpot, now }) {
  const openCount = initialSpots.filter((spot) => getSpotState(spot, reservations) === 'available').length;
  const activeHolds = Object.values(reservations).filter((item) => item.expiresAt > now && !item.parked).length;
  const parkedCount = Object.values(reservations).filter((item) => item.parked).length;
  const recommended = initialSpots.filter((spot) => spot.recommended && getSpotState(spot, reservations) !== 'occupied');
  const frequent = initialSpots.filter((spot) => spot.frequent && getSpotState(spot, reservations) !== 'occupied');
  return <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {user.name}</p><h1>Find the closest open spot.</h1><p>Reservations, parking OTP, occupied status, and departure emails are active.</p></div><div className="hero-badge"><Sparkles size={20} /><span>1 active hold max</span></div></section><div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value={openCount} detail="Available nearby" /><StatCard icon={Timer} label="Reserved" value={activeHolds + parkedCount} detail={parkedCount ? 'Parked now' : 'This device'} /></div><section className="list-section"><div className="section-header"><div><p className="eyebrow">AI picked</p><h2>Recommended spots</h2></div></div><div className="spot-list">{recommended.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section><section className="list-section"><div className="section-header"><div><p className="eyebrow">Your history</p><h2>Frequently visited</h2></div></div><div className="spot-list">{frequent.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function MapTab({ reservations, onOpenSpot, now }) {
  const [dropPin, setDropPin] = useState(false);
  return <div className="tab-content"><div className="section-header map-title"><div><p className="eyebrow">Actual map</p><h2>Drop a pin to highlight modules</h2></div></div><section className="real-map-card glass-card"><iframe title="ParkLink real map" className="real-map" src="https://www.openstreetmap.org/export/embed.html?bbox=-117.8295%2C34.0516%2C-117.8154%2C34.0618&layer=mapnik&marker=34.0562%2C-117.8211" /><button className={dropPin ? 'drop-pin active' : 'drop-pin'} onClick={() => setDropPin(!dropPin)}><MapPin size={16} /> {dropPin ? 'Pin dropped' : 'Drop pin'}</button><div className="map-overlay-list map-chip-strip">{initialSpots.map((spot) => <button key={spot.id} className={`mini-map-row ${getSpotState(spot, reservations)}`} onClick={() => onOpenSpot(spot.id)}><strong>{spot.id}</strong><span>{getStatusLabel(spot, reservations)}</span></button>)}</div></section><div className="spot-list">{initialSpots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></div>;
}

function SpacesTab({ reservations, onOpenSpot, now }) {
  const [query, setQuery] = useState('');
  const filtered = initialSpots.filter((spot) => `${spot.name} ${spot.type} ${getStatusLabel(spot, reservations)}`.toLowerCase().includes(query.toLowerCase()));
  return <div className="tab-content"><div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(e) => setQuery(e.target.value)} /></div><section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function MobilityTab() {
  const items = [
    [Bike, 'Bike rack capacity', 'Detects open rack space so users know where bikes can fit.'],
    [Zap, 'Scooter parking zones', 'Future module view for scooter corrals and charging points.'],
    [Layers, 'Skateboard storage', 'Concept tracking for campus-friendly board parking areas.']
  ];
  return <section className="activity-card glass-card tab-content"><div className="section-header"><div><p className="eyebrow">Mobility hub</p><h2>Bikes, scooters, boards</h2></div></div>{items.map(([Icon, title, text]) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>;
}

function AiRecommendationCard({ location, selected, onSelect }) {
  const level = location.availability >= 70 ? 'good' : location.availability >= 45 ? 'medium' : 'low';
  const mapsUrl = location.lat && location.lng ? `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}` : null;
  return <button className={`ai-result-card glass-card ${level} ${selected ? 'ai-selected' : ''}`} onClick={onSelect}><div className="ai-score-ring"><strong>{location.availability}%</strong><span>{busyLabel(location.availability)}</span></div><div className="ai-result-main"><strong>{location.name}</strong><span>{location.area} • {location.bestLot}</span><small>{location.reason}</small><div className="ai-meta-row"><em>{location.walk}</em><em>{location.price}</em><em>{location.distance?.toFixed ? `${location.distance.toFixed(1)} mi` : 'nearby'}</em></div>{mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>Open in map</a>}</div></button>;
}

function AiMapPreview({ selected, place }) {
  const target = selected || place;
  if (!target?.lat || !target?.lng) return null;
  const lat = Number(target.lat);
  const lng = Number(target.lng);
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`;
  return <section className="ai-map-preview glass-card"><iframe title="Selected parking map" src={src} /><div><strong>{target.name || 'Selected location'}</strong><span>{target.area || 'Map preview'}</span></div></section>;
}

function AiTab() {
  const [locationQuery, setLocationQuery] = useState('CSUDH');
  const [arrival, setArrival] = useState('12:00');
  const [departure, setDeparture] = useState('13:00');
  const [place, setPlace] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [results, setResults] = useState(fallbackParking);
  const [selected, setSelected] = useState(null);
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const validTime = isValidTimeRange(arrival, departure);

  const rankedResults = useMemo(() => results.map((location, index) => ({
    ...location,
    id: location.id || `ai-${index}`,
    availability: predictAvailability(arrival, departure, location.distance, location.capacity, `${place?.name || locationQuery} ${location.name}`, location.kind)
  })).sort((a, b) => b.availability - a.availability), [results, arrival, departure, place, locationQuery]);

  const best = rankedResults[0];

  async function runSearch(queryOverride = locationQuery, coordsOverride = coords) {
    if (!validTime) return;
    setLoading(true);
    setAiError('');
    try {
      const data = await searchParkingBackend({ q: queryOverride, lat: coordsOverride?.lat, lng: coordsOverride?.lng });
      const nextResults = data.results?.length ? data.results : fallbackParking;
      setPlace(data.place || { name: queryOverride });
      setSuggestions(data.suggestions || []);
      setResults(nextResults);
      setSelected(nextResults[0] || null);
      if (data.warning) setAiError(data.warning);
    } catch (error) {
      const fallback = fallbackParking.map((item) => ({ ...item, name: `${item.name} near ${queryOverride || 'your location'}` }));
      setPlace({ name: queryOverride || 'Your location' });
      setResults(fallback);
      setSelected(fallback[0]);
      setAiError('Live search failed, so fallback recommendations are shown.');
    } finally {
      setLoading(false);
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setAiError('Location is not available in this browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = { lat: position.coords.latitude, lng: position.coords.longitude };
        setCoords(nextCoords);
        setLocationQuery('near me');
        runSearch('near me', nextCoords);
      },
      () => {
        setLoading(false);
        setAiError('Location permission was denied. Pick a place from the dropdown or search manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function pickPlace(value) {
    if (!value) return;
    if (value === 'Use my location') {
      useMyLocation();
      return;
    }
    setLocationQuery(value);
    runSearch(value, coords);
  }

  return <section className="settings-list tab-content"><div className="profile-card glass-card"><Database size={34} /><div><p className="eyebrow">AI recommendations</p><h2>Search parking near a place</h2><span>Uses a ParkLink backend search, SoCal bias, street-parking estimates, and clickable map results.</span></div></div><div className="ai-search-card glass-card"><label className="input-label">Quick location</label><select className="parklink-select" defaultValue="" onChange={(e) => pickPlace(e.target.value)}><option value="">Pick a common place...</option>{quickPlaces.map((placeName) => <option key={placeName} value={placeName}>{placeName}</option>)}</select><label className="input-label">Where are you going?</label><div className="input-row"><Search size={18} /><input placeholder="Try CSUDH, 2nd & PCH, 7-Eleven, Del Amo..." value={locationQuery} onChange={(e) => setLocationQuery(e.target.value)} /></div><div className="time-grid"><label><span>Arrival time</span><input type="time" value={arrival} onChange={(e) => setArrival(e.target.value)} /></label><label><span>Leave time</span><input type="time" value={departure} onChange={(e) => setDeparture(e.target.value)} /></label></div>{!validTime && <p className="error-text">Leave time has to be after arrival time.</p>}<div className="ai-button-row"><button className="ghost-button ai-small-action" type="button" onClick={useMyLocation}>Use my location</button><button className="primary-button" disabled={!validTime || loading} onClick={() => runSearch()}>{loading ? <><LoaderCircle className="spin" size={18} /> Searching...</> : <>Find parking nearby <Search size={18} /></>}</button></div></div>{place && <div className="setting-row glass-card"><MapPin size={20} /><div><strong>Showing results near</strong><span>{place.name}</span></div></div>}{suggestions.length > 1 && <div className="ai-suggestion-row">{suggestions.slice(0, 4).map((item) => <button key={`${item.lat}-${item.lng}`} onClick={() => { setPlace(item); runSearch(item.name, { lat: item.lat, lng: item.lng }); }}>{item.name.split(',').slice(0, 2).join(',')}</button>)}</div>}{aiError && <p className="error-text reservation-warning">{aiError}</p>}<AiMapPreview selected={selected} place={place} /><div className="data-grid"><StatCard icon={Clock} label="Arrival" value={arrival} detail="Adjusted by you" /><StatCard icon={Sparkles} label="Best option" value={best ? `${best.availability}%` : '--'} detail={best?.name || 'Search first'} /></div><div className="ai-results-list">{rankedResults.map((location) => <AiRecommendationCard key={location.id} location={location} selected={selected?.id === location.id} onSelect={() => setSelected(location)} />)}</div></section>;
}

function VehicleManager({ vehicles, onAddVehicle }) {
  const [showAdd, setShowAdd] = useState(false);
  const [vehicle, setVehicle] = useState({ nickname: '', plate: '', color: '', type: 'Car' });
  function addVehicle() {
    if (!vehicle.nickname.trim() && !vehicle.plate.trim()) return;
    onAddVehicle({ ...vehicle, id: `${Date.now()}` });
    setVehicle({ nickname: '', plate: '', color: '', type: 'Car' });
    setShowAdd(false);
  }
  return <div className="vehicles-card glass-card"><div className="section-header"><div><p className="eyebrow">Vehicles</p><h2>Your vehicles</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><div className="input-row"><Car size={18} /><input placeholder="Nickname ex: Civic" value={vehicle.nickname} onChange={(e) => setVehicle({ ...vehicle, nickname: e.target.value })} /></div><div className="input-row vehicle-input"><Layers size={18} /><input placeholder="Plate" value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value.toUpperCase() })} /></div><div className="time-grid"><label><span>Color</span><input value={vehicle.color} placeholder="Black" onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} /></label><label><span>Type</span><input value={vehicle.type} placeholder="Car" onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })} /></label></div><button className="primary-button" onClick={addVehicle}>Save vehicle</button></div>}{vehicles.length === 0 && <p className="muted vehicle-empty">No vehicles added yet.</p>}{vehicles.map((item) => <div className="linked-user-row" key={item.id}><span>{vehicleLabel(item)}</span><div><strong>{item.nickname || item.plate || 'Vehicle'}</strong><small>{item.color || 'Color not set'} • {item.plate || 'No plate'}</small></div></div>)}</div>;
}

function SettingsTab({ user, vehicles, onAddVehicle, onLogout }) {
  return <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{user.name}</h2><span>{user.email}</span></div><button className="mini-button" onClick={onLogout}>Log out</button></div><div className="device-card glass-card"><div className="section-header"><div><p className="eyebrow">Quick tutorial</p><h2>What OTP means</h2></div><ShieldCheck size={20} /></div><p className="muted">OTP means one-time passcode. Login OTP verifies your email. Parking OTP proves you physically reached the reserved spot before it becomes occupied.</p></div><VehicleManager vehicles={vehicles} onAddVehicle={onAddVehicle} /><div className="device-card glass-card"><div className="section-header"><div><p className="eyebrow">Device details</p><h2>This device</h2></div><ShieldCheck size={20} /></div><div className="device-row"><span>Login</span><strong>Email OTP</strong></div><div className="device-row"><span>Parking OTP</span><strong>Email per reservation</strong></div><div className="device-row"><span>AI Recs</span><strong>Backend + location</strong></div><div className="device-row"><span>App version</span><strong>ParkLink v1.1</strong></div></div></section>;
}

function NotificationCenter({ onClose }) {
  return <div className="notification-panel glass-card"><div className="section-header"><div><p className="eyebrow">Notifications</p><h2>ParkLink alerts</h2></div><button className="mini-button" onClick={onClose}>Close</button></div><div className="activity-row"><ShieldCheck size={18} /><div><strong>Parking flow active</strong><span>Reserve, verify, park, then leave.</span></div></div><div className="activity-row"><Database size={18} /><div><strong>AI Recs improved</strong><span>Search is SoCal-biased and can use your location.</span></div></div></div>;
}

function SpotDetail({ spot, reservations, user, onBack, onReserve, onVerifyParking, onPark, onLeave, action, now, activeReservationId }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  const mine = reservation && reservation.email === user.email;
  const canReserve = state === 'available' && !activeReservationId;
  const canUnreserve = reservation && mine && !reservation.parked;
  const canPark = reservation && mine && reservation.parkingVerified && !reservation.parked;
  const canLeave = reservation && mine && reservation.parked;
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

  function verify() {
    if (code === reservation?.parkingOtp) {
      setError('');
      onVerifyParking(spot.id);
    } else {
      setError('Wrong parking OTP. Check your reservation email.');
    }
  }

  return <PhoneFrame><main className="app-shell phone-screen detail-shell"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><section className={`detail-hero glass-card detail-${state}`}><div className="detail-icon">{getSpotIcon(spot, 34)}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><p>{spot.note}</p>{reservation && !reservation.parked && <div className="reservation-banner"><Timer size={18} /><span>Reserved for {reservation.userName || user.name} • {formatTime(reservation.expiresAt - now)} left</span></div>}{reservation?.parked && <div className="reservation-banner"><CheckCircle2 size={18} /><span>Parked here • spot is now occupied</span></div>}</section><section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>{activeReservationId && !canUnreserve && !canPark && !canLeave && <p className="error-text reservation-warning">You already have a reserved/parked spot. Unreserve or leave that spot first.</p>}<button className="primary-button big-action" disabled={!canReserve && !canUnreserve} onClick={() => onReserve(spot.id)}>{canUnreserve ? 'Unreserve spot' : canReserve ? 'Reserve for 5 minutes' : 'Reservation unavailable'} <CheckCircle2 size={20} /></button>{reservation && <section className="parking-otp-card glass-card"><p className="eyebrow">Parking spot OTP</p><h2>Confirm arrival</h2><p>Enter the parking OTP emailed to <strong>{user.email}</strong>.</p>{reservation.parkingOtpEmailStatus === 'failed' && <p className="error-text">Email failed, backup code: {reservation.parkingOtp}</p>}{!reservation.parkingVerified && <><div className="input-row"><ShieldCheck size={18} /><input placeholder="Parking OTP" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /></div>{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={code.length !== 6} onClick={verify}>Verify parking OTP</button></>}{reservation.parkingVerified && !reservation.parked && <><div className="verified-pill"><CheckCircle2 size={16} /> Parking OTP verified</div><button className="primary-button" onClick={() => onPark(spot.id)}>I’m parked here</button></>}{reservation.parked && <><div className="verified-pill"><CheckCircle2 size={16} /> Status: Occupied</div><button className="primary-button" onClick={() => onLeave(spot.id)}>I left the spot</button></>}</section>}<button className="primary-button big-action navigation-action" onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}><Navigation size={20} /> Start navigation</button><ActionOverlay action={action} /></main></PhoneFrame>;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'mobility', label: 'Mobility', icon: Bike },
  { id: 'data', label: 'AI Recs', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppShell({ reservations, user, onOpenSpot, now, vehicles, onAddVehicle, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const tabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Home';
  return <PhoneFrame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{tabLabel}</span></div></div><button className="icon-button bell-button" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={20} /><span /></button></header>{notificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}{activeTab === 'home' && <HomeTab reservations={reservations} user={user} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'map' && <MapTab reservations={reservations} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'spaces' && <SpacesTab reservations={reservations} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'mobility' && <MobilityTab />}{activeTab === 'data' && <AiTab />}{activeTab === 'settings' && <SettingsTab user={user} vehicles={vehicles} onAddVehicle={onAddVehicle} onLogout={onLogout} />}<nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}><Icon size={18} /><span>{label}</span></button>)}</nav></main></PhoneFrame>;
}

export default function AppParkFlowFinal() {
  const storedUser = localStorage.getItem('parklink-user');
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(() => storedUser ? JSON.parse(storedUser) : null);
  const [pendingUser, setPendingUser] = useState(() => JSON.parse(sessionStorage.getItem('parklink-pending-user') || 'null'));
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [reservations, setReservations] = useState(() => JSON.parse(localStorage.getItem('parklink-reservations') || '{}'));
  const [vehicles, setVehicles] = useState(() => JSON.parse(localStorage.getItem('parklink-vehicles') || '[]'));
  const [action, setAction] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const timer = setTimeout(() => setPhase(user ? 'home' : pendingUser ? 'otp' : 'auth'), 700); return () => clearTimeout(timer); }, []);
  useEffect(() => { const tick = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(tick); }, []);
  useEffect(() => { if (user) localStorage.setItem('parklink-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('parklink-vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('parklink-reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { setReservations((current) => Object.fromEntries(Object.entries(current).filter(([, value]) => value.parked || value.expiresAt > now))); }, [now]);

  const selectedSpot = initialSpots.find((spot) => spot.id === selectedSpotId);
  const activeReservationId = Object.entries(reservations).find(([, value]) => value.email === user?.email && (value.parked || value.expiresAt > now))?.[0] || null;

  async function requestOtp(value) {
    setPendingUser(value);
    sessionStorage.setItem('parklink-pending-user', JSON.stringify(value));
    setPhase('otp');
  }

  async function completeOtp(code) {
    const expected = sessionStorage.getItem('parklink-login-otp');
    if (!expected) throw new Error('No OTP was requested. Go back and send a new code.');
    if (code !== expected) throw new Error('Wrong code. Check your email and try again.');
    localStorage.setItem('parklink-user', JSON.stringify(pendingUser));
    sessionStorage.removeItem('parklink-login-otp');
    sessionStorage.removeItem('parklink-pending-user');
    setUser(pendingUser);
    setPhase('home');
  }

  async function reserveSpot(spotId) {
    const spot = initialSpots.find((item) => item.id === spotId);
    const existing = getReservation(spotId, reservations);
    const reserving = !existing;
    if (reserving && activeReservationId) {
      setAction({ title: 'Reservation limit', subtitle: 'Unreserve or leave your current spot first.' });
      setTimeout(() => setAction(null), 1300);
      return;
    }
    if (!reserving) {
      setReservations((current) => { const next = { ...current }; delete next[spotId]; return next; });
      setAction({ title: 'Spot released', subtitle: 'This space is available again.' });
      setTimeout(() => setAction(null), 1200);
      return;
    }
    const parkingOtp = makeOtp();
    const expiresAt = Date.now() + HOLD_MS;
    setReservations((current) => ({ ...current, [spotId]: { spotId, userName: user.name, email: user.email, phone: user.email, expiresAt, parkingOtp, parkingOtpEmailStatus: 'sending', parkingVerified: false, parked: false } }));
    setAction({ title: 'Spot reserved', subtitle: 'Sending your parking OTP...' });
    sendEmail({ email: user.email, name: user.name, code: parkingOtp, type: 'parking', spotName: spot?.name || spotId })
      .then(() => {
        setReservations((current) => current[spotId] ? { ...current, [spotId]: { ...current[spotId], parkingOtpEmailStatus: 'sent' } } : current);
        setAction({ title: 'Parking OTP sent', subtitle: `Check ${user.email}` });
      })
      .catch(() => {
        setReservations((current) => current[spotId] ? { ...current, [spotId]: { ...current[spotId], parkingOtpEmailStatus: 'failed' } } : current);
        setAction({ title: 'Reserved locally', subtitle: 'OTP email failed, backup code is shown.' });
      })
      .finally(() => setTimeout(() => setAction(null), 1800));
  }

  function verifyParking(spotId) {
    setReservations((current) => current[spotId] ? { ...current, [spotId]: { ...current[spotId], parkingVerified: true } } : current);
  }

  function markParked(spotId) {
    const spot = initialSpots.find((item) => item.id === spotId);
    setReservations((current) => current[spotId] ? { ...current, [spotId]: { ...current[spotId], parked: true, parkedAt: Date.now() } } : current);
    setAction({ title: 'Status changed', subtitle: 'Spot is now occupied.' });
    sendEmail({ email: user.email, name: user.name, type: 'parked', spotName: spot?.name || spotId }).catch(() => null).finally(() => setTimeout(() => setAction(null), 1500));
  }

  function leaveSpot(spotId) {
    const spot = initialSpots.find((item) => item.id === spotId);
    setReservations((current) => { const next = { ...current }; delete next[spotId]; return next; });
    setAction({ title: 'Thanks for using ParkLink', subtitle: 'Spot is available again.' });
    sendEmail({ email: user.email, name: user.name, type: 'left', spotName: spot?.name || spotId }).catch(() => null).finally(() => setTimeout(() => setAction(null), 1500));
  }

  function addVehicle(vehicle) {
    setVehicles((current) => [...current, vehicle]);
    if (firebaseReady && user?.email) saveVehicleInFirebase(user.email, vehicle).catch(() => null);
  }

  function logout() {
    localStorage.removeItem('parklink-user');
    sessionStorage.removeItem('parklink-login-otp');
    sessionStorage.removeItem('parklink-pending-user');
    setUser(null);
    setPendingUser(null);
    setPhase('auth');
  }

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={requestOtp} />;
  if (phase === 'otp') return <OtpScreen user={pendingUser} onBack={() => setPhase('auth')} onComplete={completeOtp} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} reservations={reservations} user={user} now={now} activeReservationId={activeReservationId} onBack={() => setSelectedSpotId(null)} onReserve={reserveSpot} onVerifyParking={verifyParking} onPark={markParked} onLeave={leaveSpot} action={action} />;
  return <AppShell reservations={reservations} user={user} onOpenSpot={setSelectedSpotId} now={now} vehicles={vehicles} onAddVehicle={addVehicle} onLogout={logout} />;
}
