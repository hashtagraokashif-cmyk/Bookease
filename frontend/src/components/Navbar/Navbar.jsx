import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isProvider = user?.role === "provider";

  // Phones and tablets: links and account buttons live in a drop-down menu.
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const closeMenu = () => setMenuOpen(false);

  // Close the menu with Escape or by tapping anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    const onPointer = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    closeMenu();
    logout();
    navigate("/");
  };

  return (
    <header className={`navbar ${menuOpen ? "menu-open" : ""}`} ref={headerRef}>
      <div className="navbar-container">

        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeMenu}>
          <span>Book</span>Ease
        </Link>

        {/* Menu button (phones and tablets only) */}
        <button
          type="button"
          className="navbar-toggle"
          aria-expanded={menuOpen}
          aria-controls="navbar-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
          <span className="navbar-toggle-bar" />
        </button>

        {/* Links + account buttons. On desktop these sit in the bar as before. */}
        <div className="navbar-menu" id="navbar-menu">

          {/* Navigation */}
          <nav className="navbar-links" aria-label="Main">

            <NavLink to="/" end onClick={closeMenu}>
              Home
            </NavLink>

            <NavLink to="/services" onClick={closeMenu}>
              Services
            </NavLink>

            {isProvider ? (
              <NavLink to="/dashboard" onClick={closeMenu}>
                Dashboard
              </NavLink>
            ) : (
              <NavLink to="/appointments" onClick={closeMenu}>
                Appointments
              </NavLink>
            )}

            <NavLink to="/about" onClick={closeMenu}>
              About
            </NavLink>

          </nav>

          {/* Login + Signup, or the logged-in user */}
          <div className="navbar-actions">

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="navbar-login-btn navbar-user"
                  title="Your dashboard"
                  onClick={closeMenu}
                >
                  <span className="navbar-user-initial">
                    {user.name?.charAt(0).toUpperCase()}
                  </span>
                  {user.name?.split(" ")[0]}
                </Link>

                <button
                  type="button"
                  className="navbar-register-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="navbar-login-btn"
                  onClick={closeMenu}
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="navbar-register-btn"
                  onClick={closeMenu}
                >
                  Signup
                </Link>
              </>
            )}

          </div>

        </div>

      </div>
    </header>
  );
}

export default Navbar;
