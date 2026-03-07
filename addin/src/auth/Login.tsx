import { useState } from "react";
import { supabase } from "../services/supabaseClient";

export function Login() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="container login">
      <h2>Email Copilot</h2>
      <p className="subtitle">Sign in to get started</p>

      {sent ? (
        <div className="success-message">
          <p>Magic link sent! Check your inbox.</p>
        </div>
      ) : (
        <div className="login-form">
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          />
          <button onClick={handleLogin} disabled={!email}>
            Send Magic Link
          </button>
          {error && <p className="error-message">{error}</p>}
        </div>
      )}
    </div>
  );
}
