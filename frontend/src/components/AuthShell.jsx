import { ShieldCheck } from "lucide-react";

export default function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-shell">
      <section className="auth-brand">
        <div className="brand-mark">
          <ShieldCheck size={30} />
        </div>
        <h1>Secure KYC onboarding</h1>
        <p>
          Verify phone ownership with OTP, create a protected account, and continue into your investor dashboard.
        </p>
        <div className="trust-list">
          <span>JWT protected API</span>
          <span>Twilio SMS OTP</span>
          <span>MongoDB user profile</span>
        </div>
      </section>
      <section className="auth-panel">
        <div className="panel-heading">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        {children}
      </section>
    </main>
  );
}
