import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/organizer" element={<OrganizerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;