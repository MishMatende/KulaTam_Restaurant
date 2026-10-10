import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MAPS_DIRECTIONS_URL, RESTAURANT } from "../config";
import { useMenu } from "../context/MenuContext";
import { useOpenStatus } from "../lib/useOpenStatus";

export default function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const status = useOpenStatus();
  const { featured } = useMenu();
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);

  // Close on outside click or Escape.
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
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <i className="ti ti-bell"></i>
      </button>

      {open && (
        <div className="popover" role="dialog" aria-label="Notifications">
          <h4>Updates</h4>

          <div className="notice">
            <i className="ti ti-clock"></i>
            <div>
              <strong>{status.summary}</strong>
              <span>
                We're open daily, {status.openLabel} to {status.closeLabel}.
              </span>
            </div>
          </div>

          {featured[0] && (
            <div className="notice">
              <i className="ti ti-star"></i>
              <div>
                <strong>Try the {featured[0].name}</strong>
                <span>
                  <Link
                    to={`/menu?category=${featured[0].category.slug}#${featured[0].slug}`}
                    onClick={() => setOpen(false)}
                  >
                    See it on the menu
                  </Link>
                </span>
              </div>
            </div>
          )}

          <div className="notice">
            <i className="ti ti-map-pin"></i>
            <div>
              <strong>{RESTAURANT.shortLocation}</strong>
              <span>
                {RESTAURANT.landmark}.{" "}
                <a href={MAPS_DIRECTIONS_URL} target="_blank" rel="noreferrer">
                  Get directions
                </a>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
