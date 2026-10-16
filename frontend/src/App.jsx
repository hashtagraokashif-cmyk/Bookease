import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";

// ==============================
// Pages
// ==============================

import Home from "./pages/Home/Home";
import Services from "./pages/Services/Services";
import About from "./pages/About/About";

import ProviderDetails from "./pages/ProviderDetails/ProviderDetails";
import BookAppointment from "./pages/BookAppointment/BookAppointment";
import AppointmentSuccess from "./pages/AppointmentSuccess/AppointmentSuccess";
import Appointments from "./pages/Appointments/Appointments";

// ==============================
// Authentication Pages
// ==============================

import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";

// ==============================
// Account
// ==============================

import Dashboard from "./pages/Dashboard/Dashboard";
import ProviderDashboard from "./pages/ProviderDashboard/ProviderDashboard";
import Profile from "./pages/Profile/Profile";
import NotFound from "./pages/NotFound/NotFound";

// ==============================
// Global CSS
// ==============================

import "./App.css";


// Start each new page at the top.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Customers and providers each get their own dashboard at /dashboard.
function DashboardForRole() {
  const { user } = useAuth();
  return user?.role === "provider" ? <ProviderDashboard /> : <Dashboard />;
}


function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <ScrollToTop />

        <Routes>

          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/providers/:id" element={<ProviderDetails />} />

          {/* Booking (login needed to confirm) */}
          <Route
            path="/appointments/book"
            element={
              <ProtectedRoute role="customer">
                <BookAppointment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments/success"
            element={
              <ProtectedRoute>
                <AppointmentSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute role="customer">
                <Appointments />
              </ProtectedRoute>
            }
          />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/signup" element={<Signup />} />

          {/* Account */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardForRole />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

    </AuthProvider>

  );

}

export default App;
