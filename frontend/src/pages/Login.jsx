import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Login() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const login = async () => {
    try {
      const res = await API.post('/auth/login', form);

      // Save token
      localStorage.setItem('token', res.data.token);

      // Redirect based on role
      if (res.data.role === 'organizer') {
        navigate('/organizer');
      } else {
        navigate('/student');
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (<center>
    <div>
<h1>College Event Management System</h1>

      <h2> Login</h2>

      <input
        placeholder="Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
<br />
<center>
      <input
        type="password"
        placeholder="Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      /></center>
<br />
      <button onClick={login}>Login</button>

      <p>
        Dont have an account? <a href="/register">Register</a>
      </p>
    </div></center>
  );
}

export default Login;