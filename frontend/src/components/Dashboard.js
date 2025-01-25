// components/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Hardcode a dummy userId for this example
    const userId = "1234567890abcdef";
    axios
      .get(`http://localhost:5000/api/painLogs/${userId}`)
      .then((response) => {
        setLogs(response.data);
      })
      .catch((error) => {
        console.error('Error fetching logs:', error);
      });
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        {logs.map((log) => (
          <li key={log._id}>
            <strong>Date:</strong> {new Date(log.date).toLocaleString()} <br/>
            <strong>Location:</strong> {log.location} <br/>
            <strong>Intensity:</strong> {log.intensity} <br/>
            <strong>Notes:</strong> {log.notes}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;