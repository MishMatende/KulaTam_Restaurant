import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { RESTAURANT } from "../config";
import Notifications from "./Notifications";

export default function Topbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const onMenu = pathname === "/menu";
  const query = onMenu ? params.get("q") ?? "" : "";

  // Searching from any page takes you to the menu with ?q=...
  const setQuery = (value) => {
    const next = new URLSearchParams(onMenu ? params : undefined);
    if (value) next.set("q", value);
    else next.delete("q");
    const search = next.toString();
    navigate(`/menu${search ? `?${search}` : ""}`, { replace: onMenu });
  };

  return (
    <header className="topbar">
      <div className="mobile-title">
        <strong>{RESTAURANT.name}</strong>
        <span>{RESTAURANT.shortLocation}</span>
      </div>

      <form
        className="search-bar"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          // Dismiss the on-screen keyboard so results are visible.
          e.currentTarget.querySelector("input")?.blur();
        }}
      >
        <i className="ti ti-search"></i>
        <input
          type="search"
          placeholder="Search menu items..."
          aria-label="Search menu items"
          enterKeyHint="search"
          autoComplete="off"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="search-clear"
            aria-label="Clear search"
            onClick={() => setQuery("")}
          >
            <i className="ti ti-x"></i>
          </button>
        )}
      </form>

      <div className="top-actions">
        <div className="google-rating">
          <div className="stars">★★★★★</div>
          <strong>{RESTAURANT.googleRating}</strong>
          <span>Google</span>
        </div>

        <Notifications />
      </div>
    </header>
  );
}
