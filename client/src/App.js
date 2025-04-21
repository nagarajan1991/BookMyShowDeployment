import './App.css';

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Partner from "./pages/Partner";
import SingleMovie from "./pages/Home/SingleMovie";
import BookShow from './pages/Home/BookShow';
import Forgot from "./pages/Profile/ForgotPassword";
import Reset from "./pages/Profile/ResetPassword";
import TicketView from './pages/Home/TicketView';

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from './components/ProtectedRoute';
import store from "./redux/store"
import { Provider } from 'react-redux';
import { message } from 'antd';

// Add this at the top of your App component
message.config({
  maxCount: 1,
  duration: 2,
});

// New RoleBasedRoute component
const RoleBasedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate homepage based on role
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin" replace />;
      case "partner":
        return <Navigate to="/partner" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return children;
};

function App() {
  return (
    <div>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset/:email" element={<Reset />} />

            {/* Protected Routes with Role-Based Access */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["user", "admin", "partner"]}>
                    <Home />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["admin"]}>
                    <Admin />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/partner"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["partner"]}>
                    <Partner />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["user", "admin", "partner"]}>
                    <Profile />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/movie/:id"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["user", "admin", "partner"]}>
                    <SingleMovie />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/book-show/:id"
              element={
                <ProtectedRoute>
                  <RoleBasedRoute allowedRoles={["user", "admin", "partner"]}>
                    <BookShow />
                  </RoleBasedRoute>
                </ProtectedRoute>
              }
            />

            <Route 
              path="/ticket-view" 
              element={
                <ProtectedRoute>
                   <RoleBasedRoute allowedRoles={["user", "admin", "partner"]}>
                  <TicketView />
                  </RoleBasedRoute>
                </ProtectedRoute>
              } 
            />

            {/* Catch all other routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </Provider>
    </div>
  );
}

export default App;
