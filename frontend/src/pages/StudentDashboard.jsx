import { useEffect, useState } from 'react';
import API from '../api';

function StudentDashboard() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await API.get('/events');
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load events");
    }
  };

  const applyEvent = async (eventId) => {
    try {
      await API.post(`/registrations/${eventId}`);
      alert("Applied successfully");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div>
      <h1>College Event Management System</h1>
      <h2 style={{ textAlign: "center" }}>Student Dashboard</h2>

      {events.map(e => (
        <div key={e._id}><center>
          <h3>Event Name : {e.title}</h3>
          <p>Event Description : {e.description}</p>
          <p>Event Date : {new Date(e.date).toLocaleDateString()}</p>
          <button onClick={() => applyEvent(e._id)}>
            Apply
          </button></center>
        </div>
      ))}
    </div>
  );
}

export default StudentDashboard;