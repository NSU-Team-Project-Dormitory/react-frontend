// App.js

import React from 'react';
import './styles/App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './Home';
import Rooms from './Rooms';
import Students from './Students';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rooms" element={<Rooms />} />
        <Route path="/students" element={<Students />} />
      </Routes>
    </Router>
  );
}

export default App;