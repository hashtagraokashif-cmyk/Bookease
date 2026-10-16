import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import { useAuth } from "../../context/AuthContext";
import Footer from "../../components/Footer/Footer";
import "./Home.css";

function Home() {
  const { user } = useAuth();

  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Main Home Content */}
      <main className="home">

        {/* Hero Section */}
        <section className="home-hero">

          {/* Left Content */}
          <div className="home-content">

            <span className="home-badge">
              Simple • Fast • Reliable
            </span>

            <h1>
              Book Your Appointment
              <span>With Ease.</span>
            </h1>

            <p>
              Find trusted service providers, choose a convenient
              time, and manage your appointments from one simple platform.
            </p>

            <div className="home-buttons">

              <Link
                to="/services"
                className="primary-btn"
              >
                Explore Services
              </Link>

              {user ? (
                <Link
                  to={user.role === "provider" ? "/dashboard" : "/appointments"}
                  className="secondary-btn"
                >
                  {user.role === "provider" ? "My Dashboard" : "My Appointments"}
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="secondary-btn"
                >
                  Create Account
                </Link>
              )}

            </div>

          </div>

          {/* Right Appointment Card */}
          <div className="home-card">

            <div className="card-icon">
              ✓
            </div>

            <h2>
              Easy Appointment Booking
            </h2>

            <p>
              Select a service, choose a provider, pick an available
              date and time, and confirm your appointment.
            </p>

            <div className="card-steps">

              <div>
                <strong>01</strong>
                <span>Choose Service</span>
              </div>

              <div>
                <strong>02</strong>
                <span>Select Time</span>
              </div>

              <div>
                <strong>03</strong>
                <span>Confirm Appointment</span>
              </div>

            </div>

          </div>

        </section>

      </main>

      {/* Footer */}
      <Footer />
    </>
  );
}

export default Home;