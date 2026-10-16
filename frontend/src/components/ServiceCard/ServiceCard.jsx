import { Link } from "react-router-dom";
import "./ServiceCard.css";

function ServiceCard({ service }) {
  return (
    <article className="service-card">

      {/* Provider Header */}

      <div className="service-card-provider">

        <div className="provider-avatar">
          {service.providerName?.charAt(0) || "P"}
        </div>

        <div className="provider-info">

          <h3>
            {service.providerName}
          </h3>

          <span>
            {service.category}
          </span>

        </div>

      </div>

      {/* Service Information */}

      <div className="service-card-content">

        <h2>
          {service.name}
        </h2>

        <p>
          {service.description}
        </p>

        {/* Duration & Price */}

        <div className="service-meta">

          <div className="meta-box">

            <span>
              Duration
            </span>

            <strong>
              {service.duration} min
            </strong>

          </div>

          <div className="meta-box">

            <span>
              Price
            </span>

            <strong>
              Rs. {Number(service.price).toLocaleString("en-PK")}
            </strong>

          </div>

        </div>

        {/* Location */}

        <div className="service-location">
          📍 {service.location}
        </div>

      </div>

      {/* Buttons */}

      <div className="service-card-actions">

        {/* View Provider */}

        <Link
          to={`/providers/${service.providerId}`}
          className="view-provider-btn"
        >
          View Provider
        </Link>

        {/* Book Appointment */}

        <Link
          to={`/providers/${service.providerId}?service=${service.id}`}
          className="book-appointment-btn"
        >
          Book Appointment
        </Link>

      </div>

    </article>
  );
}

export default ServiceCard;