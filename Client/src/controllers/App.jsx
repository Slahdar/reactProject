import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import "../assets/css/App.css";
import { useAuth } from "../context/AuthContext";
import Login from "../components/Auth/Login";
import Register from "../components/Auth/Register";
import Game from "../components/Game/Game";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Game />
          </PrivateRoute>
        }
      />
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;