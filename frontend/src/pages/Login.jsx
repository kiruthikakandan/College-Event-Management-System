import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) return setError('Please fill in all fields');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('name', res.data.name);
      navigate(res.data.role === 'organizer' ? '/organizer' : '/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-logo">🎓</div>
          <h1>College Event Management System</h1>
          <p>Your campus, all your events — in one smart platform built for students and organizers.</p>
          <div className="auth-chips">
            <span className="auth-chip">📅 Browse Events</span>
            <span className="auth-chip">✅ Register Instantly</span>
            <span className="auth-chip">📊 Manage Easily</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Welcome back</h2>
          <p className="sub">Sign in to your account to continue</p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Email Address</label>
              <input name="email" type="email" placeholder="you@college.edu"
                value={form.email} onChange={handle} required autoComplete="email" />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handle} required autoComplete="current-password" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-foot">
            No account yet? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
