import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../assets/css/App.css";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import Game from "../components/Game/Game";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Game />
          </PrivateRoute>
        }
      />
    </Routes>
  );
};

export default App;