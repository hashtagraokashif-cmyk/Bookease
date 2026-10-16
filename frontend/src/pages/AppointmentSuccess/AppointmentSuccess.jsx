import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { bookingRef, formatDate, formatPrice, formatTime } from "../../utils/format";
import "./AppointmentSuccess.css";

function AppointmentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  // The appointment exactly as the server saved it.
  const appointment = location.state?.appointment;

  // No appointment data
  if (!appointment) {
    return (
      <>
        <Navbar />

        <main className="success-page">

          <div className="success-error">

            <div className="error-icon">
              !
            </div>

            <h1>
              No Appointment Found
            </h1>

            <p>
              There is no appointment information to display.
              Please book an appointment first.
            </p>

            <button
              type="button"
              className="success-main-btn"
              onClick={() => navigate("/services")}
            >
              Browse Services
            </button>

          </div>

        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="success-page">

        <div className="success-container">

          {/* Success Icon */}

          <div className="success-icon">
            ✓
          </div>

          {/* Heading */}

          <div className="success-heading">

            <span>
              BOOKING SUBMITTED
            </span>

            <h1>
              Appointment Request Sent!
            </h1>

            <p>
              Your appointment request has been submitted
              successfully. Please wait for the provider to
              review your request.
            </p>

          </div>

          {/* Appointment Card */}

          <section className="appointment-card">

            <div className="appointment-card-header">

              <div>

                <span>
                  Appointment Details
                </span>

                <h2>
                  {appointment.serviceName}
                </h2>

              </div>

              <div className="pending-badge">
                {appointment.status}
              </div>

            </div>

            <div className="appointment-divider" />

            {/* Reference */}

            <div className="appointment-detail">

              <span>

                Booking Reference

              </span>

              <strong>

                {bookingRef(appointment.id)}

              </strong>

            </div>

            {/* Provider */}

            <div className="appointment-detail">

              <span>
                Provider
              </span>

              <strong>
                {appointment.providerName}
              </strong>

            </div>

            {/* Date */}

            <div className="appointment-detail">

              <span>
                Date
              </span>

              <strong>
                {formatDate(appointment.date)}
              </strong>

            </div>

            {/* Time */}

            <div className="appointment-detail">

              <span>
                Time
              </span>

              <strong>
                {appointment.timeLabel || formatTime(appointment.time)}
              </strong>

            </div>

            {/* Duration */}

            <div className="appointment-detail">

              <span>
                Duration
              </span>

              <strong>
                {appointment.duration} minutes
              </strong>

            </div>

            {/* Price */}

            <div className="appointment-total">

              <span>
                Total Price
              </span>

              <strong>
                {formatPrice(appointment.price)}
              </strong>

            </div>

          </section>

          {/* Information */}

          <div className="success-info">

            <strong>
              What happens next?
            </strong>

            <p>
              The provider will review your appointment
              request. You can check your appointment status
              from your appointments dashboard.
            </p>

          </div>

          {/* Buttons */}

          <div className="success-actions">

            <button
              type="button"
              className="success-main-btn"
              onClick={() => navigate("/appointments")}
            >
              View My Appointments
            </button>

            <button
              type="button"
              className="success-secondary-btn"
              onClick={() => navigate("/services")}
            >
              Book Another Appointment
            </button>

          </div>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default AppointmentSuccess;