import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const TABS = ['All Events', 'My Registrations'];

export default function StudentDashboard() {
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [myRegs, setMyRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Student';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [evRes, myRes] = await Promise.all([
        API.get('/events'),
        API.get('/registrations/my/registrations'),
      ]);
      setEvents(evRes.data);
      setMyRegs(myRes.data);
    } catch { setError('Failed to load data. Please refresh.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const isReg = id => myRegs.some(r => (r.event?._id || r.event) === id);

  const apply = async id => {
    setBusy(id); setError('');
    try { await API.post(`/registrations/${id}`); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to register'); }
    finally { setBusy(null); }
  };

  const cancel = async id => {
    if (!window.confirm('Cancel your registration?')) return;
    setBusy(id);
    try { await API.delete(`/registrations/${id}`); await load(); }
    catch (err) { setError(err.response?.data?.message || 'Failed to cancel'); }
    finally { setBusy(null); }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };

  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

  const display = tab === 0 ? events : myRegs.map(r => ({ ...r.event, _regId: r._id, _regEvent: r.event }));

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-icon">🎓</div>
          <div className="sidebar-brand-text">
            <strong>CEMS</strong>
            <span>Student Portal</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">Navigation</span>
          <button className={`nav-item ${tab === 0 ? 'active' : ''}`} onClick={() => setTab(0)}>
            <span className="nav-icon">📅</span> All Events
          </button>
          <button className={`nav-item ${tab === 1 ? 'active' : ''}`} onClick={() => setTab(1)}>
            <span className="nav-icon">✅</span> My Registrations
            {myRegs.length > 0 && (
              <span style={{marginLeft:'auto', background:'var(--amber)', color:'var(--teal-dark)',
                borderRadius:'100px', fontSize:'0.7rem', fontWeight:800, padding:'0.1rem 0.5rem'}}>
                {myRegs.length}
              </span>
            )}
          </button>
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <strong>{name}</strong>
              <span>student</span>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" style={{width:'100%'}} onClick={logout}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        <div className="topbar">
          <span className="topbar-title">
            {tab === 0 ? '📅 All Events' : '✅ My Registrations'}
          </span>
          <div className="topbar-actions">
            <span style={{fontSize:'0.82rem', color:'var(--text-3)'}}>
              {tab === 0 ? `${events.length} event${events.length !== 1 ? 's' : ''} available` : `${myRegs.length} registered`}
            </span>
          </div>
        </div>

        <div className="scroll-area">
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon teal">📅</div>
              <div><div className="stat-val">{events.length}</div><div className="stat-lbl">Total Events</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber">✅</div>
              <div><div className="stat-val">{myRegs.length}</div><div className="stat-lbl">Registered</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green">🎯</div>
              <div><div className="stat-val">{events.length - myRegs.length}</div><div className="stat-lbl">Available</div></div>
            </div>
          </div>

          {error && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

          {loading ? <div className="spinner-wrap" /> : display.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">{tab === 0 ? '📋' : '📌'}</div>
              <p>{tab === 0 ? 'No events available yet.' : "You haven't registered for any events yet."}</p>
            </div>
          ) : (
            <div className="events-grid">
              {display.map((ev, i) => {
                if (!ev || !ev._id) return null;
                const registered = isReg(ev._id);
                const isBusy = busy === ev._id;
                return (
                  <div className="ev-card" key={ev._id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="ev-card-top">
                      <h3 className="ev-name">{ev.title}</h3>
                      {registered && <span className="registered-tag">✓ Joined</span>}
                    </div>
                    <div className="ev-meta">
                      <span className="pill pill-teal">📅 {fmt(ev.date)}</span>
                      {ev.venue && <span className="pill pill-gray">📍 {ev.venue}</span>}
                      {ev.capacity > 0 && <span className="pill pill-amber">👥 {ev.capacity} seats</span>}
                    </div>
                    {ev.description && <p className="ev-desc">{ev.description}</p>}
                    <div className="ev-foot">
                      {registered ? (
                        <button className="btn btn-danger btn-sm" onClick={() => cancel(ev._id)} disabled={isBusy}>
                          {isBusy ? 'Cancelling…' : 'Cancel Registration'}
                        </button>
                      ) : (
                        <button className="btn btn-amber btn-sm" onClick={() => apply(ev._id)} disabled={isBusy}>
                          {isBusy ? 'Registering…' : '+ Register'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
