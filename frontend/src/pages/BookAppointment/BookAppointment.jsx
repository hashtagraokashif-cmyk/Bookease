import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { formatDate, formatPrice, formatTime } from "../../utils/format";
import "./BookAppointment.css";

function BookAppointment() {
  const location = useLocation();
  const navigate = useNavigate();

  const bookingData = location.state;

  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // No booking data (e.g. the page was opened directly)
  if (!bookingData?.service) {
    return (
      <>
        <Navbar />

        <main className="booking-page">
          <div className="booking-error">
            <div className="booking-error-icon">!</div>

            <h1>No Appointment Selected</h1>

            <p>
              Please select a provider, service, date and time
              slot first.
            </p>

            <Link to="/services" className="back-services-btn">
              Browse Services
            </Link>
          </div>
        </main>

        <Footer />
      </>
    );
  }

  const { provider, service, date, time } = bookingData;
  const timeLabel = bookingData.timeLabel || formatTime(time);
  const backToProvider = `/providers/${provider.id}?service=${service.id}`;

  // Confirm appointment: saved on the server, which re-checks the slot.
  const handleConfirmAppointment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post("/appointments", {
        serviceId: service.id,
        date,
        time,
        notes,
      });

      navigate("/appointments/success", {
        replace: true,
        state: { appointment: response.data.appointment },
      });
    } catch (err) {
      setError({
        message: errorMessage(err, "Couldn't book this appointment. Please try again."),
        slotGone: err.response?.status === 409 || err.response?.status === 400,
      });
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="booking-page">
        <div className="booking-container">

          <Link to={backToProvider} className="booking-back">
            ← Change date or time
          </Link>

          {/* Heading */}
          <div className="booking-heading">
            <span>Appointment Booking</span>
            <h1>Confirm Your Appointment</h1>
            <p>Please review your appointment details before confirming.</p>
          </div>

          <div className="booking-layout">

            {/* Summary */}
            <section className="booking-summary" aria-label="Appointment summary">
              <div className="summary-header">
                <div className="summary-avatar">{provider.name.charAt(0)}</div>
                <div>
                  <span>Provider</span>
                  <h2>{provider.name}</h2>
                  <p>{provider.category}</p>
                </div>
              </div>

              <div className="summary-divider" />

              <div className="summary-item">
                <span>Service</span>
                <strong>{service.name}</strong>
              </div>

              <div className="summary-item">
                <span>Date</span>
                <strong>{formatDate(date)}</strong>
              </div>

              <div className="summary-item">
                <span>Time</span>
                <strong>{timeLabel}</strong>
              </div>

              <div className="summary-item">
                <span>Duration</span>
                <strong>{service.duration} minutes</strong>
              </div>

              {provider.location && (
                <div className="summary-item">
                  <span>Location</span>
                  <strong>{provider.location}</strong>
                </div>
              )}

              <div className="summary-price">
                <span>Total Price</span>
                <strong>{formatPrice(service.price)}</strong>
              </div>
            </section>

            {/* Form */}
            <form className="booking-form-card" onSubmit={handleConfirmAppointment}>
              <div className="form-card-heading">
                <h2>Anything the provider should know?</h2>
                <p>Add a short note for your appointment, or leave it blank.</p>
              </div>

              <div className="booking-field">
                <label htmlFor="booking-notes">
                  Notes <span>Optional</span>
                </label>
                <textarea
                  id="booking-notes"
                  rows={5}
                  maxLength={500}
                  placeholder="E.g. reason for the visit, or anything to bring"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="booking-notice">
                <strong>What happens next?</strong>
                <p>
                  Your request is sent to {provider.name} as Pending. You can
                  follow its status, or cancel it, from My Appointments.
                </p>
              </div>

              {error && (
                <div className="booking-alert" role="alert">
                  {error.message}
                  {error.slotGone && (
                    <>
                      <br />
                      <Link to={backToProvider}>Choose another time →</Link>
                    </>
                  )}
                </div>
              )}

              <button
                type="submit"
                className="confirm-booking-btn"
                disabled={submitting}
              >
                {submitting ? "Booking..." : "Confirm Appointment"}
              </button>
            </form>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default BookAppointment;
