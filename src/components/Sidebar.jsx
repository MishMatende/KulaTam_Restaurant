import { Link, NavLink, useLocation, useSearchParams } from "react-router-dom";
import { RESTAURANT } from "../config";
import Wordmark from "./Wordmark";
import { useMenu } from "../context/MenuContext";
import { useOpenStatus } from "../lib/useOpenStatus";

export default function Sidebar() {
  const { categories } = useMenu();
  const status = useOpenStatus();
  const { pathname } = useLocation();
  const [params] = useSearchParams();
  const activeCategory = pathname === "/menu" ? params.get("category") : null;

  return (
    <aside className="sidebar">
      <div>
        <div className="brand">
          <h2>
            <Wordmark />
          </h2>
          <p>
            {RESTAURANT.location}
            <br />
            {RESTAURANT.landmark}
          </p>

          <div className={`status-pill${status.isOpen ? "" : " closed"}`}>
            {status.summary}
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Main</div>

          <div className="nav-links">
            <NavLink to="/" end className="nav-item">
              <div className="nav-left">
                <i className="ti ti-home"></i>
                <span>Home</span>
              </div>
            </NavLink>

            <NavLink
              to="/menu"
              className={() => `nav-item${pathname === "/menu" && !activeCategory ? " active" : ""}`}
            >
              <div className="nav-left">
                <i className="ti ti-layout-grid"></i>
                <span>Full Menu</span>
              </div>
            </NavLink>

            <NavLink to="/find-us" className="nav-item">
              <div className="nav-left">
                <i className="ti ti-map-pin"></i>
                <span>Find us</span>
              </div>
            </NavLink>
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-title">Categories</div>

          <div className="nav-links">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/menu?category=${category.slug}`}
                className={`nav-item${activeCategory === category.slug ? " active" : ""}`}
              >
                <div className="nav-left">
                  <i className={`ti ${category.icon}`}></i>
                  <span>{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <Link to="/find-us" className="footer-link">
          <i className="ti ti-map-pin"></i>
          <span>Find us</span>
        </Link>
      </div>
    </aside>
  );
}
