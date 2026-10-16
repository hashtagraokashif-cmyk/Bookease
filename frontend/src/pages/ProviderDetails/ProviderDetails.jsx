import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { addDaysLocal, formatPrice, todayLocal } from "../../utils/format";
import "./ProviderDetails.css";

const BOOKING_WINDOW_DAYS = 60;
const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function ProviderDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Result of loading this provider, tagged with the id it belongs to, so
  // "loading" is simply "we don't have a result for this id yet".
  const [loaded, setLoaded] = useState({ id: null, provider: null, error: "" });

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");

  // Same idea for time slots: tagged with the service + date they are for.
  const slotsKey = selectedService && selectedDate ? `${selectedService.id}|${selectedDate}` : null;
  const [slotsResult, setSlotsResult] = useState({ key: null, data: null, error: "" });

  // Provider profile + services
  useEffect(() => {
    let cancelled = false;
    api
      .get(`/providers/${id}`)
      .then((res) => {
        if (cancelled) return;
        const p = res.data.provider;
        setLoaded({ id, provider: p, error: "" });
        // "Book Appointment" on a service card arrives with ?service=<id>
        const preselected = p.services.find((s) => s.id === searchParams.get("service"));
        setSelectedService(preselected || null);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoaded({
          id,
          provider: null,
          error:
            err.response?.status === 404
              ? "This provider doesn't exist or is no longer taking bookings."
              : errorMessage(err, "Couldn't load this provider."),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [id, searchParams]);

  // Live time slots whenever the service or date changes
  useEffect(() => {
    if (!slotsKey) return;
    const [serviceId, date] = slotsKey.split("|");
    let cancelled = false;
    api
      .get(`/providers/${id}/availability`, { params: { date, serviceId } })
      .then((res) => !cancelled && setSlotsResult({ key: slotsKey, data: res.data, error: "" }))
      .catch((err) =>
        !cancelled && setSlotsResult({ key: slotsKey, data: null, error: errorMessage(err, "Couldn't load times.") })
      );
    return () => {
      cancelled = true;
    };
  }, [id, slotsKey]);

  const loading = loaded.id !== id;
  const provider = loading ? null : loaded.provider;
  const loadError = loading ? "" : loaded.error;

  const slotsLoading = Boolean(slotsKey) && slotsResult.key !== slotsKey;
  const availability = slotsResult.key === slotsKey ? slotsResult.data : null;
  const slotsError = slotsResult.key === slotsKey ? slotsResult.error : "";

  const handleServiceSelect = (service) => {
    setSelectedService(service);
  };

  const handleSlotSelect = (slot) => {
    navigate("/appointments/book", {
      state: {
        provider: {
          id: provider.id,
          name: provider.name,
          category: provider.category,
          location: provider.location,
        },
        service: selectedService,
        date: selectedDate,
        time: slot.time,
        timeLabel: slot.label,
      },
    });
  };

  if (loading || loadError) {
    return (
      <>
        <Navbar />
        <main className="provider-page">
          <div className="provider-container">
            <Link to="/services" className="back-link">
              ← Back to Services
            </Link>
            <div className="booking-message">
              <h3>{loading ? "Loading provider..." : "Provider not found"}</h3>
              {loadError && <p>{loadError}</p>}
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const openDays = provider.workingDays
    .slice()
    .sort((a, b) => ((a + 6) % 7) - ((b + 6) % 7)) // Monday first
    .map((d) => DAY_SHORT[d])
    .join(", ");

  return (
    <>
      <Navbar />

      <main className="provider-page">

        <div className="provider-container">

          {/* Back Button */}

          <Link
            to="/services"
            className="back-link"
          >
            ← Back to Services
          </Link>

          {/* Provider Profile */}

          <section className="provider-profile">

            <div className="provider-profile-main">

              <div className="provider-large-avatar">
                {provider.name.charAt(0)}
              </div>

              <div className="provider-profile-info">

                <span className="provider-category">
                  {provider.category}
                </span>

                <h1>
                  {provider.name}
                </h1>

                <p>
                  {provider.bio}
                </p>

                <div className="provider-contact">

                  <span>
                    📍 {provider.location}
                  </span>

                  {provider.phone && (
                    <span>
                      📞 {provider.phone}
                    </span>
                  )}

                  {provider.email && (
                    <span>
                      ✉ {provider.email}
                    </span>
                  )}

                  <span>
                    🕒 {openDays}
                  </span>

                </div>

              </div>

            </div>

          </section>

          {/* Services */}

          <section className="provider-section">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  Services
                </span>

                <h2>
                  Services Offered
                </h2>

              </div>

              <p>
                Select a service to continue with your appointment.
              </p>

            </div>

            <div className="provider-services">

              {provider.services.map((service) => (

                <button
                  type="button"
                  key={service.id}
                  className={`provider-service ${
                    selectedService?.id === service.id
                      ? "selected"
                      : ""
                  }`}
                  aria-pressed={selectedService?.id === service.id}
                  onClick={() => handleServiceSelect(service)}
                >

                  <div className="service-select-content">

                    <h3>
                      {service.name}
                    </h3>

                    <p>
                      {service.description}
                    </p>

                  </div>

                  <div className="service-select-meta">

                    <span>
                      {service.duration} min
                    </span>

                    <strong>
                      {formatPrice(service.price)}
                    </strong>

                  </div>

                </button>

              ))}

            </div>

          </section>

          {/* Booking Section */}

          <section className="booking-section">

            <div className="section-heading">

              <div>

                <span className="section-label">
                  Book Appointment
                </span>

                <h2>
                  Choose Date & Time
                </h2>

              </div>

            </div>

            {/* No service selected */}

            {!selectedService && (

              <div className="booking-message">

                <h3>
                  Select a service first
                </h3>

                <p>
                  Choose one of the services above to see
                  available appointment slots.
                </p>

              </div>

            )}

            {/* Service selected */}

            {selectedService && (

              <div className="booking-area">

                {/* Selected Service */}

                <div className="selected-service">

                  <span>
                    Selected Service
                  </span>

                  <strong>
                    {selectedService.name}
                  </strong>

                  <small>
                    {selectedService.duration} minutes · {formatPrice(selectedService.price)}
                  </small>

                </div>

                {/* Date */}

                <div className="date-selection">

                  <label htmlFor="appointment-date">
                    Select Date
                  </label>

                  <input
                    id="appointment-date"
                    type="date"
                    value={selectedDate}
                    min={todayLocal()}
                    max={addDaysLocal(todayLocal(), BOOKING_WINDOW_DAYS)}
                    onChange={(e) =>
                      setSelectedDate(e.target.value)
                    }
                  />

                </div>

                {/* Time Slots */}

                {selectedDate && (

                  <div className="slots-section">

                    <div className="slots-heading">

                      <h3>
                        Available Time Slots
                      </h3>

                      <span>
                        {selectedService.duration} min
                        appointment
                      </span>

                    </div>

                    {slotsLoading ? (

                      <p className="slots-note">Checking available times...</p>

                    ) : slotsError ? (

                      <p className="slots-note slots-note-error">{slotsError}</p>

                    ) : availability && !availability.open ? (

                      <p className="slots-note">{availability.message}</p>

                    ) : availability && availability.slots.length === 0 ? (

                      <p className="slots-note">{availability.message}</p>

                    ) : availability ? (

                      <div className="slots-grid">

                        {availability.slots.map((slot) =>
                          slot.available ? (
                            <button
                              type="button"
                              key={slot.time}
                              className="time-slot"
                              onClick={() => handleSlotSelect(slot)}
                            >
                              {slot.label}
                            </button>
                          ) : (
                            <span
                              key={slot.time}
                              className="time-slot unavailable"
                              title="Already booked"
                              aria-disabled="true"
                            >
                              {slot.label}
                              <small>Booked</small>
                            </span>
                          )
                        )}

                      </div>

                    ) : null}

                  </div>

                )}

              </div>

            )}

          </section>

        </div>

      </main>

      <Footer />
    </>
  );
}

export default ProviderDetails;
