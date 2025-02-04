// components/LogPain.js
import React, { useState } from 'react';
import axios from 'axios';

function LogPain() {
  const [location, setLocation] = useState('');
  const [intensity, setIntensity] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = "1234567890abcdef";
      const response = await axios.post('http://localhost:5000/painLogs', {
        userId,
        location,
        intensity,
        notes,
        date: new Date().toISOString()
      });
      console.log('Saved log:', response.data);
      alert('Pain log saved!');
    } catch (error) {
      console.error('Error saving log:', error);
    }
  };

  return (
    <div>
      <h2>Log Pain</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Pain Location:</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div>
          <label>Pain Intensity (0-10):</label>
          <input
            type="number"
            min="0"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(e.target.value)}
          />
        </div>
        <div>
          <label>Notes:</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">Save Pain Log</button>
      </form>
    </div>
  );
}

export default LogPain;