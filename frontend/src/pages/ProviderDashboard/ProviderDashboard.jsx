import { useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import AppointmentCard from "../../components/AppointmentCard/AppointmentCard";
import { useAuth } from "../../context/AuthContext";
import { hasStarted } from "../../utils/format";
import "../Dashboard/Dashboard.css";
import "../Appointments/Appointments.css";
import "./ProviderDashboard.css";

const TABS = [
  { key: "pending", label: "Requests", match: (a) => a.status === "Pending" },
  { key: "upcoming", label: "Upcoming", match: (a) => a.status === "Confirmed" && !hasStarted(a) },
  { key: "today", label: "To complete", match: (a) => a.status === "Confirmed" && hasStarted(a) },
  { key: "history", label: "History", match: (a) => ["Completed", "Cancelled"].includes(a.status) },
];

function ProviderDashboard() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(null);
  const [busy, setBusy] = useState(null);

  useEffect(() => {
    api
      .get("/appointments/provider")
      .then((res) => setAppointments(res.data.appointments))
      .catch((err) => setError(errorMessage(err, "Couldn't load your bookings.")))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.key, appointments.filter(t.match).length])),
    [appointments]
  );

  // Open on requests when there are any waiting, otherwise on upcoming.
  // No tab is chosen until bookings have loaded, so it doesn't flicker.
  const activeTab = tab || (loading ? null : counts.pending > 0 ? "pending" : "upcoming");
  const current = TABS.find((t) => t.key === activeTab);
  const list = current ? appointments.filter(current.match) : [];
  if (activeTab === "history") list.reverse();

  const setStatus = async (id, status) => {
    setBusy(`${id}:${status}`);
    setError("");
    try {
      const res = await api.patch(`/appointments/${id}/status`, { status });
      setAppointments((all) => all.map((a) => (a.id === id ? res.data.appointment : a)));
    } catch (err) {
      setError(errorMessage(err, "Couldn't update this booking."));
    } finally {
      setBusy(null);
    }
  };

  const actionButton = (appointment, status, label, variant) => (
    <button
      type="button"
      className={`pd-btn pd-btn-${variant}`}
      disabled={busy !== null}
      onClick={() => setStatus(appointment.id, status)}
    >
      {busy === `${appointment.id}:${status}` ? "Saving..." : label}
    </button>
  );

  return (
    <>
      <Navbar />

      <main className="dashboard-page">
        <section className="dashboard-container">

          <div className="dashboard-header">
            <span className="dashboard-badge">Provider Dashboard</span>
            <h1>Welcome, {user?.name}</h1>
            <p>Review booking requests, confirm appointments and keep your schedule up to date.</p>
          </div>

          {/* Summary */}
          <div className="pd-stats">
            <div className="pd-stat">
              <span>Waiting for you</span>
              <strong>{counts.pending}</strong>
              <small>booking {counts.pending === 1 ? "request" : "requests"}</small>
            </div>
            <div className="pd-stat">
              <span>Confirmed</span>
              <strong>{counts.upcoming}</strong>
              <small>upcoming</small>
            </div>
            <div className="pd-stat">
              <span>To complete</span>
              <strong>{counts.today}</strong>
              <small>already started</small>
            </div>
          </div>

          {/* Tabs */}
          <div className="pd-tabs" role="tablist">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={activeTab === t.key}
                className={`pd-tab ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label} <span>{counts[t.key]}</span>
              </button>
            ))}
          </div>

          {error && <div className="appointments-alert" role="alert">{error}</div>}

          {loading ? (
            <p className="appointments-section-empty">Loading your bookings...</p>
          ) : list.length === 0 ? (
            <p className="appointments-section-empty">
              {activeTab === "pending" && "No new booking requests right now."}
              {activeTab === "upcoming" && "No confirmed appointments coming up."}
              {activeTab === "today" && "Nothing waiting to be marked completed."}
              {activeTab === "history" && "Completed and cancelled appointments will appear here."}
            </p>
          ) : (
            <div className="appointments-list">
              {list.map((a) => (
                <AppointmentCard key={a.id} appointment={a} showCustomer>
                  {a.status === "Pending" && (
                    <>
                      {actionButton(a, "Cancelled", "Decline", "danger")}
                      {actionButton(a, "Confirmed", "Confirm", "primary")}
                    </>
                  )}
                  {a.status === "Confirmed" && (
                    <>
                      {actionButton(a, "Cancelled", "Cancel", "danger")}
                      {hasStarted(a) && actionButton(a, "Completed", "Mark completed", "success")}
                    </>
                  )}
                </AppointmentCard>
              ))}
            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}

export default ProviderDashboard;
