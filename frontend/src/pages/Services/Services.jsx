import { useEffect, useMemo, useState } from "react";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import ServiceCard from "../../components/ServiceCard/ServiceCard";
import "./Services.css";

function Services() {

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/services")
      .then((res) => {
        // Shape each service the way ServiceCard expects.
        setServices(
          res.data.services.map((s) => ({
            id: s.id,
            providerId: s.provider.id,
            providerName: s.provider.name,
            category: s.provider.category,
            name: s.name,
            description: s.description,
            duration: s.duration,
            price: s.price,
            location: s.provider.location,
          }))
        );
      })
      .catch((err) => setError(errorMessage(err, "Couldn't load services.")))
      .finally(() => setLoading(false));
  }, []);

  // Filter options come from whatever providers exist in the database.
  const categories = useMemo(() => [...new Set(services.map((s) => s.category))].sort(), [services]);
  const locations = useMemo(() => [...new Set(services.map((s) => s.location))].sort(), [services]);

  const filteredServices = services.filter((service) => {

    const term = search.trim().toLowerCase();

    const matchesSearch =
      service.name.toLowerCase().includes(term) ||
      service.providerName.toLowerCase().includes(term);

    const matchesCategory =
      category === "All" || service.category === category;

    const matchesLocation =
      location === "All" || service.location === location;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesLocation
    );
  });

  return (
    <>
      <Navbar />

      <main className="services-page">

        {/* Header */}

        <section className="services-header">

          <span className="services-badge">
            Appointment Booking System
          </span>

          <h1>
            Find the Right Service
          </h1>

          <p>
            Browse providers and services, compare available options,
            and choose the appointment that works best for you.
          </p>

        </section>

        {/* Filters */}

        <section className="services-filters">

          <div className="search-box">
            <input
              type="text"
              placeholder="Search provider or service..."
              aria-label="Search provider or service"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={category}
            aria-label="Filter by category"
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={location}
            aria-label="Filter by location"
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="All">All Locations</option>
            {locations.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

        </section>

        {/* Results */}

        <section className="services-results">

          <div className="results-header">
            <h2>
              Available Services
            </h2>

            {!loading && !error && (
              <span>
                {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"} found
              </span>
            )}
          </div>

          {loading ? (

            <div className="no-results">
              <h3>Loading services...</h3>
            </div>

          ) : error ? (

            <div className="no-results">
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>

          ) : filteredServices.length > 0 ? (

            <div className="services-grid">

              {filteredServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                />
              ))}

            </div>

          ) : (

            <div className="no-results">
              <h3>No services found</h3>

              <p>
                Try changing your search or filter options.
              </p>
            </div>

          )}

        </section>

      </main>

      <Footer />
    </>
  );
}

export default Services;
