import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  announcementStatus,
  deleteAnnouncement,
  fetchAllAnnouncements,
  formatDateTime,
  saveAnnouncement,
} from "../lib/announcements";

const STATUS_LABEL = { live: "Live", scheduled: "Scheduled", expired: "Expired", draft: "Draft" };

// <input type="datetime-local"> works in the viewer's local time.
function toLocalInput(date) {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const emptyForm = () => ({
  title: "",
  body: "",
  link_url: "",
  starts_at: toLocalInput(new Date()),
  ends_at: "",
  is_published: true,
});

export default function Admin() {
  const { enabled, user, isAdmin, loading, signOut } = useAuth();

  if (!enabled) {
    return (
      <AdminMessage icon="ti-plug-connected-x" title="Supabase isn't configured">
        Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to manage announcements.
      </AdminMessage>
    );
  }
  if (loading) return <AdminMessage icon="ti-loader-2" title="Checking your account…" />;
  if (!user) return <SignIn />;
  if (!isAdmin) {
    return (
      <AdminMessage icon="ti-lock" title="This account can't manage KulaTam">
        You're signed in as {user.email}, but you're not a KulaTam admin. Ask the owner to add
        you to admins_kt.
        <br />
        <button className="text-btn" onClick={signOut}>
          Sign out
        </button>
      </AdminMessage>
    );
  }
  return <AnnouncementManager />;
}

function AdminMessage({ icon, title, children }) {
  return (
    <div className="empty-state">
      <i className={`ti ${icon}`}></i>
      <strong>{title}</strong>
      {children && <span>{children}</span>}
    </div>
  );
}

function SignIn() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || "Couldn't sign in.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-auth">
      <div className="page-header">
        <h1>Staff sign in</h1>
        <p>Sign in to post announcements for KulaTam.</p>
      </div>

      <form className="admin-card" onSubmit={submit}>
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
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="btn-primary form-submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <Link className="auth-link" to="/admin/forgot-password">
          Forgot password?
        </Link>
      </form>
    </div>
  );
}

function AnnouncementManager() {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    fetchAllAnnouncements()
      .then(setItems)
      .catch((err) => setError(err.message));
  }, []);

  useEffect(load, [load]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  const reset = () => {
    setForm(emptyForm());
    setEditingId(null);
    setError("");
  };

  const edit = (a) => {
    setEditingId(a.id);
    setError("");
    setForm({
      title: a.title,
      body: a.body ?? "",
      link_url: a.link_url ?? "",
      starts_at: toLocalInput(a.starts_at),
      ends_at: toLocalInput(a.ends_at),
      is_published: a.is_published,
    });
    document.querySelector(".staff-shell")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
      load();
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const startsAt = form.starts_at ? new Date(form.starts_at) : new Date();
    const endsAt = form.ends_at ? new Date(form.ends_at) : null;
    if (endsAt && endsAt <= startsAt) {
      setError("The end time must be after the start time.");
      return;
    }
    const fields = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      link_url: form.link_url.trim() || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt?.toISOString() ?? null,
      is_published: form.is_published,
    };
    if (await run(() => saveAnnouncement(editingId, fields))) reset();
  };

  const togglePublished = (a) => run(() => saveAnnouncement(a.id, { is_published: !a.is_published }));

  const remove = (a) => {
    if (window.confirm(`Delete “${a.title}”? This can't be undone.`)) {
      run(() => deleteAnnouncement(a.id));
      if (editingId === a.id) reset();
    }
  };

  return (
    <div className="staff-content">
      <div className="page-header admin-header">
        <div>
          <h1>Announcements</h1>
          <p>Posts appear under the bell for everyone visiting the site.</p>
        </div>
        <div className="admin-user">
          <span>{user.email}</span>
          <button className="text-btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </div>

      <div className="admin-grid">
        <form className="admin-card" onSubmit={submit}>
          <h3>{editingId ? "Edit announcement" : "New announcement"}</h3>

          <label className="field">
            <span>
              Title <em>{form.title.length}/80</em>
            </span>
            <input
              required
              maxLength={80}
              value={form.title}
              onChange={set("title")}
              placeholder="Today's special: Fish Stew"
            />
          </label>

          <label className="field">
            <span>
              Message <em>{form.body.length}/280</em>
            </span>
            <textarea
              rows={3}
              maxLength={280}
              value={form.body}
              onChange={set("body")}
              placeholder="Optional details"
            />
          </label>

          <label className="field">
            <span>Link (optional)</span>
            <input
              type="url"
              inputMode="url"
              pattern="https?://.+"
              value={form.link_url}
              onChange={set("link_url")}
              placeholder="https://"
            />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Show from</span>
              <input type="datetime-local" value={form.starts_at} onChange={set("starts_at")} />
            </label>
            <label className="field">
              <span>Until (optional)</span>
              <input type="datetime-local" value={form.ends_at} onChange={set("ends_at")} />
            </label>
          </div>

          <label className="toggle">
            <input type="checkbox" checked={form.is_published} onChange={set("is_published")} />
            <span>Published</span>
          </label>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button className="btn-primary form-submit" disabled={busy}>
              {editingId ? "Save changes" : "Post announcement"}
            </button>
            {editingId && (
              <button type="button" className="text-btn" onClick={reset}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="admin-list">
          {items.length === 0 ? (
            <p className="popover-empty">No announcements yet. Your first post will appear here.</p>
          ) : (
            items.map((a) => {
              const status = announcementStatus(a);
              return (
                <article key={a.id} className={`admin-item${editingId === a.id ? " editing" : ""}`}>
                  <div className="admin-item-head">
                    <span className={`status-chip ${status}`}>{STATUS_LABEL[status]}</span>
                    <span className="admin-item-time">
                      {formatDateTime(a.starts_at)}
                      {a.ends_at && ` → ${formatDateTime(a.ends_at)}`}
                    </span>
                  </div>
                  <strong>{a.title}</strong>
                  {a.body && <p>{a.body}</p>}
                  <div className="admin-item-actions">
                    <button className="text-btn" onClick={() => edit(a)} disabled={busy}>
                      Edit
                    </button>
                    <button className="text-btn" onClick={() => togglePublished(a)} disabled={busy}>
                      {a.is_published ? "Unpublish" : "Publish"}
                    </button>
                    <button className="text-btn danger" onClick={() => remove(a)} disabled={busy}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
