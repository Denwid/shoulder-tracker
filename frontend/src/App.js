// App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import LogPain from "./components/LogPain";

function App() {
  return (
    <Router>
      <div className="App">
        <h1>My Pain Tracker</h1>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/log" element={<LogPain />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
