import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bike,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Home,
  Layers,
  LoaderCircle,
  LocateFixed,
  LockKeyhole,
  Map,
  MapPin,
  Navigation,
  Phone,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Waves,
  Zap
} from 'lucide-react';

const DEMO_CODE = '123456';

const demoUsers = [
  { id: 'tanay', name: 'Tanay', phone: '(310) 555-0198', initials: 'TS' },
  { id: 'joseph', name: 'Joseph', phone: '(424) 555-0112', initials: 'JK' },
  { id: 'demo', name: 'Demo Rider', phone: '(562) 555-0177', initials: 'DR' }
];

const initialSpots = [
  { id: 'A1', name: 'Lot A - Spot A1', distance: '0.2 mi', status: 'Available', type: 'Standard', confidence: 98, eta: '2 min', note: 'Closest open module near the main entrance.', reservedBy: null },
  { id: 'A2', name: 'Lot A - Spot A2', distance: '0.2 mi', status: 'Occupied', type: 'Standard', confidence: 96, eta: '2 min', note: 'Vehicle detected by LiDAR module.', reservedBy: null },
  { id: 'B4', name: 'Structure B - Level 2', distance: '0.4 mi', status: 'Available', type: 'EV Ready', confidence: 94, eta: '4 min', note: 'Near elevator and future charging module zone.', reservedBy: 'joseph' },
  { id: 'R2', name: 'Bike Rack Module R2', distance: '0.5 mi', status: 'Available', type: 'Bike / Scooter', confidence: 91, eta: '5 min', note: 'Rack module has open capacity for bikes and scooters.', reservedBy: null }
];

const modules = [
  { icon: Car, title: 'Parking modules', text: 'Spot-level availability for lots and structures.' },
  { icon: Waves, title: 'Street sweeper modules', text: 'Future city feature for route and curb monitoring.' },
  { icon: Bike, title: 'Bike rack modules', text: 'Open rack capacity for bikes and scooters.' }
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

function getUser(users, id) {
  return users.find((user) => user.id === id);
}

function getSpotState(spot, activeUserId) {
  if (spot.status === 'Occupied') return 'occupied';
  if (spot.reservedBy === activeUserId) return 'mine';
  if (spot.reservedBy) return 'reserved';
  return 'available';
}

function getStatusLabel(spot, activeUserId) {
  const state = getSpotState(spot, activeUserId);
  if (state === 'mine') return 'Reserved by you';
  if (state === 'reserved') return 'Reserved';
  if (state === 'occupied') return 'Occupied';
  return 'Available';
}

function LogoMark() {
  return <div className="logo-mark"><span className="logo-ring" /><Car size={28} strokeWidth={2.4} /></div>;
}

function PhoneFrame({ children }) {
  return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>;
}

function CoolLoader({ title = 'Loading ParkLink', subtitle = 'Syncing live modules...' }) {
  return (
    <div className="cool-loader">
      <div className="loader-core"><span /><span /><span /></div>
      <strong>{title}</strong>
      <p>{subtitle}</p>
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="orb orb-one" /><div className="orb orb-two" />
      <LogoMark />
      <h1>ParkLink</h1>
      <p>Real-time parking, street, and mobility modules.</p>
      <div className="loading-bar"><span /></div>
    </main>
  );
}

function ActionOverlay({ action }) {
  if (!action) return null;
  return (
    <div className="action-overlay">
      <CoolLoader title={action.title} subtitle={action.subtitle} />
    </div>
  );
}

function AuthScreen({ onVerify }) {
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const ready = phone.replace(/[^0-9]/g, '').length === 10;

  function submit() {
    setSending(true);
    setTimeout(() => onVerify(phone), 1050);
  }

  return (
    <PhoneFrame>
      <main className="auth-shell phone-screen">
        <section className="auth-card glass-card screen-pop">
          <LogoMark />
          <p className="eyebrow">Welcome to ParkLink</p>
          <h1>Find parking before you arrive.</h1>
          <p className="muted">Use your phone number to enter the ParkLink mobile prototype.</p>
          <label className="input-label" htmlFor="phone">Phone number</label>
          <div className="input-row">
            <Phone size={18} />
            <input id="phone" type="tel" inputMode="numeric" placeholder="(310) 555-0198" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
          </div>
          <button className="primary-button" disabled={!ready || sending} onClick={submit}>
            {sending ? <><LoaderCircle className="spin" size={18} /> Sending code...</> : <>Send verification code <ChevronRight size={18} /></>}
          </button>
          <div className="auth-grid">
            <div><ShieldCheck size={20} /><strong>Phone code</strong><span>6-digit prototype verification.</span></div>
            <div><LockKeyhole size={20} /><strong>No password</strong><span>Cleaner for a mobile app.</span></div>
          </div>
        </section>
      </main>
    </PhoneFrame>
  );
}

function OtpScreen({ phone, onComplete, onBack }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);

  function verifyCode() {
    setVerifying(true);
    setTimeout(() => {
      if (code === DEMO_CODE) {
        setError('');
        onComplete();
      } else {
        setVerifying(false);
        setError('Wrong code. For now, use 123456.');
      }
    }, 1100);
  }

  return (
    <PhoneFrame>
      <main className="auth-shell phone-screen">
        <section className="auth-card glass-card compact-card screen-pop">
          <button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
          <p className="eyebrow">Verify phone</p>
          <h1>Enter code</h1>
          <p className="muted">Prototype verification for <strong>{phone}</strong>.</p>
          <input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
          <div className="demo-code">Demo code: <strong>123456</strong></div>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" disabled={code.length !== 6 || verifying} onClick={verifyCode}>
            {verifying ? <><LoaderCircle className="spin" size={18} /> Opening app...</> : <>Verify and open app <CheckCircle2 size={18} /></>}
          </button>
        </section>
      </main>
    </PhoneFrame>
  );
}

function StatCard({ label, value, detail, icon: Icon }) {
  return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function MapView({ spots, activeUserId, large = false }) {
  return (
    <div className={large ? 'map-surface large-map' : 'map-surface'}>
      <div className="street street-one" /><div className="street street-two" /><div className="lot-outline" />
      {spots.map((spot, index) => <button key={spot.id} className={`map-pin pin-${index + 1} ${getSpotState(spot, activeUserId)}`}>{spot.id}</button>)}
      <div className="user-dot"><LocateFixed size={18} /></div>
    </div>
  );
}

function SpotCard({ spot, activeUserId, users, onSelect }) {
  const state = getSpotState(spot, activeUserId);
  const reservedUser = getUser(users, spot.reservedBy);
  return (
    <button className={`spot-card glass-card spot-${state}`} onClick={() => onSelect(spot.id)}>
      <div className={`status-dot ${state}`} />
      <div className="spot-main">
        <strong>{spot.name}</strong>
        <span>{spot.type} • {spot.distance} • {spot.eta}</span>
        {reservedUser && <small className="reserved-line">Held by {reservedUser.name}</small>}
      </div>
      <div className="spot-side"><span className={`tag ${state}-tag`}>{getStatusLabel(spot, activeUserId)}</span><ChevronRight size={18} /></div>
    </button>
  );
}

function HomeTab({ spots, activeUser, users, onOpenSpot }) {
  const openCount = spots.filter((spot) => getSpotState(spot, activeUser.id) === 'available').length;
  const mineCount = spots.filter((spot) => getSpotState(spot, activeUser.id) === 'mine').length;

  return (
    <div className="tab-content">
      <section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {activeUser.name}</p><h1>Find the closest open spot.</h1><p>Multiple users can reserve and release live prototype spots.</p></div><div className="hero-badge"><Sparkles size={20} /><span>Reservations live</span></div></section>
      <div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value={openCount} detail="Available nearby" /><StatCard icon={CheckCircle2} label="Your reservations" value={mineCount} detail="Held by this user" /></div>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Recommended</p><h2>Best spaces near you</h2></div></div><div className="spot-list">{spots.filter((spot) => getSpotState(spot, activeUser.id) !== 'occupied').map((spot) => <SpotCard key={spot.id} spot={spot} users={users} activeUserId={activeUser.id} onSelect={onOpenSpot} />)}</div></section>
    </div>
  );
}

function MapTab({ spots, activeUser, users, onOpenSpot }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="tab-content">
      <section className="map-card glass-card"><div className="section-header"><div><p className="eyebrow">Live map</p><h2>Campus parking grid</h2></div><button className="mini-button" onClick={() => setExpanded(true)}>Expand</button></div><MapView spots={spots} activeUserId={activeUser.id} /></section>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Map list</p><h2>All nearby modules</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} users={users} activeUserId={activeUser.id} onSelect={onOpenSpot} />)}</div></section>
      {expanded && <div className="modal-backdrop" onClick={() => setExpanded(false)}><section className="expanded-map glass-card" onClick={(event) => event.stopPropagation()}><div className="section-header"><div><p className="eyebrow">Expanded map</p><h2>ParkLink grid</h2></div><button className="mini-button" onClick={() => setExpanded(false)}>Close</button></div><MapView spots={spots} activeUserId={activeUser.id} large /></section></div>}
    </div>
  );
}

function SpacesTab({ spots, users, activeUser, query, setQuery, onOpenSpot }) {
  const filtered = useMemo(() => spots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase()) || getStatusLabel(spot, activeUser.id).toLowerCase().includes(query.toLowerCase())), [spots, query, activeUser.id]);
  return (
    <div className="tab-content">
      <div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} users={users} activeUserId={activeUser.id} onSelect={onOpenSpot} />)}</div></section>
    </div>
  );
}

function ModulesTab() {
  return <section className="activity-card glass-card tab-content"><div className="section-header"><div><p className="eyebrow">Modules</p><h2>ParkLink systems</h2></div></div>{modules.map(({ icon: Icon, title, text }) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>;
}

function SettingsTab({ users, activeUser, onSwitchUser }) {
  return (
    <section className="settings-list tab-content">
      <div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{activeUser.name}</h2><span>{activeUser.phone}</span></div></div>
      <div className="users-card glass-card"><div className="section-header"><div><p className="eyebrow">Multi-user demo</p><h2>Switch user</h2></div><Users size={20} /></div>{users.map((user) => <button key={user.id} className={activeUser.id === user.id ? 'user-chip active' : 'user-chip'} onClick={() => onSwitchUser(user.id)}><span>{user.initials}</span><div><strong>{user.name}</strong><small>{user.phone}</small></div></button>)}</div>
      <div className="setting-row glass-card"><Navigation size={20} /><div><strong>Route preferences</strong><span>Fastest open spot first</span></div></div>
      <div className="setting-row glass-card"><Bell size={20} /><div><strong>Notifications</strong><span>Saved lot alerts later</span></div></div>
      <div className="setting-row glass-card"><ShieldCheck size={20} /><div><strong>Privacy</strong><span>Location used for parking recommendations</span></div></div>
    </section>
  );
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'modules', label: 'Modules', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppShell({ spots, users, activeUserId, onSwitchUser, onOpenSpot }) {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');
  const [transition, setTransition] = useState(null);
  const activeUser = getUser(users, activeUserId);
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  function switchTab(tabId, label) {
    if (tabId === activeTab) return;
    setTransition({ title: `Opening ${label}`, subtitle: 'Rebuilding your ParkLink view...' });
    setTimeout(() => setActiveTab(tabId), 360);
    setTimeout(() => setTransition(null), 1050);
  }

  return (
    <PhoneFrame>
      <main className="app-shell phone-screen has-tabs">
        <header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{activeLabel}</span></div></div><button className="icon-button"><Bell size={20} /></button></header>
        <div key={activeTab} className="animated-tab-wrap">
          {activeTab === 'home' && <HomeTab spots={spots} users={users} activeUser={activeUser} onOpenSpot={onOpenSpot} />}
          {activeTab === 'map' && <MapTab spots={spots} users={users} activeUser={activeUser} onOpenSpot={onOpenSpot} />}
          {activeTab === 'spaces' && <SpacesTab spots={spots} users={users} activeUser={activeUser} query={query} setQuery={setQuery} onOpenSpot={onOpenSpot} />}
          {activeTab === 'modules' && <ModulesTab />}
          {activeTab === 'settings' && <SettingsTab users={users} activeUser={activeUser} onSwitchUser={onSwitchUser} />}
        </div>
        <nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'tab-button active' : 'tab-button'} onClick={() => switchTab(id, label)}><Icon size={19} /><span>{label}</span></button>)}</nav>
        <ActionOverlay action={transition} />
      </main>
    </PhoneFrame>
  );
}

function SpotDetail({ spot, users, activeUser, onBack, onReserveAction, action }) {
  const state = getSpotState(spot, activeUser.id);
  const reservedUser = getUser(users, spot.reservedBy);
  const canReserve = state === 'available';
  const canUnreserve = state === 'mine';

  return (
    <PhoneFrame>
      <main className="app-shell phone-screen detail-shell">
        <button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <section className={`detail-hero glass-card detail-${state}`}><div className="detail-icon">{spot.type.includes('Bike') ? <Bike size={34} /> : <Car size={34} />}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={`tag ${state}-tag`}>{getStatusLabel(spot, activeUser.id)}</span><p>{spot.note}</p>{reservedUser && <div className="reservation-banner"><Users size={18} /><span>{state === 'mine' ? 'Reserved for you' : `Reserved by ${reservedUser.name}`}</span></div>}</section>
        <section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>
        <button className="primary-button big-action" disabled={!canReserve && !canUnreserve} onClick={() => onReserveAction(spot.id)}>{canUnreserve ? 'Unreserve spot' : canReserve ? 'Reserve spot' : 'Unavailable'} <CheckCircle2 size={20} /></button>
        <button className="primary-button big-action navigation-action"><Navigation size={20} /> Start navigation</button>
        <ActionOverlay action={action} />
      </main>
    </PhoneFrame>
  );
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [phone, setPhone] = useState('');
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [spots, setSpots] = useState(initialSpots);
  const [activeUserId, setActiveUserId] = useState('tanay');
  const [action, setAction] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('auth'), 1000);
    return () => clearTimeout(timer);
  }, []);

  const activeUser = getUser(demoUsers, activeUserId);
  const selectedSpot = spots.find((spot) => spot.id === selectedSpotId);

  function handleReservation(spotId) {
    const spot = spots.find((item) => item.id === spotId);
    const state = getSpotState(spot, activeUserId);
    const reserving = state === 'available';
    setAction({
      title: reserving ? 'Reserving spot' : 'Unreserving spot',
      subtitle: reserving ? 'Locking the module for your account...' : 'Releasing this space back to the lot...'
    });
    setTimeout(() => {
      setSpots((current) => current.map((item) => {
        if (item.id !== spotId) return item;
        return { ...item, reservedBy: reserving ? activeUserId : null };
      }));
    }, 900);
    setTimeout(() => setAction(null), 1500);
  }

  function handleSwitchUser(userId) {
    const user = getUser(demoUsers, userId);
    setAction({ title: `Switching to ${user.name}`, subtitle: 'Loading this user’s reservations...' });
    setTimeout(() => setActiveUserId(userId), 550);
    setTimeout(() => setAction(null), 1250);
  }

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={(value) => { setPhone(value); setPhase('otp'); }} />;
  if (phase === 'otp') return <OtpScreen phone={phone} onBack={() => setPhase('auth')} onComplete={() => setPhase('home')} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} users={demoUsers} activeUser={activeUser} onBack={() => setSelectedSpotId(null)} onReserveAction={handleReservation} action={action} />;
  return <AppShell spots={spots} users={demoUsers} activeUserId={activeUserId} onSwitchUser={handleSwitchUser} onOpenSpot={setSelectedSpotId} />;
}
