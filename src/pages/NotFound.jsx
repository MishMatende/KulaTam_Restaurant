import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="empty-state">
      <i className="ti ti-compass"></i>
      <strong>Page not found</strong>
      <span>That page doesn't exist.</span>
      <br />
      <Link to="/" className="text-btn">
        Back home
      </Link>
    </div>
  );
}
