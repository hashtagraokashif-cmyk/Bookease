import { useState } from "react";
import api, { errorMessage } from "../../api/axios";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import { useAuth } from "../../context/AuthContext";
// Uses the shared .form-group input styles from the login page.
import "../Login/Login.css";
import "./Profile.css";

function Profile() {
  const { user, updateUser } = useAuth();

  const [details, setDetails] = useState({ name: user.name, phone: user.phone });
  const [detailsMsg, setDetailsMsg] = useState(null);
  const [savingDetails, setSavingDetails] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const saveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    setDetailsMsg(null);
    try {
      const res = await api.put("/auth/me", details);
      updateUser({ ...user, ...res.data.user });
      setDetailsMsg({ type: "success", text: "Your details have been saved." });
    } catch (err) {
      setDetailsMsg({ type: "error", text: errorMessage(err, "Couldn't save your details.") });
    } finally {
      setSavingDetails(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwords.newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      setPasswordMsg({ type: "error", text: "The new passwords don't match." });
      return;
    }
    setSavingPassword(true);
    try {
      await api.put("/auth/me/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setPasswordMsg({ type: "success", text: "Password changed." });
    } catch (err) {
      setPasswordMsg({ type: "error", text: errorMessage(err, "Couldn't change your password.") });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-page">
        <div className="profile-container">

          <div className="profile-heading">
            <div className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
            <div>
              <span className="profile-role">{user.role === "provider" ? "Provider" : "Customer"}</span>
              <h1>{user.name}</h1>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-grid">

            <form className="profile-card" onSubmit={saveDetails}>
              <h2>Personal details</h2>
              <p className="profile-card-intro">This is how providers will see and contact you.</p>

              {detailsMsg && (
                <div className={`profile-msg ${detailsMsg.type}`} role={detailsMsg.type === "error" ? "alert" : "status"}>
                  {detailsMsg.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="profile-name">Full Name</label>
                <input
                  id="profile-name"
                  value={details.name}
                  onChange={(e) => setDetails({ ...details, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone">Phone Number</label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={details.phone}
                  onChange={(e) => setDetails({ ...details, phone: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="profile-email">Email Address</label>
                <input id="profile-email" value={user.email} disabled />
                <small className="profile-hint">Your email is your login and can't be changed here.</small>
              </div>

              <button type="submit" className="login-btn" disabled={savingDetails}>
                {savingDetails ? "Saving..." : "Save Details"}
              </button>
            </form>

            <form className="profile-card" onSubmit={savePassword}>
              <h2>Change password</h2>
              <p className="profile-card-intro">Use at least 8 characters.</p>

              {passwordMsg && (
                <div className={`profile-msg ${passwordMsg.type}`} role={passwordMsg.type === "error" ? "alert" : "status"}>
                  {passwordMsg.text}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="current-password">Current Password</label>
                <input
                  id="current-password"
                  type="password"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">New Password</label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirm-password">Confirm New Password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={passwords.confirm}
                  onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="login-btn" disabled={savingPassword}>
                {savingPassword ? "Saving..." : "Change Password"}
              </button>
            </form>

          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default Profile;
