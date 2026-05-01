// client/src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Landing       from './pages/Landing.jsx';
import Login         from './pages/Login.jsx';
import Register      from './pages/Register.jsx';
import Dashboard     from './pages/Dashboard.jsx';
import BookDuoPilot  from './pages/BookDuoPilot.jsx';
import BookStorage   from './pages/BookStorage.jsx';
import MyOrders      from './pages/MyOrders.jsx';
import Admin         from './pages/Admin.jsx';
import { useAuth }   from './context/AuthContext.jsx';

export default function App() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
          <Route path="/login"    element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" replace /> : <Register />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/duopilot/book" element={
            <ProtectedRoute><BookDuoPilot /></ProtectedRoute>
          } />
          <Route path="/storage/book" element={
            <ProtectedRoute><BookStorage /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute><MyOrders /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
