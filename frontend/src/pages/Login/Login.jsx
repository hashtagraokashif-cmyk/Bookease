import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api, { errorMessage } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import "./Login.css";


function Login() {

  const navigate = useNavigate();
  const location = useLocation();
  const { saveSession } = useAuth();

  // Where the visitor was heading before being asked to log in (if anywhere).
  const from = location.state?.from;

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setLoading(true);


    try {

      const response = await api.post("/auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });


      if (response.data.success) {

        // Save JWT token + logged-in user
        saveSession(response.data.token, response.data.user);

        // Back to where they were going, or to the right home for their role.
        if (from?.pathname) {
          navigate(from.pathname + (from.search || ""), { replace: true, state: from.state });
        } else {
          navigate(response.data.user.role === "provider" ? "/dashboard" : "/", { replace: true });
        }

      }

    } catch (error) {

      setError(
        errorMessage(error, "Login failed. Please check your email and password.")
      );

    } finally {

      setLoading(false);

    }

  };


  return (
    <>
      <Navbar />


      <main className="login-page">

        <div className="login-container">


          <div className="login-header">

            <span className="login-badge">
              Welcome Back
            </span>

            <h1>
              Login to Your Account
            </h1>

            <p>
              {from?.pathname === "/appointments/book"
                ? "Log in to confirm your appointment. Your selected time is saved."
                : "Access your appointments and manage your bookings."}
            </p>

          </div>


          <form
            className="login-form"
            onSubmit={handleSubmit}
          >


            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}


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
                autoComplete="email"
                required
              />

            </div>


            <div className="form-group">

              <label htmlFor="password">
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
                required
              />

            </div>


            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Login"
              }

            </button>


          </form>


          <div className="login-footer">

            <p>
              Don't have an account?
              {" "}

              <Link to="/signup" state={{ from }}>
                Create Account
              </Link>
            </p>

          </div>


        </div>

      </main>


      <Footer />
    </>
  );
}


export default Login;
