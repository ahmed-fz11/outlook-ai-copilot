import { useState, useRef, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

type Step = "email" | "otp";

export function Login() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP box when step changes to otp
  useEffect(() => {
    if (step === "otp") {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // ── Step 1: Send OTP code to email ──────────────────────────
  const handleSendOtp = async () => {
    if (!email) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // shouldCreateUser: true allows new users to sign up via OTP
        shouldCreateUser: true,
      },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setStep("otp");
    }
  };

  // ── Step 2: Verify the 6-digit code ─────────────────────────
  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      // Clear code on error so user can try again
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
    // On success, useAuth()'s onAuthStateChange fires automatically
    // and App.tsx re-renders with session → TaskPane shows
  };

  // ── OTP input helpers ────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    // Accept only digits
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // Auto-advance to next box
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all 6 digits entered
    if (digit && index === 5 && next.every(Boolean)) {
      handleVerifyOtpWith(next.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") handleVerifyOtp();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      e.preventDefault();
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
      handleVerifyOtpWith(pasted);
    }
  };

  const handleVerifyOtpWith = async (code: string) => {
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }
  };

  // ── Render ───────────────────────────────────────────────────
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
        {step === "email" ? (
          <>
            <label>Work email</label>
            <input
              className="login-input"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendOtp()}
              autoFocus
            />
            <button
              className="btn-login"
              onClick={handleSendOtp}
              disabled={!email || loading}
            >
              {loading ? "Sending…" : "Send Code"}
            </button>
            {error && <div className="login-error">{error}</div>}
          </>
        ) : (
          <>
            <div className="otp-sent-notice">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <div>
                <p className="otp-sent-title">Check your inbox</p>
                <p className="otp-sent-email">{email}</p>
              </div>
            </div>

            <label style={{ marginTop: "16px" }}>Enter 6-digit code</label>
            <div className="otp-boxes" onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  className={`otp-box ${digit ? "otp-box-filled" : ""}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  disabled={loading}
                />
              ))}
            </div>

            <button
              className="btn-login"
              onClick={handleVerifyOtp}
              disabled={otp.join("").length < 6 || loading}
              style={{ marginTop: "14px" }}
            >
              {loading ? "Verifying…" : "Verify Code"}
            </button>

            {error && <div className="login-error">{error}</div>}

            <button
              className="otp-back-btn"
              onClick={() => {
                setStep("email");
                setOtp(["", "", "", "", "", ""]);
                setError("");
              }}
            >
              ← Use a different email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
