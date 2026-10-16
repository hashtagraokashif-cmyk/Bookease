import { bookingRef, formatDate, formatPrice } from "../../utils/format";

/**
 * One appointment, in the existing "appointment-item" design. Used by both
 * My Appointments (customer) and the provider dashboard. Anything passed as
 * children (buttons) appears in the card's footer.
 */
function AppointmentCard({ appointment, showCustomer = false, children }) {
  const customer = appointment.customer;

  return (
    <article className="appointment-item" data-testid="appointment-card">

      {/* Top */}
      <div className="appointment-top">
        <div>
          <span className="appointment-label">
            {showCustomer ? "Booking request" : "Appointment"}
          </span>
          <h2>{appointment.serviceName}</h2>
          <p>
            {showCustomer && customer
              ? customer.name
              : `${appointment.providerName}${appointment.location ? ` · ${appointment.location}` : ""}`}
          </p>
        </div>

        <span className={`appointment-status ${appointment.status.toLowerCase()}`}>
          {appointment.status}
        </span>
      </div>

      {/* Details */}
      <div className="appointment-details">
        <div>
          <span>Date</span>
          <strong>{formatDate(appointment.date)}</strong>
        </div>
        <div>
          <span>Time</span>
          <strong>{appointment.timeLabel}</strong>
        </div>
        <div>
          <span>Duration</span>
          <strong>{appointment.duration} min</strong>
        </div>
        <div>
          <span>Price</span>
          <strong>{formatPrice(appointment.price)}</strong>
        </div>
      </div>

      {showCustomer && customer && (
        <div className="appointment-contact">
          <a href={`tel:${customer.phone}`}>📞 {customer.phone}</a>
          <a href={`mailto:${customer.email}`}>✉ {customer.email}</a>
        </div>
      )}

      {appointment.notes && (
        <p className="appointment-notes">
          <strong>Note:</strong> {appointment.notes}
        </p>
      )}

      {/* Footer */}
      <div className="appointment-item-footer">
        <span>
          Ref: {bookingRef(appointment.id)}
          {appointment.status === "Cancelled" && appointment.cancelledBy &&
            ` · cancelled by ${appointment.cancelledBy === "customer" ? (showCustomer ? "customer" : "you") : (showCustomer ? "you" : "provider")}`}
        </span>
        <div className="appointment-actions">{children}</div>
      </div>

    </article>
  );
}

export default AppointmentCard;
