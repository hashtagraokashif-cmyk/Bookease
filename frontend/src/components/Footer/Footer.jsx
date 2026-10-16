import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Footer.css";

const CURRENT_YEAR = new Date().getFullYear();

function Footer() {
  const { user } = useAuth();

  return (
    <footer className="footer">

      <div className="footer-container">

        {/* Brand */}
        <div className="footer-brand">

          <Link to="/" className="footer-logo">
            <span>Book</span>Ease
          </Link>

          <p>
            A simple and reliable appointment booking platform
            designed to make scheduling easier for everyone.
          </p>

        </div>

        {/* Quick Links */}
        <div className="footer-column">

          <h3>Quick Links</h3>

          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/services">Services</Link>
          <Link to="/appointments">Appointments</Link>

        </div>

        {/* Account */}
        <div className="footer-column">

          <h3>Account</h3>

          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              {user.role === "customer" && <Link to="/appointments">My Appointments</Link>}
              <Link to="/profile">My Profile</Link>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Create Account</Link>
            </>
          )}

        </div>

        {/* Contact */}
        <div className="footer-column">

          <h3>Contact</h3>

          <p>📍 Islamabad, Pakistan</p>
          <p>📧 support@bookease.com</p>
          <p>📞 +92 300 1234567</p>

        </div>

      </div>

      {/* Bottom */}
      <div className="footer-bottom">

        <p>
          © {CURRENT_YEAR} BookEase. All rights reserved.
        </p>

        <p>
          Appointment Booking System
        </p>

      </div>

    </footer>
  );
}

export default Footer;