import { useState } from 'react';
import { Car, Settings, UserRound } from 'lucide-react';

const demoSpots = [
  { id: 'A1', name: 'Lot A - Spot A1', type: 'Standard', open: true },
  { id: 'A2', name: 'Lot A - Spot A2', type: 'Standard', open: false },
  { id: 'B4', name: 'Structure B - Level 2', type: 'EV Ready', open: true },
  { id: 'R2', name: 'Bike Rack Module R2', type: 'Bike / Scooter', open: true }
];

function Logo() {
  return <div className="logo-mark"><span className="logo-ring" /><Car size={28} /></div>;
}

function Frame({ children }) {
  return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker" />{children}</div></div>;
}

export default function AppSafe() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('parklink-user') || 'null'));
  const [name, setName] = useState('Tanay Sadhwani');
  const [email, setEmail] = useState('tanaysadhwani@gmail.com');
  const [tab, setTab] = useState('home');
  const [vehicles, setVehicles] = useState(() => JSON.parse(localStorage.getItem('parklink-vehicles') || '[]'));
  const [carName, setCarName] = useState('');
  const [plate, setPlate] = useState('');

  if (!user) {
    return <Frame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><Logo /><p className="eyebrow">Welcome to ParkLink</p><h1>Open ParkLink</h1><p className="muted">Login OTP is paused so the app can open while Firebase email login is being finished.</p><label className="input-label">Name</label><div className="input-row"><UserRound size={18} /><input value={name} onChange={(e) => setName(e.target.value)} /></div><label className="input-label">Email</label><div className="input-row"><Settings size={18} /><input value={email} onChange={(e) => setEmail(e.target.value)} /></div><button className="primary-button" onClick={() => { const next = { name, email }; localStorage.setItem('parklink-user', JSON.stringify(next)); setUser(next); }}>Open app</button></section></main></Frame>;
  }

  function addVehicle() {
    if (!carName && !plate) return;
    const next = [...vehicles, { id: Date.now(), carName, plate }];
    setVehicles(next);
    localStorage.setItem('parklink-vehicles', JSON.stringify(next));
    setCarName('');
    setPlate('');
  }

  return <Frame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><Logo /><div><strong>ParkLink</strong><span>{tab === 'home' ? 'Home' : 'Settings'}</span></div></div></header>{tab === 'home' && <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {user.name}</p><h1>Find the closest open spot.</h1><p>Home page fixed. Phone OTP error is bypassed for now.</p></div><div className="hero-badge"><Car size={20} /><span>{demoSpots.filter((s) => s.open).length} open</span></div></section><div className="spot-list">{demoSpots.map((s) => <button className={`spot-card glass-card spot-${s.open ? 'available' : 'occupied'}`} key={s.id}><div className={`spot-type-icon ${s.open ? 'available' : 'occupied'}`}><Car size={18} /></div><div className="spot-main"><strong>{s.name}</strong><span>{s.type}</span></div><div className="spot-side"><span className={`tag ${s.open ? 'available' : 'occupied'}-tag`}>{s.open ? 'Available' : 'Occupied'}</span></div></button>)}</div></div>}{tab === 'settings' && <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34} /><div><p className="eyebrow">Signed in</p><h2>{user.name}</h2><span>{user.email}</span></div></div><div className="vehicles-card glass-card"><div className="section-header"><div><p className="eyebrow">Vehicles</p><h2>Your vehicles</h2></div></div><div className="input-row"><Car size={18} /><input placeholder="Vehicle nickname" value={carName} onChange={(e) => setCarName(e.target.value)} /></div><div className="input-row"><Settings size={18} /><input placeholder="Plate" value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase())} /></div><button className="primary-button" onClick={addVehicle}>Add vehicle</button>{vehicles.map((v) => <div className="linked-user-row" key={v.id}><span>CA</span><div><strong>{v.carName || v.plate}</strong><small>{v.plate || 'No plate'}</small></div></div>)}</div></section>}<nav className="bottom-tabs glass-card"><button className={tab === 'home' ? 'tab-button active' : 'tab-button'} onClick={() => setTab('home')}>Home</button><button className={tab === 'settings' ? 'tab-button active' : 'tab-button'} onClick={() => setTab('settings')}>Settings</button></nav></main></Frame>;
}
