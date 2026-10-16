import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import AppointmentCard from "../../components/AppointmentCard/AppointmentCard";
import { hasStarted } from "../../utils/format";
import "./Appointments.css";

const isUpcoming = (a) => ["Pending", "Confirmed"].includes(a.status) && !hasStarted(a);

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmingId, setConfirmingId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    api
      .get("/appointments/my")
      .then((res) => setAppointments(res.data.appointments))
      .catch((err) => setError(errorMessage(err, "Couldn't load your appointments.")))
      .finally(() => setLoading(false));
  }, []);

  const cancelAppointment = async (id) => {
    setBusyId(id);
    setError("");
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status: "Cancelled" });
      setAppointments((list) => list.map((a) => (a.id === id ? res.data.appointment : a)));
    } catch (err) {
      setError(errorMessage(err, "Couldn't cancel this appointment."));
    } finally {
      setBusyId(null);
      setConfirmingId(null);
    }
  };

  const upcoming = appointments.filter(isUpcoming);
  // Most recent first for history
  const past = appointments.filter((a) => !isUpcoming(a)).reverse();

  const renderCard = (appointment) => (
    <AppointmentCard key={appointment.id} appointment={appointment}>
      {isUpcoming(appointment) &&
        (confirmingId === appointment.id ? (
          <>
            <span className="cancel-question">Cancel this appointment?</span>
            <button
              type="button"
              className="cancel-appointment-btn"
              disabled={busyId === appointment.id}
              onClick={() => cancelAppointment(appointment.id)}
            >
              {busyId === appointment.id ? "Cancelling..." : "Yes, cancel"}
            </button>
            <button
              type="button"
              className="keep-appointment-btn"
              onClick={() => setConfirmingId(null)}
            >
              Keep it
            </button>
          </>
        ) : (
          <button
            type="button"
            className="cancel-appointment-btn"
            onClick={() => setConfirmingId(appointment.id)}
          >
            Cancel
          </button>
        ))}

      <Link to="/services" className="book-again-btn">
        Book Another
      </Link>
    </AppointmentCard>
  );

  return (
    <>
      <Navbar />

      <main className="appointments-page">

        <div className="appointments-container">

          {/* Heading */}

          <section className="appointments-heading">

            <span>
              My Appointments
            </span>

            <h1>
              Manage Your Appointments
            </h1>

            <p>
              View your upcoming and previous appointment
              requests in one place.
            </p>

          </section>

          {error && (
            <div className="appointments-alert" role="alert">{error}</div>
          )}

          {loading ? (

            <div className="empty-appointments">
              <h2>Loading your appointments...</h2>
            </div>

          ) : appointments.length > 0 ? (

            <>
              <h2 className="appointments-section-title">
                Upcoming <span>{upcoming.length}</span>
              </h2>

              {upcoming.length > 0 ? (
                <div className="appointments-list">{upcoming.map(renderCard)}</div>
              ) : (
                <p className="appointments-section-empty">
                  Nothing coming up. <Link to="/services">Book an appointment</Link>
                </p>
              )}

              {past.length > 0 && (
                <>
                  <h2 className="appointments-section-title">
                    Past & cancelled <span>{past.length}</span>
                  </h2>
                  <div className="appointments-list">{past.map(renderCard)}</div>
                </>
              )}
            </>

          ) : (

            <div className="empty-appointments">

              <div className="empty-icon">
                📅
              </div>

              <h2>
                No Appointments Yet
              </h2>

              <p>
                You don't have any appointments yet.
                Book your first appointment today.
              </p>

              <Link
                to="/services"
                className="book-first-btn"
              >
                Find a Service
              </Link>

            </div>

          )}

        </div>

      </main>

      <Footer />
    </>
  );
}

export default Appointments;
