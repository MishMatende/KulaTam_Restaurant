import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { initialAuthHash } from "../lib/supabase";

const RESEND_SECONDS = 60;
const MIN_PASSWORD = 8;

// Error details Supabase appends to the link, e.g. when it has expired.
function linkError() {
  const params = new URLSearchParams(initialAuthHash.replace(/^#/, ""));
  const description = params.get("error_description");
  return params.get("error") ? description?.replace(/\+/g, " ") || "This link is invalid." : null;
}

function NotConfigured() {
  return (
    <div className="empty-state">
      <i className="ti ti-plug-connected-x"></i>
      <strong>Supabase isn't configured</strong>
      <span>Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to manage accounts.</span>
    </div>
  );
}

export function ForgotPassword() {
  const { enabled, sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  if (!enabled) return <NotConfigured />;

  const send = async (address) => {
    setBusy(true);
    setError("");
    try {
      await sendPasswordReset(address);
      setSentTo(address);
      setCooldown(RESEND_SECONDS);
    } catch (err) {
      setError(err.message || "Couldn't send the reset email. Try again shortly.");
    } finally {
      setBusy(false);
    }
  };

  if (sentTo) {
    return (
      <div className="admin-auth">
        <div className="page-header">
          <h1>Check your email</h1>
          <p>
            If an account exists for <strong>{sentTo}</strong>, we've sent a link to reset its
            password. The link works once and expires after a while.
          </p>
        </div>

        <div className="admin-card">
          <p className="auth-hint">
            Didn't get it? Check your spam folder, or send it again.
          </p>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <button
            className="text-btn"
            disabled={busy || cooldown > 0}
            onClick={() => send(sentTo)}
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : busy ? "Sending…" : "Resend email"}
          </button>
          <Link className="auth-link" to="/admin">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-auth">
      <div className="page-header">
        <h1>Forgot password</h1>
        <p>Enter your staff email and we'll send you a link to set a new password.</p>
      </div>

      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault();
          send(email.trim());
        }}
      >
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn-primary form-submit" disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
        </button>
        <Link className="auth-link" to="/admin">
          Back to sign in
        </Link>
      </form>
    </div>
  );
}

export function ResetPassword() {
  const { enabled, user, loading, updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const expired = linkError();

  if (!enabled) return <NotConfigured />;

  if (loading) {
    return (
      <div className="empty-state">
        <i className="ti ti-loader-2"></i>
        <strong>Checking your link…</strong>
      </div>
    );
  }

  if (expired || !user) {
    return (
      <div className="empty-state">
        <i className="ti ti-link-off"></i>
        <strong>This reset link has expired or is invalid</strong>
        <span>
          {expired ? `${expired}. ` : ""}Reset links only work once and for a limited time.
        </span>
        <br />
        <Link to="/admin/forgot-password" className="text-btn">
          Send a new link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="empty-state">
        <i className="ti ti-circle-check"></i>
        <strong>Password updated</strong>
        <span>You're signed in as {user.email}.</span>
        <br />
        <button className="btn-primary form-submit" onClick={() => navigate("/admin")}>
          Continue
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`);
      return;
    }
    if (password !== confirm) {
      setError("The passwords don't match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await updatePassword(password);
      setDone(true);
    } catch (err) {
      setError(err.message || "Couldn't update your password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="page-header">
        <h1>Set a new password</h1>
        <p>
          For {user.email}. Your account is shared with the other KulaTam branch, so the new
          password works there too.
        </p>
      </div>

      <form className="admin-card" onSubmit={submit}>
        <label className="field">
          <span>New password</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Confirm new password</span>
          <input
            type={show ? "text" : "password"}
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </label>
        <label className="toggle">
          <input type="checkbox" checked={show} onChange={(e) => setShow(e.target.checked)} />
          <span>Show passwords</span>
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn-primary form-submit" disabled={busy}>
          {busy ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
