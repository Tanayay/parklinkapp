import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Bike,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  LocateFixed,
  LockKeyhole,
  Mail,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
  Sparkles,
  Waves,
  Zap
} from 'lucide-react';

const spots = [
  {
    id: 'A1',
    name: 'Lot A - Spot A1',
    distance: '0.2 mi',
    status: 'Available',
    type: 'Standard',
    confidence: 98,
    eta: '2 min',
    price: 'Free',
    signal: 'Strong',
    note: 'Closest open module near the main entrance.'
  },
  {
    id: 'A2',
    name: 'Lot A - Spot A2',
    distance: '0.2 mi',
    status: 'Occupied',
    type: 'Standard',
    confidence: 96,
    eta: '2 min',
    price: 'Free',
    signal: 'Strong',
    note: 'Vehicle detected by LiDAR module.'
  },
  {
    id: 'B4',
    name: 'Structure B - Level 2',
    distance: '0.4 mi',
    status: 'Available',
    type: 'EV Ready',
    confidence: 94,
    eta: '4 min',
    price: '$2/hr',
    signal: 'Medium',
    note: 'Near elevator and future charging module zone.'
  },
  {
    id: 'R2',
    name: 'Bike Rack Module R2',
    distance: '0.5 mi',
    status: 'Available',
    type: 'Bike / Scooter',
    confidence: 91,
    eta: '5 min',
    price: 'Free',
    signal: 'Medium',
    note: 'Rack module has open capacity for bikes and scooters.'
  }
];

const activity = [
  { icon: Car, title: 'A1 opened', text: 'Module refreshed 12 seconds ago' },
  { icon: Waves, title: 'Street sweeper route', text: 'Detection module mock data ready' },
  { icon: Bike, title: 'Bike rack module', text: 'Capacity tracking enabled in prototype view' }
];

function LogoMark() {
  return (
    <div className="logo-mark" aria-hidden="true">
      <span className="logo-ring" />
      <Car size={28} strokeWidth={2.4} />
    </div>
  );
}

function LoadingScreen() {
  return (
    <main className="loading-screen">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <LogoMark />
      <h1>ParkLink</h1>
      <p>Real-time parking, street, and mobility modules.</p>
      <div className="loading-bar">
        <span />
      </div>
    </main>
  );
}

function AuthScreen({ onVerify }) {
  const [email, setEmail] = useState('');

  return (
    <main className="auth-shell">
      <section className="auth-card glass-card">
        <LogoMark />
        <p className="eyebrow">Welcome to ParkLink</p>
        <h1>Find parking before you arrive.</h1>
        <p className="muted">
          Sign in or create an account to view live parking modules, save favorite lots, and test ParkLink prototype features.
        </p>

        <label className="input-label" htmlFor="email">Email</label>
        <div className="input-row">
          <Mail size={18} />
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <button className="primary-button" onClick={() => onVerify(email || 'demo@parklink.app')}>
          Send verification code
          <ChevronRight size={18} />
        </button>

        <div className="auth-grid">
          <div>
            <ShieldCheck size={20} />
            <strong>Email OTP</strong>
            <span>No password needed for prototype testing.</span>
          </div>
          <div>
            <LockKeyhole size={20} />
            <strong>Secure access</strong>
            <span>Ready for Firebase or Supabase auth later.</span>
          </div>
        </div>
      </section>
    </main>
  );
}

function OtpScreen({ email, onComplete, onBack }) {
  const [code, setCode] = useState('');

  return (
    <main className="auth-shell">
      <section className="auth-card glass-card compact-card">
        <button className="ghost-button" onClick={onBack}>
          <ArrowLeft size={18} /> Back
        </button>
        <p className="eyebrow">Verify email</p>
        <h1>Enter your code</h1>
        <p className="muted">We sent a one-time code to <strong>{email}</strong>.</p>

        <input
          className="otp-input"
          placeholder="000000"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        />

        <button className="primary-button" onClick={onComplete}>
          Verify and open app
          <CheckCircle2 size={18} />
        </button>
        <p className="helper-text">Prototype mode: any 6-digit code works visually.</p>
      </section>
    </main>
  );
}

function StatCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="stat-card glass-card">
      <Icon size={22} />
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function MapPreview({ selectedSpot, onExpand }) {
  const mapNodes = spots.map((spot, index) => (
    <button
      key={spot.id}
      className={`map-pin pin-${index + 1} ${spot.status === 'Available' ? 'available' : 'occupied'} ${selectedSpot?.id === spot.id ? 'selected' : ''}`}
      aria-label={spot.name}
    >
      {spot.id}
    </button>
  ));

  return (
    <section className="map-card glass-card">
      <div className="section-header">
        <div>
          <p className="eyebrow">Live map</p>
          <h2>Campus parking grid</h2>
        </div>
        <button className="mini-button" onClick={onExpand}>Expand</button>
      </div>
      <div className="map-surface">
        <div className="street street-one" />
        <div className="street street-two" />
        <div className="lot-outline" />
        {mapNodes}
        <div className="user-dot"><LocateFixed size={18} /></div>
      </div>
    </section>
  );
}

function SpotCard({ spot, onSelect }) {
  const isAvailable = spot.status === 'Available';

  return (
    <button className="spot-card glass-card" onClick={() => onSelect(spot)}>
      <div className={`status-dot ${isAvailable ? 'green' : 'red'}`} />
      <div className="spot-main">
        <strong>{spot.name}</strong>
        <span>{spot.type} • {spot.distance} • {spot.eta}</span>
      </div>
      <div className="spot-side">
        <span className={isAvailable ? 'tag available-tag' : 'tag occupied-tag'}>{spot.status}</span>
        <ChevronRight size={18} />
      </div>
    </button>
  );
}

function HomeScreen({ onOpenSpot }) {
  const [query, setQuery] = useState('');
  const [expandedMap, setExpandedMap] = useState(false);
  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => spot.name.toLowerCase().includes(query.toLowerCase()) || spot.type.toLowerCase().includes(query.toLowerCase()));
  }, [query]);

  return (
    <main className="app-shell">
      <header className="top-bar">
        <div className="brand-row">
          <LogoMark />
          <div>
            <strong>ParkLink</strong>
            <span>Prototype dashboard</span>
          </div>
        </div>
        <button className="icon-button" aria-label="Notifications">
          <Bell size={20} />
        </button>
      </header>

      <section className="hero-card glass-card">
        <div>
          <p className="eyebrow">Good afternoon, Tanay</p>
          <h1>Find the closest open spot.</h1>
          <p>Live module data for parking, bike racks, street sweeper coverage, and future mobility charging zones.</p>
        </div>
        <div className="hero-badge">
          <Sparkles size={20} />
          <span>AI routing soon</span>
        </div>
      </section>

      <div className="search-row glass-card">
        <Search size={20} />
        <input
          placeholder="Search locations, lots, modules..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="stats-grid">
        <StatCard icon={Car} label="Open spots" value="3" detail="Across active modules" />
        <StatCard icon={Clock} label="Avg refresh" value="12s" detail="Prototype scan rate" />
        <StatCard icon={Zap} label="Module health" value="94%" detail="Mock live status" />
      </div>

      <MapPreview onExpand={() => setExpandedMap(true)} />

      <section className="list-section">
        <div className="section-header">
          <div>
            <p className="eyebrow">Near you</p>
            <h2>Parking spaces near you</h2>
          </div>
          <span>{filteredSpots.length} results</span>
        </div>
        <div className="spot-list">
          {filteredSpots.map((spot) => <SpotCard key={spot.id} spot={spot} onSelect={onOpenSpot} />)}
        </div>
      </section>

      <section className="activity-card glass-card">
        <div className="section-header">
          <div>
            <p className="eyebrow">Modules</p>
            <h2>System activity</h2>
          </div>
        </div>
        {activity.map(({ icon: Icon, title, text }) => (
          <div className="activity-row" key={title}>
            <Icon size={18} />
            <div>
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </section>

      {expandedMap && (
        <div className="modal-backdrop" onClick={() => setExpandedMap(false)}>
          <section className="expanded-map glass-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-header">
              <div>
                <p className="eyebrow">Expanded map</p>
                <h2>ParkLink module grid</h2>
              </div>
              <button className="mini-button" onClick={() => setExpandedMap(false)}>Close</button>
            </div>
            <div className="map-surface large-map">
              <div className="street street-one" />
              <div className="street street-two" />
              <div className="lot-outline" />
              {spots.map((spot, index) => (
                <button key={spot.id} className={`map-pin pin-${index + 1} ${spot.status === 'Available' ? 'available' : 'occupied'}`}>
                  {spot.id}
                </button>
              ))}
              <div className="user-dot"><LocateFixed size={18} /></div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function SpotDetail({ spot, onBack }) {
  return (
    <main className="app-shell detail-shell">
      <button className="ghost-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to spaces
      </button>

      <section className="detail-hero glass-card">
        <div className="detail-icon">
          {spot.type.includes('Bike') ? <Bike size={34} /> : <Car size={34} />}
        </div>
        <p className="eyebrow">Module {spot.id}</p>
        <h1>{spot.name}</h1>
        <span className={spot.status === 'Available' ? 'tag available-tag' : 'tag occupied-tag'}>{spot.status}</span>
        <p>{spot.note}</p>
      </section>

      <section className="detail-grid">
        <div className="glass-card detail-tile"><MapPin size={20} /><span>Distance</span><strong>{spot.distance}</strong></div>
        <div className="glass-card detail-tile"><Clock size={20} /><span>ETA</span><strong>{spot.eta}</strong></div>
        <div className="glass-card detail-tile"><ShieldCheck size={20} /><span>Confidence</span><strong>{spot.confidence}%</strong></div>
        <div className="glass-card detail-tile"><Zap size={20} /><span>Signal</span><strong>{spot.signal}</strong></div>
      </section>

      <button className="primary-button big-action">
        <Navigation size={20} />
        Start navigation
      </button>

      <section className="glass-card info-panel">
        <p className="eyebrow">Prototype note</p>
        <h2>How this module would work</h2>
        <p>
          ParkLink modules use sensor feedback to determine whether a spot is open or occupied, then refresh the app with a simple status, confidence score, and route-ready location.
        </p>
      </section>
    </main>
  );
}

export default function App() {
  const [phase, setPhase] = useState('loading');
  const [email, setEmail] = useState('');
  const [selectedSpot, setSelectedSpot] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setPhase('auth'), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (phase === 'loading') return <LoadingScreen />;
  if (phase === 'auth') return <AuthScreen onVerify={(value) => { setEmail(value); setPhase('otp'); }} />;
  if (phase === 'otp') return <OtpScreen email={email} onBack={() => setPhase('auth')} onComplete={() => setPhase('home')} />;
  if (selectedSpot) return <SpotDetail spot={selectedSpot} onBack={() => setSelectedSpot(null)} />;
  return <HomeScreen onOpenSpot={setSelectedSpot} />;
}
