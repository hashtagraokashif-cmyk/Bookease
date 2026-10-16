import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
import { formatDate, hasStarted } from "../../utils/format";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState(null);

  useEffect(() => {
    api
      .get("/appointments/my")
      .then((res) =>
        setUpcoming(
          res.data.appointments.filter(
            (a) => ["Pending", "Confirmed"].includes(a.status) && !hasStarted(a)
          )
        )
      )
      .catch(() => setUpcoming([]));
  }, []);

  const next = upcoming?.[0];

  return (
    <>
      <Navbar />

      <main className="dashboard-page">

        <section className="dashboard-container">

          <div className="dashboard-header">

            <span className="dashboard-badge">
              BookEase
            </span>

            <h1>
              Welcome back, {user?.name?.split(" ")[0]}
            </h1>

            <p>
              Manage your profile, appointments and account
              from one simple place.
            </p>

          </div>

          {next && (
            <Link to="/appointments" className="dashboard-next">
              <span className="dashboard-next-label">Next appointment</span>
              <strong>
                {next.serviceName} with {next.providerName}
              </strong>
              <span>
                {formatDate(next.date)} at {next.timeLabel} ·{" "}
                <em className={`dashboard-next-status ${next.status.toLowerCase()}`}>{next.status}</em>
              </span>
            </Link>
          )}

          <div className="dashboard-grid">

            {/* Profile */}
            <div className="dashboard-card">

              <h2>
                My Profile
              </h2>

              <p>
                View and manage your personal account information.
              </p>

              <Link
                to="/profile"
                className="dashboard-btn"
              >
                View Profile
              </Link>

            </div>


            {/* Appointments */}
            <div className="dashboard-card">

              <h2>
                My Appointments
              </h2>

              <p>
                {upcoming === null
                  ? "View your upcoming and previous appointments."
                  : upcoming.length === 0
                    ? "You have no upcoming appointments."
                    : `You have ${upcoming.length} upcoming ${upcoming.length === 1 ? "appointment" : "appointments"}.`}
              </p>

              <Link
                to="/appointments"
                className="dashboard-btn"
              >
                View Appointments
              </Link>

            </div>


            {/* Services */}
            <div className="dashboard-card">

              <h2>
                Find Services
              </h2>

              <p>
                Browse available services and book an appointment.
              </p>

              <Link
                to="/services"
                className="dashboard-btn"
              >
                Browse Services
              </Link>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Dashboard;
