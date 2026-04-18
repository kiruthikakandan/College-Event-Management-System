import { useEffect, useState } from 'react';
import API from '../api';

function OrganizerDashboard() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({});
  const [applicants, setApplicants] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const res = await API.get('/events');
    setEvents(res.data);
  };

  // ➕ Create Event
  const createEvent = async () => {
    try {
      await API.post('/events', form);
      alert("Event created");
      fetchEvents();
    } catch (err) {
      console.error(err);
      alert("Error creating event");
    }
  };

  
  const deleteEvent = async (id) => {
    await API.delete(`/events/${id}`);
    fetchEvents();
  };

  // 👁️ View Applicants
  const viewApplicants = async (eventId) => {
    const res = await API.get(`/registrations/${eventId}`);
    setApplicants(res.data);
  };


  return (
    <div>
      <h1>College Event Management System</h1>
      <h2>Organizer Dashboard</h2>

      {/* Create Event */}
      <h3>Create Event</h3>
      <center>
      <input placeholder="Title"
        onChange={e => setForm({ ...form, title: e.target.value })} />
        <br />
      <input placeholder="Description"
        onChange={e => setForm({ ...form, description: e.target.value })} />
        <br />
      <input type="date"
        onChange={e => setForm({ ...form, date: e.target.value })} />
        <br />  
      <button onClick={createEvent}>Create</button>
      </center>
      {/* Events List */}
      <h3>Events</h3>

      {events.map(e => (
        <div key={e._id}>
          <h4>Event Name: {e.title}</h4>

          <button onClick={() => deleteEvent(e._id)}>Delete</button>

          <button onClick={() => viewApplicants(e._id)}>
            View Applicants
          </button>

          
        </div>
      ))}

      {/* Applicants */}
      <h3>Applicants</h3>
      <center>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>RegNo</th>
            <th>Dept</th>
            <th>Year</th>
          </tr>
        </thead>

        <tbody>
          {applicants.map(a => (
            <tr key={a._id}>
              <td>{a.name}</td>
              <td>{a.regno}</td>
              <td>{a.dept}</td>
              <td>{a.year}</td>
            </tr>
          ))}
        </tbody>
      </table>
            </center>
    </div>
  );
}

export default OrganizerDashboard;