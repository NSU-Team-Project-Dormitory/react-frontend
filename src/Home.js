import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="bg-gray-300 min-h-screen flex items-center justify-center flex-col">
      <Link to="/rooms" className="bg-teal-400 text-white p-4 rounded-lg mb-3">Поиск студентов по комнатам</Link>
      <Link to="/students" className="bg-teal-400 text-white p-4 rounded-lg">Поиск комнат по студентам</Link>
    </div>
  );
}

export default Home;