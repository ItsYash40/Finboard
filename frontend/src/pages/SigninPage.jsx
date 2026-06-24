import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell.jsx";
import { api, getApiError } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

export default function SigninPage() {
  const [mode, setMode] = useState("password");
  const [form, setForm] = useState({ email: "", password: "", phone: "", otp: "" });
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (event.target.name === "phone") {
      setOtpSent(false);
    }
    if (event.target.name === "phone" || event.target.name === "otp") {
      setOtpVerified(false);
    }
  }

  async function passwordSignin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/auth/signin", {
        email: form.email,
        password: form.password
      });
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  async function sendOtp() {
    if (!form.phone.startsWith("+")) {
      toast.error("Use country code format, for example +919876543210");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/send-otp", { phone: form.phone.trim() });
      setOtpSent(true);
      setOtpVerified(false);
      if (response.data.devOtp) {
        setForm((current) => ({ ...current, otp: response.data.devOtp }));
      }
      toast.success("OTP sent");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp() {
    if (!otpSent) {
      toast.error("Send OTP first");
      return false;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", { phone: form.phone.trim(), otp: form.otp.trim() });

      if (!response.data.approved) {
        toast.error("Invalid or expired OTP");
        return false;
      }

      setOtpVerified(true);
      toast.success("Phone number verified");
      return true;
    } catch (error) {
      toast.error(getApiError(error));
      return false;
    } finally {
      setLoading(false);
    }
  }

  async function otpSignin(event) {
    event.preventDefault();
    if (!otpSent) {
      toast.error("Send OTP first");
      return;
    }

    if (!otpVerified && !(await verifyOtp())) {
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/phone-login", { phone: form.phone.trim(), otp: form.otp });
      login(response.data);
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Sign in" subtitle="Use password sign-in or Twilio phone OTP for quick access.">
      <div className="segmented">
        <button className={mode === "password" ? "active" : ""} type="button" onClick={() => setMode("password")}>
          Email
        </button>
        <button className={mode === "otp" ? "active" : ""} type="button" onClick={() => setMode("otp")}>
          Phone OTP
        </button>
      </div>

      {mode === "password" ? (
        <form className="form-stack" onSubmit={passwordSignin}>
          <label>
            Email
            <input name="email" type="email" value={form.email} onChange={updateField} required />
          </label>
          <label>
            Password
            <input name="password" type="password" value={form.password} onChange={updateField} required />
          </label>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Checking..." : "Sign in"}
          </button>
        </form>
      ) : (
        <form className="form-stack" onSubmit={otpSignin}>
          <label>
            Phone number
            <div className="inline-action">
              <input name="phone" value={form.phone} onChange={updateField} placeholder="+919876543210" required />
              <button type="button" onClick={sendOtp} disabled={loading || otpSent}>
                {otpSent ? "Sent" : "Send OTP"}
              </button>
            </div>
          </label>
          <label>
            OTP
            <div className="inline-action">
              <input name="otp" inputMode="numeric" value={form.otp} onChange={updateField} required />
              <button type="button" onClick={verifyOtp} disabled={loading || !otpSent || otpVerified}>
                {otpVerified ? "Verified" : "Verify"}
              </button>
            </div>
          </label>
          <button className="primary-button" disabled={loading} type="submit">
            {loading ? "Verifying..." : "Sign in with OTP"}
          </button>
        </form>
      )}

      <p className="switch-link">
        New here? <Link to="/signup">Create account</Link>
      </p>
    </AuthShell>
  );
}
