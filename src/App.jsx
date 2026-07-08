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
  Waves,
  Zap
} from 'lucide-react';

const DEMO_CODE = '123456';

const spots = [
  { id: 'A1', name: 'Lot A - Spot A1', distance: '0.2 mi', status: 'Available', type: 'Standard', confidence: 98, eta: '2 min', note: 'Closest open module near the main entrance.' },
  { id: 'A2', name: 'Lot A - Spot A2', distance: '0.2 mi', status: 'Occupied', type: 'Standard', confidence: 96, eta: '2 min', note: 'Vehicle detected by LiDAR module.' },
  { id: 'B4', name: 'Structure B - Level 2', distance: '0.4 mi', status: 'Available', type: 'EV Ready', confidence: 94, eta: '4 min', note: 'Near elevator and future charging module zone.' },
  { id: 'R2', name: 'Bike Rack Module R2', distance: '0.5 mi', status: 'Available', type: 'Bike / Scooter', confidence: 91, eta: '5 min', note: 'Rack module has open capacity for bikes and scooters.' }
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

function LogoMark() {
  return <div className="logo-mark"><span className="logo-ring" /><Car size={28} strokeWidth={2.4} /></div>;
}

function PhoneFrame({ children }) {
  return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>;
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

function AuthScreen({ onVerify }) {
  const [phone, setPhone] = useState('');
  const ready = phone.replace(/[^0-9]/g, '').length === 10;

  return (
    <PhoneFrame>
      <main className="auth-shell phone-screen">
        <section className="auth-card glass-card">
          <LogoMark />
          <p className="eyebrow">Welcome to ParkLink</p>
          <h1>Find parking before you arrive.</h1>
          <p className="muted">Use your phone number to enter the ParkLink mobile prototype.</p>
          <label className="input-label" htmlFor="phone">Phone number</label>
          <div className="input-row">
            <Phone size={18} />
            <input id="phone" type="tel" inputMode="numeric" placeholder="(310) 555-0198" value={phone} onChange={(event) => setPhone(formatPhone(event.target.value))} />
          </div>
          <button className="primary-button" disabled={!ready} onClick={() => onVerify(phone)}>
            Send verification code <ChevronRight size={18} />
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

  function verifyCode() {
    if (code === DEMO_CODE) {
      setError('');
      onComplete();
    } else {
      setError('Wrong code. For now, use 123456.');
    }
  }

  return (
    <PhoneFrame>
      <main className="auth-shell phone-screen">
        <section className="auth-card glass-card compact-card">
          <button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
          <p className="eyebrow">Verify phone</p>
          <h1>Enter code</h1>
          <p className="muted">Prototype verification for <strong>{phone}</strong>.</p>
          <input className="otp-input" placeholder="000000" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} />
          <div className="demo-code">Demo code: <strong>123456</strong></div>
          {error && <p className="error-text">{error}</p>}
          <button className="primary-button" disabled={code.length !== 6} onClick={verifyCode}>Verify and open app <CheckCircle2 size={18} /></button>
        </section>
      </main>
    </PhoneFrame>
  );
}

function StatCard({ label, value, detail, icon: Icon }) {
  return <div className="stat-card glass-card"><Icon size={22} /><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>;
}

function MapView({ large = false }) {
  return (
    <div className={large ? 'map-surface large-map' : 'map-surface'}>
      <div className="street street-one" /><div className="street street-two" /><div className="lot-outline" />
      {spots.map((spot, index) => <button key={spot.id} className={`map-pin pin-${index + 1} ${spot.status === 'Available' ? 'available' : 'occupied'}`}>{spot.id}</button>)}
      <div className="user-dot"><LocateFixed size={18} /></div>
    </div>
  );
}

function SpotCard({ spot, onSelect }) {
  const isAvailable = spot.status === 'Available';
  return (
    <button className="spot-card glass-card" onClick={() => onSelect(spot)}>
      <div className={`status-dot ${isAvailable ? 'green' : 'red'}`} />
      <div className="spot-main"><strong>{spot.name}</strong><span>{spot.type} • {spot.distance} • {spot.eta}</span></div>
      <div className="spot-side"><span className={isAvailable ? 'tag available-tag' : 'tag occupied-tag'}>{spot.status}</span><ChevronRight size={18} /></div>
    </button>
  );
}

function HomeTab({ onOpenSpot }) {
  return (
    <>
      <section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, Tanay</p><h1>Find the closest open spot.</h1><p>Live parking, bike rack, street sweeper, and mobility module data.</p></div><div className="hero-badge"><Sparkles size={20} /><span>AI routing soon</span></div></section>
      <div className="stats-grid two-stats"><StatCard icon={Car} label="Open spots" value="3" detail="Available nearby" /><StatCard icon={Clock} label="Avg refresh" value="12s" detail="Prototype scan rate" /></div>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Recommended</p><h2>Best spaces near you</h2></div></div><div className="spot-list">{spots.filter((spot) => spot.status === 'Available').map((spot) => <SpotCard key={spot.id} spot={spot} onSelect={onOpenSpot} />)}</div></section>
    </>
  );
}

function MapTab({ onOpenSpot }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <>
      <section className="map-card glass-card"><div className="section-header"><div><p className="eyebrow">Live map</p><h2>Campus parking grid</h2></div><button className="mini-button" onClick={() => setExpanded(true)}>Expand</button></div><MapView /></section>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Map list</p><h2>All nearby modules</h2></div></div><div className="spot-list">{spots.map((spot) => <SpotCard key={spot.id} spot={spot} onSelect={onOpenSpot} />)}</div></section>
      {expanded && <div className="modal-backdrop" onClick={() => setExpanded(false)}><section className="expanded-map glass-card" onClick={(event) => event.stopPropagation()}><div className="section-header"><div><p className="eyebrow">Expanded map</p><h2>ParkLink grid</h2></div><button className="mini-button" onClick={() => setExpanded(false)}>Close</button></div><MapView large /></section></div>}
    </>
  );
}

function SpacesTab({ query, setQuery, onOpenSpot }) {
  const filtered = useMemo(() => spots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <>
      <div className="search-row glass-card"><Search size={20} /><input placeholder="Search lots, spaces, modules..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
      <section className="list-section"><div className="section-header"><div><p className="eyebrow">Near you</p><h2>Parking spaces</h2></div><span>{filtered.length} results</span></div><div className="spot-list">{filtered.map((spot) => <SpotCard key={spot.id} spot={spot} onSelect={onOpenSpot} />)}</div></section>
    </>
  );
}

function ModulesTab() {
  return <section className="activity-card glass-card"><div className="section-header"><div><p className="eyebrow">Modules</p><h2>ParkLink systems</h2></div></div>{modules.map(({ icon: Icon, title, text }) => <div className="activity-row" key={title}><Icon size={18} /><div><strong>{title}</strong><span>{text}</span></div></div>)}</section>;
}

function SettingsTab({ phone }) {
  return <section className="settings-list"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{phone}</h2><span>Prototype account</span></div></div><div className="setting-row glass-card"><Navigation size={20} /><div><strong>Route preferences</strong><span>Fastest open spot first</span></div></div><div className="setting-row glass-card"><Bell size={20} /><div><strong>Notifications</strong><span>Saved lot alerts later</span></div></div><div className="setting-row glass-card"><ShieldCheck size={20} /><div><strong>Privacy</strong><span>Location used for parking recommendations</span></div></div></section>;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'map', label: 'Map', icon: Map },
  { id: 'spaces', label: 'Spaces', icon: Layers },
  { id: 'modules', label: 'Modules', icon: Zap },
  { id: 'settings', label: 'Settings', icon: Settings }
];

function AppShell({ phone, onOpenSpot }) {
  const [activeTab, setActiveTab] = useState('home');
  const [query, setQuery] = useState('');
  const activeLabel = tabs.find((tab) => tab.id === activeTab)?.label;

  return (
    <PhoneFrame>
      <main className="app-shell phone-screen has-tabs">
        <header className="top-bar"><div className="brand-row"><LogoMark /><div><strong>ParkLink</strong><span>{activeLabel}</span></div></div><button className="icon-button"><Bell size={20} /></button></header>
        {activeTab === 'home' && <HomeTab onOpenSpot={onOpenSpot} />}
        {activeTab === 'map' && <MapTab onOpenSpot={onOpenSpot} />}
        {activeTab === 'spaces' && <SpacesTab query={query} setQuery={setQuery} onOpenSpot={onOpenSpot} />}
        {activeTab === 'modules' && <ModulesTab />}
        {activeTab === 'settings' && <SettingsTab phone={phone} />}
        <nav className="bottom-tabs glass-card">{tabs.map(({ id, label, icon: Icon }) => <button key={id} className={activeTab === id ? 'tab-button active' : 'tab-button'} onClick={() => setActiveTab(id)}><Icon size={19} /><span>{label}</span></button>)}</nav>
      </main>
    </PhoneFrame>
  );
}

function SpotDetail({ spot, onBack }) {
  return (
    <PhoneFrame>
      <main className="app-shell phone-screen detail-shell">
        <button className="ghost-button" onClick={onBack}><ArrowLeft size={18} /> Back</button>
        <section className="detail-hero glass-card"><div className="detail-icon">{spot.type.includes('Bike') ? <Bike size={34} /> : <Car size={34} />}</div><p className="eyebrow">Module {spot.id}</p><h1>{spot.name}</h1><span className={spot.status === 'Available' ? 'tag available-tag' : 'tag occupied-tag'}>{spot.status}</span><p>{spot.note}</p></section>
        <section className="detail-grid"><div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div><div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div><div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div></section>
        <button className="primary-button big-action"><Navigation size={20} /> Start navigation</button>
      </main>
    </PhoneFrame>
  );
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [phone, setPhone] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('auth'), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={(value) => { setPhone(value); setPhase('otp'); }} />;
  if (phase === 'otp') return <OtpScreen phone={phone} onBack={() => setPhase('auth')} onComplete={() => setPhase('home')} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
  return <AppShell phone={phone} onOpenSpot={setSelectedSpot} />;
}
