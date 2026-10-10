import { NavLink } from "react-router-dom";

export default function MobileNav() {
  return (
    <nav className="mobile-nav" aria-label="Primary navigation">
      <NavLink to="/" end>
        <i className="ti ti-home"></i>
        <span>Home</span>
      </NavLink>
      <NavLink to="/menu">
        <i className="ti ti-layout-grid"></i>
        <span>Menu</span>
      </NavLink>
      <NavLink to="/find-us">
        <i className="ti ti-map-pin"></i>
        <span>Find us</span>
      </NavLink>
    </nav>
  );
}
