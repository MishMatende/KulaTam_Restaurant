import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { fetchLiveAnnouncements, timeAgo } from "../lib/announcements";
import { useOpenStatus } from "../lib/useOpenStatus";

// When this viewer last opened the bell. Only drives the unread dot,
// so losing it (private mode, cleared storage) is harmless.
const SEEN_KEY = "kt-announcements-seen";

function readSeen() {
  try {
    return Number(localStorage.getItem(SEEN_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeSeen(time) {
  try {
    localStorage.setItem(SEEN_KEY, String(time));
  } catch {
    // Storage unavailable; the dot will just show again next visit.
  }
}

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [seen, setSeen] = useState(readSeen);
  const ref = useRef(null);
  const status = useOpenStatus();
  const { isAdmin } = useAuth();
  const location = useLocation();

  const load = useCallback(() => {
    fetchLiveAnnouncements()
      .then(setAnnouncements)
      .catch((err) => console.warn("Announcements unavailable:", err.message ?? err));
  }, []);

  useEffect(load, [load]);
  useEffect(() => setOpen(false), [location]);

  const hasUnread = announcements.some((a) => new Date(a.starts_at).getTime() > seen);

  const toggle = () => {
    if (!open) {
      load();
      const now = Date.now();
      writeSeen(now);
      setSeen(now);
    }
    setOpen((v) => !v);
  };

  // Close on outside tap or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="popover-anchor" ref={ref}>
      <button
        className={`icon-btn${open ? " active" : ""}`}
        aria-label={hasUnread ? "Announcements (new)" : "Announcements"}
        aria-expanded={open}
        onClick={toggle}
      >
        <i className="ti ti-bell"></i>
        {hasUnread && <span className="unread-dot" aria-hidden="true"></span>}
      </button>

      {open && (
        <div className="popover" role="dialog" aria-label="Announcements">
          <h4>Announcements</h4>

          {announcements.length === 0 ? (
            <p className="popover-empty">No announcements right now. Check back soon.</p>
          ) : (
            <div className="announcement-list">
              {announcements.map((a) => (
                <div key={a.id} className="notice">
                  <i className="ti ti-speakerphone"></i>
                  <div>
                    <strong>{a.title}</strong>
                    {a.body && <span className="notice-body">{a.body}</span>}
                    <span className="notice-meta">
                      {timeAgo(a.starts_at)}
                      {a.link_url && (
                        <>
                          {" · "}
                          <a href={a.link_url} target="_blank" rel="noopener noreferrer">
                            Learn more
                          </a>
                        </>
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="popover-footer">
            <span className={status.isOpen ? "open" : "closed"}>{status.summary}</span>
            {isAdmin && <Link to="/admin">Manage announcements</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
