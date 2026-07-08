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

const recLocations = [
  { id: 'cpp', name: 'Cal Poly Pomona', area: 'Campus lots', bestLot: 'Lot A / Structure B', keywords: 'cpp cal poly pomona campus bronco lot structure', base: 72, walk: '3-6 min', price: 'Free-$2/hr', reason: 'best for student parking and ParkLink module testing' },
  { id: 'delamo', name: 'Del Amo Fashion Center', area: 'Mall parking', bestLot: 'North structure', keywords: 'del amo mall torrance shopping fashion center', base: 78, walk: '2-5 min', price: 'Free', reason: 'good turnover and multiple structure entrances' },
  { id: 'torrance', name: 'Downtown Torrance', area: 'Street parking', bestLot: 'Sartori / El Prado area', keywords: 'torrance downtown street parking old town', base: 62, walk: '4-8 min', price: 'Free-metered', reason: 'good for street module and sweeper scheduling demos' },
  { id: 'lbairport', name: 'Long Beach Airport', area: 'Airport parking', bestLot: 'Cell phone / short term area', keywords: 'long beach airport lgb airport parking', base: 58, walk: '5-10 min', price: '$2-$4/hr', reason: 'useful airport flow and short-term parking test area' },
  { id: 'beach', name: 'Redondo Beach Pier', area: 'Beach parking', bestLot: 'Pier garage', keywords: 'redondo beach pier ocean parking', base: 54, walk: '6-12 min', price: '$2+/hr', reason: 'good for high-demand event and weekend predictions' },
  { id: 'carson', name: 'City of Carson Civic Center', area: 'Civic parking', bestLot: 'City hall surface lot', keywords: 'carson city hall civic center parking', base: 69, walk: '2-6 min', price: 'Free', reason: 'clean city pilot style use case' }
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

function predictAvailability(location, arrival, departure) {
  const arrivalHour = getHour(arrival);
  const duration = Math.max(0.5, getHour(departure) - arrivalHour);
  let score = location.base;
  if (!isValidTimeRange(arrival, departure)) return 0;
  if (arrivalHour >= 7 && arrivalHour <= 10) score -= 18;
  if (arrivalHour >= 11 && arrivalHour <= 14) score -= 10;
  if (arrivalHour >= 17 && arrivalHour <= 20) score -= 14;
  if (arrivalHour >= 21 || arrivalHour <= 6) score += 12;
  if (duration > 3) score -= 7;
  if (location.id === 'beach' && arrivalHour >= 11 && arrivalHour <= 16) score -= 12;
  if (location.id === 'delamo' && arrivalHour >= 16 && arrivalHour <= 19) score -= 9;
  if (location.id === 'cpp' && arrivalHour >= 8 && arrivalHour <= 11) score -= 11;
  return Math.max(18, Math.min(96, Math.round(score)));
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

function CoolLoader({ title = 'Loading ParkLink', subtitle = 'Syncing live modules...' }) {
  return <div className="cool-loader"><div className="loader-core"><span /><span /><span /></div><strong>{title}</strong><p>{subtitle}</p></div>;
}

function LoadingScreen() {
  return <main className="loading-screen"><div className="orb orb-one" /><div className="orb orb-two" /><LogoMark /><h1>ParkLink</h1><p>Real-time parking, street, and mobility modules.</p><div className="loading-bar"><span /></div></main>;
}

function ActionOverlay({ action }) {
  if (!action) return null;
  return <div className="action-overlay"><CoolLoader title={action.title} subtitle={action.subtitle} /></div>;
}

function AuthScreen({ onVerify }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const ready = name.trim().length > 1 && phone.replace(/[^0-9]/g, '').length === 10;
  function submit() { setSending(true); setTimeout(() => onVerify({ name: name.trim(), phone }), 1050); }
  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><LogoMark /><p className="eyebrow">Welcome to ParkLink</p><h1>What should we call you?</h1><p className="muted">Your name appears on the home page and future reservation records.</p><label className="input-label" htmlFor="name">Name</label><div className="input-row"><UserRound size={18} /><input id="name" placeholder="Tanay" value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label" htmlFor="phone">Phone number</label><div className="input-row"><Phone size={18} /><input id="phone" type="tel" inputMode="numeric" placeholder="(310) 555-0198" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} /></div><button className="primary-button" disabled={!ready || sending} onClick={submit}>{sending ? <><LoaderCircle className="spin" size={18} /> Sending code...</> : <>Send verification code <ChevronRight size={18} /></>}</button><div className="auth-grid"><div><ShieldCheck size={20} /><strong>Phone code</strong><span>Demo login OTP for now.</span></div><div><LockKeyhole size={20} /><strong>Real OTP next</strong><span>Needs Firebase/Twilio backend.</span></div></div></section></main></PhoneFrame>;
}

function OtpScreen({ user, onComplete, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  function verifyCode() { setVerifying(true); setTimeout(() => { if (code === DEMO_CODE) { setError(''); onComplete(); } else { setVerifying(false); setError('Wrong code. For now, use 123456.'); } }, 900); }
  return <PhoneFrame><main className="auth-shell phone-screen"><section className="auth-card glass-card compact-card screen-pop"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><p className="eyebrow">Verify phone</p><h1>Enter code</h1><p className="muted">Prototype verification for <strong>{user.phone}</strong>.</p><input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /><div className="demo-code">Demo code: <strong>123456</strong></div>{error && <p className="error-text">{error}</p>}<button className="primary-button" disabled={code.length !== 6 || verifying} onClick={verifyCode}>{verifying ? <><LoaderCircle className="spin" size={18} /> Opening app...</> : <>Verify and open app <CheckCircle2 size={18} /></>}</button></section></main></PhoneFrame>;
}

function StatCard({ label, value, detail, icon: Icon }) {
  return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function RealMap({ spots, reservations, dropPin, setDropPin }) {
  return <section className="real-map-card glass-card"><iframe title="ParkLink real map" className="real-map" src="https://www.openstreetmap.org/export/embed.html?bbox=-117.8295%2C34.0516%2C-117.8154%2C34.0618&layer=mapnik&marker=34.0562%2C-117.8211" /><button className={dropPin ? 'drop-pin active' : 'drop-pin'} onClick={() => setDropPin(!dropPin)}><MapPin size={16} /> {dropPin ? 'Pin dropped' : 'Drop pin'}</button><div className="map-overlay-list">{spots.map((spot) => <div key={spot.id} className={`mini-map-row ${getSpotState(spot, reservations)} ${dropPin && getSpotState(spot, reservations) === 'available' ? 'highlighted' : ''}`}><strong>{getSpotIcon(spot, 16)}</strong><span>{spot.name}</span></div>)}</div></section>;
}

function SpotCard({ spot, reservations, onSelect, now }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  return <button className={`spot-card glass-card spot-${state}`} onClick={() => onSelect(spot.id)}><div className={`spot-type-icon ${state}`}>{getSpotIcon(spot)}</div><div className="spot-main"><strong>{spot.name}</strong><span>{spot.type} • {spot.distance} • {spot.eta}</span>{reservation && <small className="reserved-line"><Timer size={13} /> {formatTime(reservation.expiresAt - now)} left</small>}</div><div className="spot-side"><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><ChevronRight size={18} /></div></button>;
}

function SpotSection({ title, eyebrow, spots, reservations, now, onOpenSpot }) {
  return <section className="list-section"><div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section>;
}

function HomeTab({ spots, reservations, user, onOpenSpot, now }) {
  const openCount = spots.filter((spot) => getSpotState(spot, reservations) === 'available').length;
  const reservedCount = Object.values(reservations).filter((item) => item.expiresAt > now).length;
  const recommended = spots.filter((spot) => spot.recommended && getSpotState(spot, reservations) !== 'occupied');
  const frequent = spots.filter((spot) => spot.frequent && getSpotState(spot, reservations) !== 'occupied');
  return <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {user.name || 'Driver'}</p><h1>Find the closest open spot.</h1><p>Reserve one space for 5 minutes while you walk or drive there.</p></div><div className="hero-badge"><Sparkles size={20} /><span>1 active hold max</span></div></section><div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value={openCount} detail="Available nearby" /><StatCard icon={Timer} label="Active holds" value={reservedCount} detail="This device" /></div><SpotSection eyebrow="AI picked" title="Recommended spots" spots={recommended} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /><SpotSection eyebrow="Your history" title="Frequently visited" spots={frequent} reservations={reservations} now={now} onOpenSpot={onOpenSpot} /></div>;
}

function MapTab({ spots, reservations, onOpenSpot, now }) {
  const [dropPin, setDropPin] = useState(false);
  return <div className="tab-content"><div className="section-header map-title"><div><p className="eyebrow">Actual map</p><h2>Drop a pin to highlight modules</h2></div></div><RealMap spots={spots} reservations={reservations} dropPin={dropPin} setDropPin={setDropPin} /><section className="list-section"><div className="section-header"><div><p className="eyebrow">Nearby pin results</p><h2>{dropPin ? 'Modules around your pin' : 'Nearby modules'}</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function SpacesTab({ spots, reservations, query, setQuery, onOpenSpot, now }) {
  const filtered = useMemo(() => spots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase()) || getStatusLabel(spot, reservations).toLowerCase().includes(query.toLowerCase())), [spots, query, reservations]);
  return <div className="tab-content"><div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} reservations={reservations} now={now} onSelect={onOpenSpot} />)}</div></section></div>;
}

function MobilityTab() {
  return <section className="activity-card glass-card tab-content"><div className="section-header"><div><p className="eyebrow">Mobility hub</p><h2>Bikes, scooters, boards</h2></div></div>{mobilityItems.map(({ icon: Icon, title, text }) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>;
}

function AiRecommendationCard({ location, arrival, departure }) {
  const availability = predictAvailability(location, arrival, departure);
  const level = availability >= 70 ? 'good' : availability >= 45 ? 'medium' : 'low';
  return <div className={`ai-result-card glass-card ${level}`}><div className="ai-score-ring"><strong>{availability}%</strong><span>open</span></div><div className="ai-result-main"><strong>{location.name}</strong><span>{location.area} • {location.bestLot}</span><small>{location.reason}</small><div className="ai-meta-row"><em>{location.walk}</em><em>{location.price}</em></div></div></div>;
}

function FutureDataTab() {
  const [locationQuery, setLocationQuery] = useState('Cal Poly Pomona');
  const [arrival, setArrival] = useState('10:30');
  const [departure, setDeparture] = useState('12:00');
  const [searched, setSearched] = useState('Cal Poly Pomona');
  const validTime = isValidTimeRange(arrival, departure);
  const filteredLocations = useMemo(() => {
    const query = searched.trim().toLowerCase();
    const matches = recLocations.filter((location) => !query || location.name.toLowerCase().includes(query) || location.area.toLowerCase().includes(query) || location.keywords.includes(query));
    return (matches.length ? matches : recLocations).map((location) => ({ ...location, availability: predictAvailability(location, arrival, departure) })).sort((a, b) => b.availability - a.availability);
  }, [searched, arrival, departure]);
  const best = filteredLocations[0];
  return <section className="settings-list tab-content"><div className="profile-card glass-card"><Database size={34} /><div><p className="eyebrow">AI recommendations</p><h2>Search a destination</h2><span>Mock predictions for where parking should work best.</span></div></div><div className="ai-search-card glass-card"><label className="input-label" htmlFor="ai-location">Specific location</label><div className="input-row"><Search size={18} /><input id="ai-location" placeholder="Try Del Amo, Torrance, CPP..." value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} /></div><div className="time-grid"><label><span>Arrival time</span><input type="time" value={arrival} onChange={(event) => setArrival(event.target.value)} /></label><label><span>Leave time</span><input type="time" value={departure} onChange={(event) => setDeparture(event.target.value)} /></label></div>{!validTime && <p className="error-text">Leave time has to be after arrival time.</p>}<button className="primary-button" disabled={!validTime} onClick={() => setSearched(locationQuery)}>Find recommendations</button></div><div className="data-grid"><StatCard icon={Clock} label="Arrival" value={arrival} detail="Adjusted by you" /><StatCard icon={Sparkles} label="Best pick" value={`${best?.availability || 0}%`} detail={best?.name || 'Search first'} /></div><div className="ai-results-list">{filteredLocations.map((location) => <AiRecommendationCard key={location.id} location={location} arrival={arrival} departure={departure} />)}</div><div className="setting-row glass-card"><Waves size={20} /><div><strong>Availability by area</strong><span>Prototype prediction only. Real accuracy needs live module history, events, traffic, and backend data.</span></div></div></section>;
}

function SettingsTab({ user, linkedUsers, onAddUser, onSaveProfile }) {
  const [showAdd, setShowAdd] = useState(false);
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  function save() { onSaveProfile({ name: name.trim() || user.name, phone }); setEdit(false); }
  return <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{user.name}</h2><span>{user.phone}</span></div><button className="mini-button" onClick={() => setEdit(!edit)}>Edit</button></div>{edit && <div className="device-card glass-card"><label className="input-label">Name</label><div className="input-row"><UserRound size={18} /><input value={name} onChange={(event) => setName(event.target.value)} /></div><label className="input-label">Phone</label><div className="input-row"><Phone size={18} /><input value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} /></div><button className="primary-button" onClick={save}>Save profile</button></div>}<div className="device-card glass-card"><div className="section-header"><div><p className="eyebrow">Device details</p><h2>This device</h2></div><Phone size={20} /></div><div className="device-row"><span>Device type</span><strong>Mobile web preview</strong></div><div className="device-row"><span>Reservation sync</span><strong>Local prototype only</strong></div><div className="device-row"><span>Backend needed</span><strong>Realtime multi-device</strong></div><div className="device-row"><span>App version</span><strong>ParkLink v0.3</strong></div></div><div className="users-card glass-card"><div className="section-header"><div><p className="eyebrow">Multiple users</p><h2>Linked users</h2></div><button className="mini-button" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add</button></div>{showAdd && <div className="add-user-panel"><p>Real linked users need accounts in the backend. For now this adds a demo linked device card.</p><button className="primary-button" onClick={onAddUser}>Add demo user</button></div>}{linkedUsers.map((person) => <div key={person.id} className="linked-user-row"><span>{person.initials}</span><div><strong>{person.name}</strong><small>{person.phone}</small></div></div>)}</div><div className="setting-row glass-card"><Navigation size={20} /><div><strong>Route preferences</strong><span>Open Google Maps when navigation starts.</span></div></div></section>;
}

function NotificationCenter({ onClose }) {
  return <div className="notification-panel glass-card"><div className="section-header"><div><p className="eyebrow">Notifications</p><h2>ParkLink alerts</h2></div><button className="mini-button" onClick={onClose}>Close</button></div><div className="activity-row"><Bell size={18} /><div><strong>Reservation limit active</strong><span>You can hold one spot at a time to prevent spam reservations.</span></div></div><div className="activity-row"><ShieldCheck size={18} /><div><strong>Parking OTP ready</strong><span>Use code 246810 to confirm you reached your reserved spot.</span></div></div><div className="activity-row"><Database size={18} /><div><strong>Realtime sync pending</strong><span>Needs backend before another phone can instantly see the same reservation.</span></div></div></div>;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'mobility', label: 'Mobility', icon: Bike },
  { id: 'data', label: 'AI Recs', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppShell({ spots, reservations, user, linkedUsers, onAddUser, onOpenSpot, now, onSaveProfile }) {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');
  const [transition, setTransition] = useState(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;
  function switchTab(tabId, label) { if (tabId === activeTab) return; setTransition({ title: `Opening ${label}`, subtitle: 'Rebuilding your ParkLink view...' }); setTimeout(() => setActiveTab(tabId), 260); setTimeout(() => setTransition(null), 850); }
  return <PhoneFrame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{activeLabel}</span></div></div><button className="icon-button bell-button" onClick={() => setNotificationsOpen(true)}><Bell size={20} /><span /></button></header>{notificationsOpen && <NotificationCenter onClose={() => setNotificationsOpen(false)} />}<div key={activeTab} className="animated-tab-wrap">{activeTab === 'home' && <HomeTab spots={spots} reservations={reservations} user={user} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'map' && <MapTab spots={spots} reservations={reservations} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'spaces' && <SpacesTab spots={spots} reservations={reservations} query={query} setQuery={setQuery} now={now} onOpenSpot={onOpenSpot} />}{activeTab === 'mobility' && <MobilityTab />}{activeTab === 'data' && <FutureDataTab />}{activeTab === 'settings' && <SettingsTab user={user} linkedUsers={linkedUsers} onAddUser={onAddUser} onSaveProfile={onSaveProfile} />}</div><nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'tab-button active' : 'tab-button'} onClick={() => switchTab(id, label)}><Icon size={18} /><span>{label}</span></button>)}</nav><ActionOverlay action={transition} /></main></PhoneFrame>;
}

function SpotDetail({ spot, reservations, user, onBack, onReserveAction, action, now, activeReservationId }) {
  const state = getSpotState(spot, reservations);
  const reservation = getReservation(spot.id, reservations);
  const canReserve = state === 'available' && !activeReservationId;
  const canUnreserve = state === 'mine';
  const [parkingOtp, setParkingOtp] = useState('');
  const [parkingVerified, setParkingVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;
  function startNavigation() { window.open(mapsUrl, '_blank', 'noopener,noreferrer'); }
  function verifyParkingOtp() { if (parkingOtp === PARKING_CODE) { setParkingVerified(true); setOtpError(''); } else setOtpError('Wrong parking OTP. Demo code: 246810.'); }
  return <PhoneFrame><main className="app-shell phone-screen detail-shell"><button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button><section className={`detail-hero glass-card detail-${state}`}><div className="detail-icon">{getSpotIcon(spot, 34)}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={`tag ${state}-tag`}>{getStatusLabel(spot, reservations)}</span><p>{spot.note}</p>{reservation && <div className="reservation-banner"><Timer size={18} /><span>Reserved for {user.name} • {formatTime(reservation.expiresAt - now)} left</span></div>}</section><section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>{activeReservationId && !canUnreserve && <p className="error-text reservation-warning">You already have a reserved spot. Unreserve it before holding another one.</p>}<button className="primary-button big-action" disabled={!canReserve && !canUnreserve} onClick={() => onReserveAction(spot.id)}>{canUnreserve ? 'Unreserve spot' : canReserve ? 'Reserve for 5 minutes' : 'Reservation unavailable'} <CheckCircle2 size={20} /></button>{reservation && <section className="parking-otp-card glass-card"><p className="eyebrow">Parking spot OTP</p><h2>Confirm arrival</h2><p>When you physically get to the reserved spot, enter the parking OTP. Demo code: <strong>246810</strong></p><div className="input-row"><ShieldCheck size={18} /><input placeholder="Parking OTP" inputMode="numeric" maxLength={6} value={parkingOtp} onChange={(event) => setParkingOtp(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} /></div>{otpError && <p className="error-text">{otpError}</p>}{parkingVerified ? <div className="verified-pill"><CheckCircle2 size={16} /> Parking verified</div> : <button className="primary-button" disabled={parkingOtp.length !== 6} onClick={verifyParkingOtp}>Verify parking OTP</button>}</section>}<button className="primary-button big-action navigation-action" onClick={startNavigation}><Navigation size={20} /> Start navigation</button><ActionOverlay action={action} /></main></PhoneFrame>;
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('parklink-user') || '{"name":"Tanay","phone":"(310) 555-0198"}'));
  const [pendingUser, setPendingUser] = useState(user);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [reservations, setReservations] = useState(() => JSON.parse(localStorage.getItem('parklink-reservations') || '{}'));
  const [linkedUsers, setLinkedUsers] = useState([{ id: 'main', name: 'You', phone: 'This device', initials: 'YO' }]);
  const [action, setAction] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setTimeout(() => setPhase('auth'), 1000); return () => clearTimeout(timer); }, []);
  useEffect(() => { localStorage.setItem('parklink-user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('parklink-reservations', JSON.stringify(reservations)); }, [reservations]);
  useEffect(() => { const tick = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(tick); }, []);
  useEffect(() => { setReservations((current) => Object.fromEntries(Object.entries(current).filter(([, value]) => value.expiresAt > now))); }, [now]);
  const selectedSpot = initialSpots.find((spot) => spot.id === selectedSpotId);
  const activeReservationId = Object.entries(reservations).find(([, value]) => value.expiresAt > now)?.[0] || null;
  function handleReservation(spotId) {
    const reservation = getReservation(spotId, reservations);
    const reserving = !reservation;
    if (reserving && activeReservationId) { setAction({ title: 'Reservation limit', subtitle: 'Unreserve your current spot before holding another.' }); setTimeout(() => setAction(null), 1200); return; }
    setAction({ title: reserving ? 'Reserving spot' : 'Unreserving spot', subtitle: reserving ? 'Starting your 5 minute hold...' : 'Releasing this space back to the lot...' });
    setTimeout(() => { setReservations((current) => { const next = { ...current }; if (reserving) next[spotId] = { userName: user.name, expiresAt: Date.now() + RESERVATION_LENGTH_MS }; else delete next[spotId]; return next; }); }, 700);
    setTimeout(() => setAction(null), 1300);
  }
  function handleAddUser() { const count = linkedUsers.length + 1; setLinkedUsers((current) => [...current, { id: `linked-${count}`, name: `Linked User ${count}`, phone: 'Invited device', initials: `U${count}` }]); }
  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={(value) => { setPendingUser(value); setPhase('otp'); }} />;
  if (phase === 'otp') return <OtpScreen user={pendingUser} onBack={() => setPhase('auth')} onComplete={() => { setUser(pendingUser); setPhase('home'); }} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} reservations={reservations} user={user} now={now} activeReservationId={activeReservationId} onBack={() => setSelectedSpotId(null)} onReserveAction={handleReservation} action={action} />;
  return <AppShell spots={initialSpots} reservations={reservations} user={user} linkedUsers={linkedUsers} onAddUser={handleAddUser} onSaveProfile={setUser} onOpenSpot={setSelectedSpotId} now={now} />;
}
