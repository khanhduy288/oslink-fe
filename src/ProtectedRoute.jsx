// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ userLevel, requiredLevel, children }) {
  if (userLevel < requiredLevel) {
    return <Navigate to="/" replace />; // redirect nếu không đủ quyền
  }
  return children;
}
