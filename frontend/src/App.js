// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LogPain from "./components/LogPain";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>My Pain Tracker</h1>
        <nav>
          <ul>
            <li>
              <Link to="/">Dashboard</Link>
            </li>
            <li>
              <Link to="/log">Log Pain</Link>
            </li>
          </ul>
        </nav>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogPain />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
