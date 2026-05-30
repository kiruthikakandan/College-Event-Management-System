import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

export default function OrganizerDashboard() {
  const [view, setView] = useState('events'); // 'events' | 'create' | 'applicants'
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({ title:'', description:'', date:'', venue:'', capacity:'' });
  const [applicants, setApplicants] = useState([]);
  const [selEvent, setSelEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [loadingApps, setLoadingApps] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Organizer';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try { const r = await API.get('/events'); setEvents(r.data); }
    catch { setError('Failed to load events'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const createEvent = async e => {
    e.preventDefault();
    if (!form.title || !form.date) return setError('Title and date are required');
    setSubmitting(true); setError(''); setSuccess('');
    try {
      await API.post('/events', form);
      setSuccess('Event created successfully!');
      setForm({ title:'', description:'', date:'', venue:'', capacity:'' });
      loadEvents();
      setTimeout(() => { setSuccess(''); setView('events'); }, 1500);
    } catch (err) { setError(err.response?.data?.message || 'Failed to create event'); }
    finally { setSubmitting(false); }
  };

  const deleteEvent = async id => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await API.delete(`/events/${id}`);
      if (selEvent?.id === id) { setSelEvent(null); setApplicants([]); setView('events'); }
      loadEvents();
    } catch (err) { setError(err.response?.data?.message || 'Failed to delete'); }
  };

  const viewApplicants = async (id, title) => {
    setSelEvent({ id, title }); setView('applicants');
    setLoadingApps(true); setApplicants([]);
    try { const r = await API.get(`/registrations/${id}`); setApplicants(r.data); }
    catch { setError('Failed to load registrations'); }
    finally { setLoadingApps(false); }
  };

  const exportXLSX = async (id, title) => {
    try {
      const r = await API.get(`/registrations/${id}/export`, { responseType:'blob' });
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${title.replace(/\s+/g,'_')}_registrations.xlsx`;
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    } catch { setError('No registrations to export'); }
  };

  const logout = () => { localStorage.clear(); navigate('/'); };
  const fmt = d => d ? new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—';

  return (
    <div className="shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-icon">🎓</div>
          <div className="sidebar-brand-text">
            <strong>CEMS</strong>
            <span>Organizer Panel</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <span className="nav-label">Manage</span>
          <button className={`nav-item ${view === 'events' ? 'active' : ''}`} onClick={() => setView('events')}>
            <span className="nav-icon">📋</span> My Events
            {events.length > 0 && (
              <span style={{marginLeft:'auto', background:'var(--amber)', color:'var(--teal-dark)',
                borderRadius:'100px', fontSize:'0.7rem', fontWeight:800, padding:'0.1rem 0.5rem'}}>
                {events.length}
              </span>
            )}
          </button>
          <button className={`nav-item ${view === 'create' ? 'active' : ''}`} onClick={() => setView('create')}>
            <span className="nav-icon">➕</span> Create Event
          </button>
          {selEvent && (
            <button className={`nav-item ${view === 'applicants' ? 'active' : ''}`} onClick={() => setView('applicants')}>
              <span className="nav-icon">👥</span>
              <span style={{overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1}}>
                {selEvent.title}
              </span>
            </button>
          )}
        </nav>
        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <strong>{name}</strong>
              <span>organizer</span>
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
            {view === 'events' && '📋 My Events'}
            {view === 'create' && '➕ Create New Event'}
            {view === 'applicants' && `👥 ${selEvent?.title}`}
          </span>
          {view === 'events' && (
            <button className="btn btn-amber btn-sm" onClick={() => setView('create')}>
              + New Event
            </button>
          )}
          {view === 'applicants' && (
            <button className="btn btn-ghost btn-sm" onClick={() => exportXLSX(selEvent.id, selEvent.title)}>
              ⬇ Export Excel
            </button>
          )}
        </div>

        <div className="scroll-area">
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          {/* ── Events view ── */}
          {view === 'events' && (
            <>
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon teal">📅</div>
                  <div><div className="stat-val">{events.length}</div><div className="stat-lbl">Events Created</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon amber">👥</div>
                  <div><div className="stat-val">—</div><div className="stat-lbl">Total Registrations</div></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon green">📊</div>
                  <div><div className="stat-val">{events.filter(e => new Date(e.date) >= new Date()).length}</div><div className="stat-lbl">Upcoming</div></div>
                </div>
              </div>

              {loading ? <div className="spinner-wrap" /> : events.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <p>No events yet. <button style={{background:'none',border:'none',color:'var(--teal)',cursor:'pointer',fontWeight:700,fontSize:'0.9rem'}} onClick={() => setView('create')}>Create your first event →</button></p>
                </div>
              ) : (
                <div className="events-grid">
                  {events.map((ev, i) => (
                    <div className="ev-card" key={ev._id} style={{ animationDelay: `${i * 0.05}s` }}>
                      <div className="ev-card-top">
                        <h3 className="ev-name">{ev.title}</h3>
                      </div>
                      <div className="ev-meta">
                        <span className="pill pill-teal">📅 {fmt(ev.date)}</span>
                        {ev.venue && <span className="pill pill-gray">📍 {ev.venue}</span>}
                        {ev.capacity > 0 && <span className="pill pill-amber">👥 {ev.capacity} seats</span>}
                      </div>
                      {ev.description && <p className="ev-desc">{ev.description}</p>}
                      <div className="ev-foot">
                        <button className="btn btn-ghost btn-sm" onClick={() => viewApplicants(ev._id, ev.title)}>
                          View Registrations
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => exportXLSX(ev._id, ev.title)} title="Export">
                          ⬇
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteEvent(ev._id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── Create view ── */}
          {view === 'create' && (
            <div className="form-panel" style={{maxWidth:620}}>
              <div className="form-panel-title">➕ New Event Details</div>
              <form onSubmit={createEvent}>
                <div className="field-row">
                  <div className="field">
                    <label>Event Title *</label>
                    <input name="title" placeholder="e.g. Tech Symposium 2025" value={form.title} onChange={handle} required />
                  </div>
                  <div className="field">
                    <label>Date *</label>
                    <input name="date" type="date" value={form.date} onChange={handle} required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Venue</label>
                    <input name="venue" placeholder="e.g. Seminar Hall A" value={form.venue} onChange={handle} />
                  </div>
                  <div className="field">
                    <label>Capacity (0 = unlimited)</label>
                    <input name="capacity" type="number" min="0" placeholder="0" value={form.capacity} onChange={handle} />
                  </div>
                </div>
                <div className="field">
                  <label>Description</label>
                  <input name="description" placeholder="Brief description of the event" value={form.description} onChange={handle} />
                </div>
                <div style={{display:'flex', gap:'0.75rem'}}>
                  <button className="btn btn-amber" type="submit" disabled={submitting} style={{minWidth:160}}>
                    {submitting ? 'Creating…' : '✓ Create Event'}
                  </button>
                  <button className="btn btn-ghost" type="button" onClick={() => setView('events')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Applicants view ── */}
          {view === 'applicants' && (
            <>
              {loadingApps ? <div className="spinner-wrap" /> : applicants.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👤</div>
                  <p>No registrations yet for this event.</p>
                </div>
              ) : (
                <div className="tbl-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Name</th>
                        <th>Reg No</th>
                        <th>Department</th>
                        <th>Year</th>
                        <th>Registered On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((a, i) => (
                        <tr key={a._id}>
                          <td>{i + 1}</td>
                          <td><strong>{a.name || '—'}</strong></td>
                          <td>{a.regno || '—'}</td>
                          <td>{a.dept || '—'}</td>
                          <td>{a.year ? `Year ${a.year}` : '—'}</td>
                          <td>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
