import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AuthShell from "../components/AuthShell.jsx";
import { api, getApiError } from "../lib/api.js";
import { useAuth } from "../state/AuthContext.jsx";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  otp: ""
};

export default function SignupPage() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
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
      toast.success("OTP sent to your phone");
    } catch (error) {
      setOtpSent(false);
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
      const response = await api.post("/auth/verify-otp", {
        phone: form.phone.trim(),
        otp: form.otp.trim()
      });

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

  async function submit(event) {
    event.preventDefault();

    if (!otpSent) {
      toast.error("Send OTP before creating the account");
      return;
    }

    if (!otpVerified && !(await verifyOtp())) {
      return;
    }

    setLoading(true);
    try {
      const signupPayload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password
      };
      const response = await api.post("/auth/signup", {
        ...signupPayload,
        otp: form.otp
      });
      login(response.data);
      toast.success("Account created securely");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getApiError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="Twilio SMS OTP is required before the account is stored in MongoDB.">
      <form className="form-stack" onSubmit={submit}>
        <label>
          Full name
          <input name="name" value={form.name} onChange={updateField} required minLength={2} placeholder="Enter your name" />
        </label>
        <label>
          Email
          <input name="email" type="email" value={form.email} onChange={updateField} required placeholder="you@example.com" />
        </label>
        <label>
          Phone number
          <div className="inline-action">
            <input name="phone" value={form.phone} onChange={updateField} required placeholder="+919876543210" />
            <button type="button" onClick={sendOtp} disabled={loading || otpSent}>
              {otpSent ? "Sent" : "Send OTP"}
            </button>
          </div>
        </label>
        <label>
          OTP
          <div className="inline-action">
            <input name="otp" inputMode="numeric" value={form.otp} onChange={updateField} required placeholder="6-digit OTP" />
            <button type="button" onClick={verifyOtp} disabled={loading || !otpSent || otpVerified}>
              {otpVerified ? "Verified" : "Verify"}
            </button>
          </div>
        </label>
        <label>
          Password
          <input name="password" type="password" value={form.password} onChange={updateField} required minLength={8} placeholder="Minimum 8 characters" />
        </label>
        <button className="primary-button" disabled={loading} type="submit">
          {loading ? "Securing account..." : "Sign up and continue"}
        </button>
      </form>
      <p className="switch-link">
        Already registered? <Link to="/signin">Sign in</Link>
      </p>
    </AuthShell>
  );
}
