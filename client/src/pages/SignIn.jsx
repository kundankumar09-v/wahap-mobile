import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config";
import "./Auth.css";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const navigate = useNavigate();

  const redirectAfterLogin = (name, email, picture) => {
    localStorage.setItem("wahap_temp_user", name);
    if (email) localStorage.setItem("wahap_user_email", email);
    if (picture) localStorage.setItem("wahap_user_picture", picture);
    window.dispatchEvent(new Event("wahap_auth_change"));
    const pendingMap = sessionStorage.getItem("pendingMapRedirect");
    if (pendingMap) {
      sessionStorage.removeItem("pendingMapRedirect");
      navigate(`/event/${pendingMap}`);
    } else {
      // Redirect to admin dashboard if user is admin
      const isAdmin = email?.toLowerCase() === "admin@wahap.com" || email?.toLowerCase() === "admin@gmail.com";
      navigate(isAdmin ? "/admin" : "/");
    }
  };

  const extractName = (emailStr) => {
    const local = emailStr.split("@")[0];
    return local
      .replace(/[._\-0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ") || "User";
  };

  const validateGmail = (val) => {
    const v = val.trim().toLowerCase();
    if (!v) return "Enter an email or phone number.";
    if (!v.includes("@")) return "Enter a valid email address.";
    if (!v.endsWith("@gmail.com")) return "Couldn't find your Google Account. Only Gmail addresses (@gmail.com) are accepted.";
    const local = v.split("@")[0];
    if (local.length < 6) return "Gmail username must be at least 6 characters.";
    if (!/^[a-z0-9][a-z0-9._]*[a-z0-9]$/.test(local)) return "Enter a valid Gmail address.";
    return null;
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Sign in failed");
        setLoading(false);
        return;
      }

      redirectAfterLogin(data.user.name, data.user.email, null);
    } catch (err) {
      setError("Error connecting to server. Please try again.");
      setLoading(false);
      console.error("Signin error:", err);
    }
  };

  const handleGoogleEmailChange = (e) => {
    setGoogleEmail(e.target.value);
    if (googleError) setGoogleError("");
  };

  const handleGoogleSubmit = (e) => {
    e.preventDefault();
    const err = validateGmail(googleEmail);
    if (err) { setGoogleError(err); return; }
    setGoogleLoading(true);
    setTimeout(() => {
      setGoogleLoading(false);
      setShowGoogleModal(false);
      const name = extractName(googleEmail.trim().toLowerCase());
      // Use a Google avatar URL derived from the email for a realistic look
      redirectAfterLogin(name, googleEmail.trim().toLowerCase(), null);
    }, 1200);
  };

  const GoogleIcon = () => (
    <svg className="google-icon" viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" style={{ textDecoration: "none" }}>
            <div className="auth-logo">WAHAP</div>
          </Link>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to continue exploring events</p>
        </div>

        <div className="auth-form">
          <button type="button" className="google-btn" onClick={() => { setGoogleEmail(""); setGoogleError(""); setShowGoogleModal(true); }}>
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>

          <div className="auth-divider">
            <div className="divider-line"></div>
            <span>OR</span>
            <div className="divider-line"></div>
          </div>

          {error && (
            <div style={{
              backgroundColor: "#fee",
              color: "#c33",
              padding: "12px",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "14px",
              border: "1px solid #fcc"
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignIn}>
            <div className="auth-input-group">
              <label>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="auth-input-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Sign Up here</Link>
        </div>
      </div>

      {showGoogleModal && (
        <div className="google-modal-overlay" onClick={() => setShowGoogleModal(false)}>
          <div className="google-modal" onClick={e => e.stopPropagation()}>
            <div className="google-modal-header">
              <GoogleIcon />
              <h3>Sign in</h3>
              <p>to continue to WAHAP</p>
            </div>
            <form className="google-modal-form" onSubmit={handleGoogleSubmit}>
              <div className="google-modal-input-wrap">
                <input
                  type="text"
                  placeholder=" "
                  value={googleEmail}
                  onChange={handleGoogleEmailChange}
                  autoFocus
                  className={`google-modal-input ${googleError ? "input-error" : ""}`}
                />
                <label className="google-modal-label">Email or phone</label>
                {googleError && (
                  <div className="google-modal-error">
                    <svg viewBox="0 0 24 24" width="16" height="16"><path fill="#d93025" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                    {googleError}
                  </div>
                )}
              </div>
              <p className="google-modal-hint">
                Not your computer? Use a private browsing window to sign in.
              </p>
              <div className="google-modal-actions">
                <button type="button" className="google-modal-cancel" onClick={() => setShowGoogleModal(false)}>Cancel</button>
                <button type="submit" className="google-modal-next" disabled={googleLoading}>
                  {googleLoading ? <span className="google-btn-spinner" style={{borderColor:"rgba(255,255,255,0.3)",borderTopColor:"#fff"}}></span> : "Next"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignIn;
