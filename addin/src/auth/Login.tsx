import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-hero">
        <div className="login-hero-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.88 5.76a1 1 0 0 0 .95.69h6.06l-4.9 3.56a1 1 0 0 0-.36 1.12L17.5 20l-4.9-3.56a1 1 0 0 0-1.18 0L6.5 20l1.87-5.87a1 1 0 0 0-.36-1.12L3.11 9.45h6.06a1 1 0 0 0 .95-.69L12 3z"/>
          </svg>
        </div>
        <h1>Email Copilot</h1>
        <p>AI-powered reply assistant for Outlook</p>
      </div>

      <div className="login-body">
        {sent ? (
          <div className="login-success">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <p>Magic link sent!</p>
            <small>Check your inbox at {email}</small>
          </div>
        ) : (
          <>
            <label>Work email</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              autoFocus
            />
            <button
              className="btn-login"
              onClick={handleLogin}
              disabled={!email || loading}
            >
              {loading ? "Sending…" : "Send Magic Link"}
            </button>
            {error && <div className="login-error">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
