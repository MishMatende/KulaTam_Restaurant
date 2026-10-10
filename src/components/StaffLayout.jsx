import { useEffect, useRef } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import Wordmark from "./Wordmark";

// Staff-only pages (/admin/*): no customer search, bell or bottom nav.
export default function StaffLayout() {
  const { pathname } = useLocation();
  const shellRef = useRef(null);

  useEffect(() => {
    shellRef.current?.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="staff-shell" ref={shellRef}>
      <header className="staff-header">
        <Link to="/admin" className="staff-brand">
          <img src="/favicon.svg" alt="" width="36" height="36" />
          <span>
            <Wordmark /> <small>Staff</small>
          </span>
        </Link>
        <Link to="/" className="staff-back">
          <i className="ti ti-arrow-left"></i>
          Back to site
        </Link>
      </header>

      <main className="staff-main">
        <Outlet />
      </main>
    </div>
  );
}
