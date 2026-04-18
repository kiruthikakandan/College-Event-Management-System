import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function Register() {
  const [form, setForm] = useState({ role: 'student' });
  const navigate = useNavigate();

  const register = async () => {
    try {
      await API.post('/auth/register', form);
      alert("Registered successfully");
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <center>
    <div>
      <h1>College Event Management System</h1>
      <h2>Register</h2>
      
      <input
        placeholder="Enter your Name"
        onChange={e => setForm({ ...form, name: e.target.value })}
      />
      <br />
      <input
        placeholder="Enter your Email"
        onChange={e => setForm({ ...form, email: e.target.value })}
      />
      <br />
      <input
        type="password"
        placeholder="Enter your Password"
        onChange={e => setForm({ ...form, password: e.target.value })}
      />
      <br />
      <select onChange={e => setForm({ ...form, role: e.target.value })}>
        <option value="student">Student</option>
        <option value="organizer" >Organizer</option>
      </select>
      <br />
      {/* Student fields */}
      <input
        placeholder="Reg No"
        onChange={e => setForm({ ...form, regno: e.target.value })}
      />
        <br />
      <input
        placeholder="Department"
        onChange={e => setForm({ ...form, dept: e.target.value })}
      />
      <br />
      <input
        placeholder="Year of Study"
        onChange={e => setForm({ ...form, year: e.target.value })}
      />
      <br />
      <button onClick={register}>Register</button>

      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
    </center>
  );
}

export default Register;