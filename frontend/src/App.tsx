import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { DataProvider } from "./context/DataContext";

import { Home } from "./pages/index"

import "./App.css";

export default function App() {
  return (
    <DataProvider>
      <Router>
          <Routes>
            <Route path="/" element={ <Home /> } />
            <Route path="*" element={ <Navigate to="/" /> } />
          </Routes>
      </Router>
    </DataProvider>
  );
}

