import { useEffect, useState } from 'react';
import { Car, CheckCircle2, Database, Home, Layers, LoaderCircle, Map, Search, Settings, ShieldCheck, Timer, UserRound } from 'lucide-react';
import { firebaseReady, releaseSpotInFirebase, reserveSpotInFirebase, subscribeReservations } from './firebase';
import { completeEmailLoginLink, hasEmailLoginLink, sendEmailLoginLink } from './emailLogin';

const HOLD_MS = 5 * 60 * 1000;
const spots = [
  { id: 'A1', name: 'Lot A - Spot A1', type: 'Standard', open: true },
  { id: 'A2', name: 'Lot A - Spot A2', type: 'Standard', open: false },
  { id: 'B4', name: 'Structure B - Level 2', type: 'EV Ready', open: true },
  { id: 'R2', name: 'Bike Rack Module R2', type: 'Bike / Scooter', open: true }
];

function Logo(){return <div className="logo-mark"><span className="logo-ring"/><Car size={28}/></div>}
function Frame({children}){return <div className="phone-stage"><div className="phone-frame"><div className="phone-speaker"/>{children}</div></div>}
function fmt(ms){const safe=Math.max(0,ms);return `${Math.floor(safe/60000)}:${String(Math.floor((safe%60000)/1000)).padStart(2,'0')}`}
function state(s,res){if(!s.open)return 'occupied';return res[s.id]?.expiresAt>Date.now()?'mine':'available'}

function Login({onDemo}){
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [sent,setSent]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  async function sendLink(){
    setLoading(true); setError('');
    try{
      if(!firebaseReady) throw new Error('Firebase is not connected yet. Add Vercel env vars and redeploy.');
      localStorage.setItem('parklink-login-name', name || email.split('@')[0]);
      await sendEmailLoginLink(email);
      setSent(true);
    }catch(e){setError(e.message || 'Could not send verification email.');}
    setLoading(false);
  }
  return <Frame><main className="auth-shell phone-screen"><section className="auth-card glass-card screen-pop"><Logo/><p className="eyebrow">Welcome to ParkLink</p><h1>Email verification</h1><p className="muted">Enter your email. Firebase will send a real verification link. Click it to open ParkLink.</p><label className="input-label">Name</label><div className="input-row"><UserRound size={18}/><input value={name} onChange={e=>setName(e.target.value)} placeholder="Tanay"/></div><label className="input-label">Email</label><div className="input-row"><ShieldCheck size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div>{error&&<p className="error-text">{error}</p>}{sent&&<div className="verified-pill"><CheckCircle2 size={16}/> Verification email sent. Open your email and click the link.</div>}<button className="primary-button" disabled={loading||!email.includes('@')} onClick={sendLink}>{loading?<><LoaderCircle className="spin" size={18}/> Sending...</>:<>Send verification email <CheckCircle2 size={18}/></>}</button>{!firebaseReady&&<button className="ghost-button" onClick={()=>onDemo({name:name||'Demo Driver',email:email||'demo@parklink.app'})}>Open demo without Firebase</button>}<div className="auth-grid"><div><Database size={20}/><strong>Real email link</strong><span>No fake code. No SMS limit.</span></div><div><Timer size={20}/><strong>Shared holds</strong><span>Firestore sync after login.</span></div></div></section></main></Frame>
}

function SpotCard({s,res,now,onReserve}){const st=state(s,res);const r=res[s.id];return <button className={`spot-card glass-card spot-${st}`} onClick={()=>onReserve(s.id)}><div className={`spot-type-icon ${st}`}><Car size={18}/></div><div className="spot-main"><strong>{s.name}</strong><span>{s.type}</span>{r?.expiresAt>Date.now()&&<small className="reserved-line"><Timer size={13}/> {fmt(r.expiresAt-now)} left</small>}</div><div className="spot-side"><span className={`tag ${st}-tag`}>{st==='occupied'?'Occupied':st==='mine'?'Reserved':'Available'}</span></div></button>}
function HomeTab(p){const open=spots.filter(s=>state(s,p.res)==='available').length;return <div className="tab-content"><section className="hero-card glass-card"><div><p className="eyebrow">Good afternoon, {p.user.name}</p><h1>Find the closest open spot.</h1><p>{firebaseReady?'Realtime Firebase reservations are connected.':'Demo/local mode.'}</p></div><div className="hero-badge"><Car size={20}/><span>{open} open</span></div></section><div className="stats-grid two-stats"><div className="stat-card glass-card"><Car size={22}/><span>Open spots</span><strong>{open}</strong><small>Available nearby</small></div><div className="stat-card glass-card"><Timer size={22}/><span>Active holds</span><strong>{Object.keys(p.res).length}</strong><small>{firebaseReady?'Shared live':'This device'}</small></div></div><div className="spot-list">{spots.map(s=><SpotCard key={s.id} s={s} res={p.res} now={p.now} onReserve={p.onReserve}/>)}</div></div>}
function MapTab(){return <div className="tab-content"><section className="real-map-card glass-card"><iframe title="ParkLink map" className="real-map" src="https://www.openstreetmap.org/export/embed.html?bbox=-117.8295%2C34.0516%2C-117.8154%2C34.0618&layer=mapnik&marker=34.0562%2C-117.8211"/></section></div>}
function AiTab(){return <section className="settings-list tab-content"><div className="profile-card glass-card"><Database size={34}/><div><p className="eyebrow">AI Recs</p><h2>Parking prediction</h2><span>Prototype busy estimate until ParkLink has historical module data.</span></div></div>{['Closest public parking','Large parking structure','Street parking zone'].map((x,i)=><div className="ai-result-card glass-card" key={x}><div className="ai-score-ring"><strong>{82-i*14}%</strong><span>{i===0?'Likely open':'Moderate'}</span></div><div className="ai-result-main"><strong>{x}</strong><span>{3+i*3} min walk • fee unknown</span></div></div>)}</section>}
function SettingsTab({user}){return <section className="settings-list tab-content"><div className="profile-card glass-card"><UserRound size={34}/><div><p className="eyebrow">Verified email</p><h2>{user.name}</h2><span>{user.email}</span></div></div><div className="device-card glass-card"><div className="device-row"><span>Login method</span><strong>Email verification link</strong></div><div className="device-row"><span>Firebase</span><strong>{firebaseReady?'Connected':'Not configured'}</strong></div></div></section>}
const tabs=[['home','Home',Home],['map','Map',Map],['spaces','Spaces',Layers],['data','AI Recs',Database],['settings','Settings',Settings]];
function AppBody(p){const[tab,setTab]=useState('home');return <Frame><main className="app-shell phone-screen has-tabs"><header className="top-bar"><div className="brand-row"><Logo/><div><strong>ParkLink</strong><span>{tabs.find(t=>t[0]===tab)?.[1]}</span></div></div></header>{tab==='home'&&<HomeTab {...p}/>} {tab==='map'&&<MapTab/>} {tab==='spaces'&&<div className="tab-content"><div className="search-row glass-card"><Search size={20}/><input placeholder="Search lots, spaces, modules..."/></div>{spots.map(s=><SpotCard key={s.id} s={s} res={p.res} now={p.now} onReserve={p.onReserve}/>)}</div>} {tab==='data'&&<AiTab/>} {tab==='settings'&&<SettingsTab user={p.user}/>}<nav className="bottom-tabs glass-card">{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?'tab-button active':'tab-button'} onClick={()=>setTab(id)}><Icon size={18}/><span>{label}</span></button>)}</nav></main></Frame>}

export default function AppEmailVerify(){const[user,setUser]=useState(()=>JSON.parse(localStorage.getItem('parklink-user')||'null'));const[res,setRes]=useState(()=>JSON.parse(localStorage.getItem('parklink-reservations')||'{}'));const[now,setNow]=useState(Date.now());const[loading,setLoading]=useState(true);useEffect(()=>{const t=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(t)},[]);useEffect(()=>{if(firebaseReady)return subscribeReservations(setRes)},[]);useEffect(()=>{async function boot(){if(hasEmailLoginLink()){try{const u=await completeEmailLoginLink();const next={name:localStorage.getItem('parklink-login-name')||u.email.split('@')[0],email:u.email};localStorage.setItem('parklink-user',JSON.stringify(next));setUser(next);window.history.replaceState({},document.title,window.location.origin)}catch(e){console.log(e)}}setLoading(false)}boot()},[]);useEffect(()=>{if(!firebaseReady)localStorage.setItem('parklink-reservations',JSON.stringify(res))},[res]);async function onReserve(id){const r=res[id];const reserving=!(r?.expiresAt>Date.now());if(firebaseReady){if(reserving)await reserveSpotInFirebase({spotId:id,userName:user.name,phone:user.email,expiresAt:Date.now()+HOLD_MS});else await releaseSpotInFirebase(id)}else setRes(c=>{const n={...c};if(reserving)n[id]={userName:user.name,phone:user.email,expiresAt:Date.now()+HOLD_MS};else delete n[id];return n})}if(loading)return <main className="loading-screen"><Logo/><h1>ParkLink</h1><p>Checking verification link...</p></main>;if(!user)return <Login onDemo={u=>{localStorage.setItem('parklink-user',JSON.stringify(u));setUser(u)}}/>;return <AppBody user={user} res={res} now={now} onReserve={onReserve}/>}
