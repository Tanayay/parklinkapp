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
import { firebaseReady, releaseSpotInFirebase, reserveSpotInFirebase, saveVehicleInFirebase, subscribeReservations } from './firebase';

const RESERVATION_LENGTH_MS = 5 * 60 * 1000;
const PARKING_CODE = '246810';

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

function LogoMark() {
  return <div className="logo-mark"><span className="logo-ring" /><Car size={28} strokeWidth={2.4} /></div>;
}

function PhoneFrame({ children }) {
  return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>;
}

function LoadingScreen() {
  return <main className="loading-screen"><div className="orb orb-one" /><div className="orb orb-two" /><LogoMark /><h1>ParkLink</h1><p>Real-time parking, street, and mobility modules.</p><div className="loading-bar"><span /></div></main>;
}

function CoolLoader({ title = 'Loading ParkLink', subtitle = 'Syncing live modules...' }) {
  return <div className="cool-loader"><div className="loader-core"><span /><span /><span /></div><strong>{title}</strong><p>{subtitle}</p></div>;
}

function ActionOverlay({ action }) {
  if (!action) return null;
  return <div className="action-overlay"><CoolLoader title={action.title} subtitle={action.subtitle} /></div>;
}

function makeOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), code })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Could not send OTP email.');
      sessionStorage.setItem('parklink-login-otp', code);
      await onVerify({ name: name.trim(), email: email.trim() });
    } catch (err) {
      setError(err.message || 'Could not send OTP email.');
      setSending(false);
    }
  }

  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><LogoMark /><p className="eyebrow">Welcome to ParkLink</p><h1>What should we call you?</h1><p className="muted">Enter your email and ParkLinkAI will send a verification code.</p><label className="input-label" htmlFor="name">Name</label><div className="input-row"><UserRound size={18} /><input id="name" placeholder="Tanay" value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label" htmlFor="email">Email</label><div className="input-row"><ShieldCheck size={18} /><input id="email" type="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} /></div>{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={!ready || sending} onClick={submit}>{sending ? <><LoaderCircle className="spin" size={18} /> Sending OTP...</> : <>Send OTP to email <CheckCircle2 size={18} /></>}</button><div className="auth-grid"><div><ShieldCheck size={20} /><strong>Email OTP</strong><span>Sent from ParkLinkAI Gmail.</span></div><div><Database size={20} /><strong>Shared data</strong><span>{firebaseReady ? 'Reservations sync live.' : 'Local fallback active.'}</span></div></div></section></main></PhoneFrame>;
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

  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card compact-card screen-pop"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><p className="eyebrow">Verify email</p><h1>Enter code</h1><p className="muted">Code sent to <strong>{user.email}</strong>.</p><input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={code.length !== 6 || verifying} onClick={verifyCode}>{verifying ? <><LoaderCircle className="spin" size={18} /> Verifying...</> : <>Verify and open app <CheckCircle2 size={18} /></>}</button></section></main></PhoneFrame>;
}

function StatCard({ label, value, detail, icon: Icon }) {
  return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function RealMap({ spots: mapSpots, reservations, dropPin, setDropPin }) {
  return <section className="real-map-card glass-card"><iframe title="ParkLink real map" className="real-map" src="https://www.openstreetmap.org/export/embed.html?bbox=-117.8295%2C34.0516%2C-117.8154%2C34.0618&layer=mapnik&marker=34.0562%2C-117.8211" /><button className={dropPin ? 'drop-pin active' : 'drop-pin'} onClick={() => setDropPin(!dropPin)}><MapPin size={16} /> {dropPin ? 'Pin dropped' : 'Drop pin'}</button><div className="map-overlay-list">{mapSpots.map((spot) => <div key={spot.id} className={`mini-map-row ${getSpotState(spot, reservations)} ${dropPin && getSpotState(spot, reservations) === 'available' ? 'highlighted' : ''}`}><strong>{getSpotIcon(spot, 16)}</strong><span>{spot.name}</span></div>)}</div></section>;
}

function SpotCard({ spot, reservations, onSelect, now }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  return <button className={`spot-card glass-card spot-${state}`} onClick={() => onSelect(spot.id)}><div className={`spot-type-icon ${state}`}>{getSpotIcon(spot)}</div><div className="spot-main"><strong>{spot.name}</strong><span>{spot.type} • {spot.distance} • {spot.eta}</span>{reservation && <small className="reserved-line"><Timer size={13} /> {formatTime(reservation.expiresAt - now)} left</small>}</div><div className="spot-side"><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span></div></button>;
}

function SpotSection({ title, eyebrow, spots: sectionSpots, reservations, now, onOpenSpot }) {
  return <section className="list-section"><div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div><div className="spot-list">{sectionSpots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section>;
}

function HomeTab({ reservations, user, onOpenSpot, now }) {
  const openCount = initialSpots.filter((spot) => getSpotState(spot, reservations) === 'available').length;
  const reservedCount = Object.values(reservations).filter((item) => item.expiresAt > now).length;
  const recommended = initialSpots.filter((spot) => spot.recommended && getSpotState(spot, reservations) !== 'occupied');
  const frequent = initialSpots.filter((spot) => spot.frequent && getSpotState(spot, reservations) !== 'occupied');
  return <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {user.name || 'Driver'}</p><h1>Find the closest open spot.</h1><p>{firebaseReady ? 'Reservations sync through Firebase, with local fallback if the backend fails.' : 'Reservations are local until Firebase is ready.'}</p></div><div className="hero-badge"><Sparkles size={20} /><span>1 active hold max</span></div></section><div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value={openCount} detail="Available nearby" /><StatCard icon={Timer} label="Active holds" value={reservedCount} detail={firebaseReady ? 'Shared live' : 'This device'} /></div><SpotSection eyebrow="AI picked" title="Recommended spots" spots={recommended} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /><SpotSection eyebrow="Your history" title="Frequently visited" spots={frequent} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /></div>;
}

function MapTab({ reservations, onOpenSpot, now }) {
  const [dropPin, setDropPin] = useState(false);
  return <div className="tab-content"><div className="section-header map-title"><div><p className="eyebrow">Actual map</p><h2>Drop a pin to highlight modules</h2></div></div><RealMap spots={initialSpots} reservations={reservations} dropPin={dropPin} setDropPin={setDropPin} /><section className="list-section"><div className="section-header"><div><p className="eyebrow">Nearby pin results</p><h2>{dropPin ? 'Modules around your pin' : 'Nearby modules'}</h2></div></div><div className="spot-list">{initialSpots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function SpacesTab({ reservations, query, setQuery, onOpenSpot, now }) {
  const filtered = useMemo(() => initialSpots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase()) || getStatusLabel(spot, reservations).toLowerCase().includes(query.toLowerCase())), [query, reservations]);
  return <div className="tab-content"><div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function MobilityTab() {
  return <section className="activity-card glass-card tab-content"><div className="section-header"><div><p className="eyebrow">Mobility hub</p><h2>Bikes, scooters, boards</h2></div></div>{mobilityItems.map(({ icon: Icon, title, text }) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>;
}

function AiRecommendationCard({ location }) {
  const availability = location.availability;
  const level = availability >= 70 ? 'good' : availability >= 45 ? 'medium' : 'low';
  return <div className={`ai-result-card glass-card ${level}`}><div className="ai-score-ring"><strong>{availability}%</strong><span>{busyLabel(availability)}</span></div><div className="ai-result-main"><strong>{location.name}</strong><span>{location.area} • {location.bestLot}</span><small>{location.reason}</small><div className="ai-meta-row"><em>{location.walk}</em><em>{location.price}</em><em>{location.distance?.toFixed ? `${location.distance.toFixed(1)} mi` : 'nearby'}</em></div></div></div>;
}

function FutureDataTab() {
  const [locationQuery, setLocationQuery] = useState('Cal Poly Pomona');
  const [arrival, setArrival] = useState('10:30');
  const [departure, setDeparture] = useState('12:00');
  const [searchedPlace, setSearchedPlace] = useState({ name: 'Cal Poly Pomona' });
  const [realResults, setRealResults] = useState(fallbackParking);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const validTime = isValidTimeRange(arrival, departure);
  const rankedResults = useMemo(() => realResults.map((location, index) => ({ ...location, id: location.id || `result-${index}`, name: location.name.includes('near') ? location.name : `${location.name} near ${locationQuery}`, availability: predictAvailabilityByTime(arrival, departure, location.distance, location.capacity) })).sort((a, b) => b.availability - a.availability), [realResults, arrival, departure, locationQuery]);
  const best = rankedResults[0];
  async function searchRealParking() {
    if (!validTime) return;
    setLoading(true);
    setAiError('');
    setTimeout(() => {
      setSearchedPlace({ name: locationQuery });
      setRealResults(fallbackParking);
      setAiError('Showing prototype recommendations. Live map data can be connected later.');
      setLoading(false);
    }, 600);
  }
  return <section className="settings-list tab-content"><div className="profile-card glass-card"><Database size={34} /><div><p className="eyebrow">AI recommendations</p><h2>Search parking near a place</h2><span>Prototype predictions now; real ParkLink history later.</span></div></div><div className="ai-search-card glass-card"><label className="input-label" htmlFor="ai-location">Where are you going?</label><div className="input-row"><Search size={18} /><input id="ai-location" placeholder="Try Del Amo, CPP, LAX, Torrance City Hall..." value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} /></div><div className="time-grid"><label><span>Arrival time</span><input type="time" value={arrival} onChange={(event) => setArrival(event.target.value)} /></label><label><span>Leave time</span><input type="time" value={departure} onChange={(event) => setDeparture(event.target.value)} /></label></div>{!validTime && <p className="error-text">Leave time has to be after arrival time.</p>}<button className="primary-button" disabled={!validTime || loading} onClick={searchRealParking}>{loading ? <><LoaderCircle className="spin" size={18} /> Searching...</> : <>Find parking nearby <Search size={18} /></>}</button></div>{searchedPlace && <div className="setting-row glass-card"><MapPin size={20} /><div><strong>Showing results near</strong><span>{searchedPlace.name}</span></div></div>}{aiError && <p className="error-text reservation-warning">{aiError}</p>}<div className="data-grid"><StatCard icon={Clock} label="Arrival" value={arrival} detail="Adjusted by you" /><StatCard icon={Sparkles} label="Best option" value={best ? `${best.availability}%` : '--'} detail={best?.name || 'Search first'} /></div><div className="ai-results-list">{rankedResults.map((location) => <AiRecommendationCard key={location.id} location={location} />)}</div></section>;
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
  return <div className="vehicles-card glass-card"><div className="section-header"><div><p className="eyebrow">Vehicles</p><h2>Your vehicles</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><div className="input-row"><Car size={18} /><input placeholder="Nickname ex: Civic" value={vehicle.nickname} onChange={(e) => setVehicle({ ...vehicle, nickname: e.target.value })} /></div><div className="input-row vehicle-input"><Layers size={18} /><input placeholder="Plate" value={vehicle.plate} onChange={(e) => setVehicle({ ...vehicle, plate: e.target.value.toUpperCase() })} /></div><div className="time-grid"><label><span>Color</span><input value={vehicle.color} placeholder="Black" onChange={(e) => setVehicle({ ...vehicle, color: e.target.value })} /></label><label><span>Type</span><input value={vehicle.type} placeholder="Car" onChange={(e) => setVehicle({ ...vehicle, type: e.target.value })} /></label></div><button className="primary-button" onClick={addVehicle}>Save vehicle</button></div>}{vehicles.length === 0 && <p className="muted vehicle-empty">No vehicles added yet.</p>}{vehicles.map((item) => <div className="linked-user-row" key={item.id}><span>{item.type?.slice(0, 2).toUpperCase() || 'CA'}</span><div><strong>{item.nickname || item.plate || 'Vehicle'}</strong><small>{item.color || 'Color not set'} • {item.plate || 'No plate'}</small></div></div>)}</div>;
}

function SettingsTab({ user, linkedUsers, onAddUser, onSaveProfile, vehicles, onAddVehicle, onLogout }) {
  const [showAdd, setShowAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  function save() { onSaveProfile({ name: name.trim() || user.name, email }); setEdit(false); }
  return <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{user.name}</h2><span>{user.email}</span></div><button className="mini-button" onClick={() => setEdit(!edit)}>Edit</button><button className="mini-button" onClick={onLogout}>Log out</button></div>{edit && <div className="device-card glass-card"><label className="input-label">Name</label><div className="input-row"><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label">Email</label><div className="input-row"><ShieldCheck size={18} /><input value={email} onChange={(event) => setEmail(event.target.value)} /></div><button className="primary-button" onClick={save}>Save profile</button></div>}<VehicleManager vehicles={vehicles} onAddVehicle={onAddVehicle} /><div className="device-card glass-card"><div className="section-header"><div><p className="eyebrow">Device details</p><h2>This device</h2></div><ShieldCheck size={20} /></div><div className="device-row"><span>Login</span><strong>Email OTP</strong></div><div className="device-row"><span>Firebase</span><strong>{firebaseReady ? 'Connected' : 'Not configured'}</strong></div><div className="device-row"><span>Reservation sync</span><strong>{firebaseReady ? 'Realtime + fallback' : 'Local prototype only'}</strong></div><div className="device-row"><span>App version</span><strong>ParkLink v0.7</strong></div></div><div className="users-card glass-card"><div className="section-header"><div><p className="eyebrow">Multiple users</p><h2>Linked users</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><p>Real linked users need accounts in the backend. For now this adds a demo linked device card.</p><button className="primary-button" onClick={onAddUser}>Add demo user</button></div>}{linkedUsers.map((person) => <div key={person.id} className="linked-user-row"><span>{person.initials}</span><div><strong>{person.name}</strong><small>{person.email || person.phone}</small></div></div>)}</div></section>;
}

function NotificationCenter({ onClose }) {
  return <div className="notification-panel glass-card"><div className="section-header"><div><p className="eyebrow">Notifications</p><h2>ParkLink alerts</h2></div><button className="mini-button" onClick={onClose}>Close</button></div><div className="activity-row"><Bell size={18} /><div><strong>Reservation limit active</strong><span>You can hold one spot at a time to prevent spam reservations.</span></div></div><div className="activity-row"><ShieldCheck size={18} /><div><strong>Parking OTP ready</strong><span>Use code 246810 to confirm you reached your reserved spot.</span></div></div><div className="activity-row"><Database size={18} /><div><strong>Email OTP active</strong><span>Login codes send from ParkLinkAI Gmail.</span></div></div></div>;
}

function SpotDetail({ spot, reservations, user, onBack, onReserveAction, action, now, activeReservationId }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  const mine = reservation && reservation.email === user.email;
  const canReserve = state === 'available' && !activeReservationId;
  const canUnreserve = state === 'mine' && mine;
  const [parkingOtp, setParkingOtp] = useState('');
  const [parkingVerified, setParkingVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;
  function verifyParkingOtp() { if (parkingOtp === PARKING_CODE) { setParkingVerified(true); setOtpError(''); } else setOtpError('Wrong parking OTP. Demo code: 246810.'); }
  return <PhoneFrame><main className="app-shell phone-screen detail-shell"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><section className={`detail-hero glass-card detail-${state}`}><div className="detail-icon">{getSpotIcon(spot, 34)}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><p>{spot.note}</p>{reservation && <div className="reservation-banner"><Timer size={18} /><span>Reserved for {reservation.userName || user.name} • {formatTime(reservation.expiresAt - now)} left</span></div>}</section><section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>{activeReservationId && !canUnreserve && <p className="error-text reservation-warning">You already have a reserved spot. Unreserve it before holding another one.</p>}<button className="primary-button big-action" disabled={!canReserve && !canUnreserve} onClick={() => onReserveAction(spot.id)}>{canUnreserve ? 'Unreserve spot' : canReserve ? 'Reserve for 5 minutes' : 'Reservation unavailable'} <CheckCircle2 size={20} /></button>{reservation && <section className="parking-otp-card glass-card"><p className="eyebrow">Parking spot OTP</p><h2>Confirm arrival</h2><p>When you physically get to the reserved spot, enter the parking OTP. Demo code: <strong>246810</strong></p><div className="input-row"><ShieldCheck size={18} /><input placeholder="Parking OTP" inputMode="numeric" maxLength={6} value={parkingOtp} onChange={(event) => setParkingOtp(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /></div>{otpError && <p className="error-text">{otpError}</p>}{parkingVerified ? <div className="verified-pill"><CheckCircle2 size={16} /> Parking verified</div> : <button className="primary-button" disabled={parkingOtp.length !== 6} onClick={verifyParkingOtp}>Verify parking OTP</button>}</section>}<button className="primary-button big-action navigation-action" onClick={() => window.open(mapsUrl, '_blank', 'noopener,noreferrer')}><Navigation size={20} /> Start navigation</button><ActionOverlay action={action} /></main></PhoneFrame>;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'mobility', label: 'Mobility', icon: Bike },
  { id: 'data', label: 'AI Recs', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppShell({ reservations, user, linkedUsers, onAddUser, onOpenSpot, now, onSaveProfile, vehicles, onAddVehicle, onLogout }) {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const tabLabel = tabs.find((tab) => tab.id === activeTab)?.label || 'Home';
  return <PhoneFrame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{tabLabel}</span></div></div><button className="icon-button bell-button" onClick={() => setNotificationsOpen(!notificationsOpen)}><Bell size={20} /><span /></button></header>{notificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}{activeTab === 'home' && <HomeTab reservations={reservations} user={user} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'map' && <MapTab reservations={reservations} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'spaces' && <SpacesTab reservations={reservations} query={query} setQuery={setQuery} onOpenSpot={onOpenSpot} now={now} />}{activeTab === 'mobility' && <MobilityTab />}{activeTab === 'data' && <FutureDataTab />}{activeTab === 'settings' && <SettingsTab user={user} linkedUsers={linkedUsers} onAddUser={onAddUser} onSaveProfile={onSaveProfile} vehicles={vehicles} onAddVehicle={onAddVehicle} onLogout={onLogout} />}<nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={`tab-button ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}><Icon size={18} /><span>{label}</span></button>)}</nav></main></PhoneFrame>;
}

export default function AppStable() {
  const storedUser = localStorage.getItem('parklink-user');
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(() => storedUser ? JSON.parse(storedUser) : null);
  const [pendingUser, setPendingUser] = useState(() => JSON.parse(sessionStorage.getItem('parklink-pending-user') || 'null'));
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [reservations, setReservations] = useState(() => JSON.parse(localStorage.getItem('parklink-reservations') || '{}'));
  const [vehicles, setVehicles] = useState(() => JSON.parse(localStorage.getItem('parklink-vehicles') || '[]'));
  const [linkedUsers, setLinkedUsers] = useState([{ id: 'main', name: 'You', email: 'This device', initials: 'YO' }]);
  const [action, setAction] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { const timer = setTimeout(() => setPhase(user ? 'home' : pendingUser ? 'otp' : 'auth'), 1000); return () => clearTimeout(timer); }, []);
  useEffect(() => { const tick = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(tick); }, []);
  useEffect(() => { if (user) localStorage.setItem('parklink-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('parklink-vehicles', JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem('parklink-reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { setReservations((current) => Object.fromEntries(Object.entries(current).filter(([, value]) => value.expiresAt > now))); }, [now]);
  useEffect(() => { if (!firebaseReady) return undefined; return subscribeReservations((cloudReservations) => setReservations((current) => ({ ...current, ...cloudReservations }))); }, []);

  const selectedSpot = initialSpots.find((spot) => spot.id === selectedSpotId);
  const activeReservationId = Object.entries(reservations).find(([, value]) => value.expiresAt > now && value.email === user?.email)?.[0] || null;

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

  async function handleReservation(spotId) {
    const reservation = getReservation(spotId, reservations);
    const reserving = !reservation;
    if (reserving && activeReservationId) { setAction({ title: 'Reservation limit', subtitle: 'Unreserve your current spot before holding another.' }); setTimeout(() => setAction(null), 1200); return; }
    setAction({ title: reserving ? 'Reserving spot' : 'Unreserving spot', subtitle: reserving ? 'Starting your 5 minute hold...' : 'Releasing this space back to the lot...' });
    const expiresAt = Date.now() + RESERVATION_LENGTH_MS;
    setReservations((current) => { const next = { ...current }; if (reserving) next[spotId] = { spotId, userName: user.name, email: user.email, phone: user.email, expiresAt }; else delete next[spotId]; return next; });
    if (firebaseReady) {
      try {
        if (reserving) await reserveSpotInFirebase({ spotId, userName: user.name, phone: user.email, expiresAt });
        else await releaseSpotInFirebase(spotId);
      } catch (error) {
        setAction({ title: 'Saved locally', subtitle: 'Firebase sync failed, but the button still works on this device.' });
      }
    }
    setTimeout(() => setAction(null), 1400);
  }

  function handleAddUser() {
    const count = linkedUsers.length + 1;
    setLinkedUsers((current) => [...current, { id: `linked-${count}`, name: `Linked User ${count}`, email: 'Invited device', initials: `U${count}` }]);
  }

  function handleAddVehicle(vehicle) {
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
  if (selectedSpot) return <SpotDetail spot={selectedSpot} reservations={reservations} user={user} now={now} activeReservationId={activeReservationId} onBack={() => setSelectedSpotId(null)} onReserveAction={handleReservation} action={action} />;
  return <AppShell reservations={reservations} user={user} linkedUsers={linkedUsers} onAddUser={handleAddUser} onSaveProfile={setUser} onOpenSpot={setSelectedSpotId} now={now} vehicles={vehicles} onAddVehicle={handleAddVehicle} onLogout={logout} />;
}
