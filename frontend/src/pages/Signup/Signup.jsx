import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useAuth();

  // Where the visitor was heading before signing up (e.g. a booking).
  const from = location.state?.from;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Basic frontend validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        ...formData,
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
      });

      if (response.data.success) {
        // The new account is logged in straight away.
        saveSession(response.data.token, response.data.user);

        setSuccess(
          from?.pathname
            ? "Account created! Taking you back to your booking..."
            : "Account created successfully! You're now logged in."
        );

        setTimeout(() => {
          if (from?.pathname) {
            navigate(from.pathname + (from.search || ""), { replace: true, state: from.state });
          } else {
            navigate("/services", { replace: true });
          }
        }, 1200);
      } else {
        setError(response.data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);

      setError(errorMessage(error, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="signup-page">
        <div className="signup-container">

          {/* Header */}

          <div className="signup-header">
            <span className="signup-badge">
              Get Started
            </span>

            <h1>
              Create Your Account
            </h1>

            <p>
              Join BookEase and manage your appointments easily.
            </p>
          </div>


          {/* Form */}

          <form
            className="signup-form"
            onSubmit={handleSubmit}
          >

            {/* Error */}

            {error && (
              <div className="signup-error" role="alert">
                {error}
              </div>
            )}


            {/* Success */}

            {success && (
              <div className="signup-success" role="status">
                {success}
              </div>
            )}


            {/* Name */}

            <div className="form-group">
              <label htmlFor="name">
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>


            {/* Email */}

            <div className="form-group">
              <label htmlFor="email">
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>


            {/* Phone */}

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="03XXXXXXXXX"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>


            {/* Password */}

            <div className="form-group">
              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={handleChange}
                minLength="8"
                required
              />
            </div>


            {/* Button */}

            <button
              type="submit"
              className="signup-btn"
              disabled={loading}
            >
              {loading
                ? "Creating Account..."
                : "Create Account"}
            </button>

          </form>


          {/* Login link */}

          <div className="signup-footer">
            <p>
              Already have an account?{" "}
              <Link to="/login" state={{ from }}>
                Login
              </Link>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}

export default Signup;