import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student', regno:'', dept:'', year:'' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

  const submit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) return setError('Please fill in all required fields');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.post('/auth/register', form);
      setSuccess('Account created! Redirecting…');
      setTimeout(() => navigate('/'), 1400);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="auth-panel-inner">
          <div className="auth-logo">🎓</div>
          <h1>Join the Campus Community</h1>
          <p>Register as a student to browse and join events, or as an organizer to create and manage them.</p>
          <div className="auth-chips">
            <span className="auth-chip">👩‍🎓 Students</span>
            <span className="auth-chip">🧑‍💼 Organizers</span>
            <span className="auth-chip">🏫 All Departments</span>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h2>Create Account</h2>
          <p className="sub">Fill in your details to get started</p>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label>Full Name *</label>
              <input name="name" placeholder="Your full name" value={form.name} onChange={handle} required />
            </div>
            <div className="field">
              <label>Email Address *</label>
              <input name="email" type="email" placeholder="you@college.edu" value={form.email} onChange={handle} required />
            </div>
            <div className="field">
              <label>Password * (min. 6 characters)</label>
              <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle} required />
            </div>
            <div className="field">
              <label>Role *</label>
              <select name="role" value={form.role} onChange={handle}>
                <option value="student">Student</option>
                <option value="organizer">Organizer</option>
              </select>
            </div>

            {form.role === 'student' && (
              <>
                <div className="field-divider" />
                <div className="field">
                  <label>Register Number</label>
                  <input name="regno" placeholder="e.g. 21CS001" value={form.regno} onChange={handle} />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Department</label>
                    <input name="dept" placeholder="e.g. CSE" value={form.dept} onChange={handle} />
                  </div>
                  <div className="field">
                    <label>Year</label>
                    <select name="year" value={form.year} onChange={handle}>
                      <option value="">Select</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <button className="btn btn-primary" type="submit" disabled={loading} style={{marginTop:'0.25rem'}}>
              {loading ? 'Creating…' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-foot">
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
