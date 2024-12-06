import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventList from './pages/EventList';
import AddEvent from './pages/AddEvent';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>Event Management Application</h1>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/add-event">Add Event</a>
            </li>
          </ul>
        </nav>

        <Routes>
          {/* Route to show all events */}
          <Route path="/" element={<EventList />} />

          {/* Route to add a new event */}
          <Route path="/add-event" element={<AddEvent />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
