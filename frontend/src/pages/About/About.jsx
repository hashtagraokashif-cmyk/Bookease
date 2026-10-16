import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./About.css";

function About() {
  return (
    <>
      <Navbar />

      <main className="about-page">

        {/* Hero */}
        <section className="about-hero">

          <span className="about-badge">
            About the System
          </span>

          <h1>
            A Smarter Way to
            <span>Manage Appointments</span>
          </h1>

          <p>
            Our Appointment Booking System provides a simple and
            organized platform where customers can discover service
            providers, view available services, and book appointments
            according to their preferred date and time.
          </p>

        </section>

        {/* Introduction */}
        <section className="about-introduction">

          <div className="about-intro-content">

            <span className="section-label">
              Our Platform
            </span>

            <h2>
              Making Appointment Booking Simple and Convenient
            </h2>

            <p>
              The system is designed for businesses and professionals
              that work with appointments, including doctors,
              consultants, salons, lawyers, and other service providers.
            </p>

            <p>
              Customers can search for providers and services,
              compare available options, select a suitable time slot,
              and manage their appointments from one platform.
            </p>

          </div>

          <div className="about-highlight">

            <div className="highlight-icon">
              ✓
            </div>

            <h3>
              Simple Booking Experience
            </h3>

            <p>
              Find a service, choose a provider, select an available
              slot, and confirm your appointment.
            </p>

          </div>

        </section>

        {/* How It Works */}
        <section className="about-workflow">

          <div className="about-section-heading">

            <span className="section-label">
              How It Works
            </span>

            <h2>
              From Search to Appointment
            </h2>

            <p>
              The platform keeps the appointment process clear,
              organized, and easy to manage.
            </p>

          </div>

          <div className="workflow-grid">

            <div className="workflow-card">

              <span className="workflow-number">
                01
              </span>

              <h3>
                Discover
              </h3>

              <p>
                Search and browse service providers according to
                category, location, or service.
              </p>

            </div>

            <div className="workflow-card">

              <span className="workflow-number">
                02
              </span>

              <h3>
                Choose
              </h3>

              <p>
                View provider information and available services,
                including duration and price.
              </p>

            </div>

            <div className="workflow-card">

              <span className="workflow-number">
                03
              </span>

              <h3>
                Book
              </h3>

              <p>
                Select an available date and time slot and submit
                your appointment request.
              </p>

            </div>

            <div className="workflow-card">

              <span className="workflow-number">
                04
              </span>

              <h3>
                Manage
              </h3>

              <p>
                Keep track of appointments and receive updates about
                appointment status.
              </p>

            </div>

          </div>

        </section>

        {/* Roles */}
        <section className="about-roles">

          <div className="about-section-heading">

            <span className="section-label">
              User Roles
            </span>

            <h2>
              Built for Everyone Involved
            </h2>

          </div>

          <div className="roles-grid">

            <div className="role-card">

              <div className="role-number">
                01
              </div>

              <h3>
                Customer
              </h3>

              <p>
                Search providers, view services, book appointments,
                and manage personal appointment requests.
              </p>

            </div>

            <div className="role-card">

              <div className="role-number">
                02
              </div>

              <h3>
                Provider
              </h3>

              <p>
                Manage services, availability, appointments,
                and provider profile information.
              </p>

            </div>

            <div className="role-card">

              <div className="role-number">
                03
              </div>

              <h3>
                Administrator
              </h3>

              <p>
                Manage users, providers, services, appointments,
                and overall system activity.
              </p>

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}

export default About;