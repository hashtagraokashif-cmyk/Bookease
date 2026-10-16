import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./NotFound.css";

function NotFound() {
  return (
    <>
      <Navbar />
      <main className="notfound-page">
        <div className="notfound-card">
          <span>404</span>
          <h1>Page not found</h1>
          <p>The page you're looking for doesn't exist or has moved.</p>
          <Link to="/" className="notfound-btn">Back to Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default NotFound;
