import { MAPS_DIRECTIONS_URL, MAPS_EMBED_URL, RESTAURANT } from "../config";
import { useOpenStatus } from "../lib/useOpenStatus";

export default function FindUs() {
  const status = useOpenStatus();

  return (
    <>
      <div className="page-header">
        <h1>Find us</h1>
        <p>Owang Energy, opposite Royal Finesse, Kitengela.</p>
      </div>

      <div className="find-grid">
        <div className="map-frame">
          <iframe
            title={`Map to ${RESTAURANT.name}`}
            src={MAPS_EMBED_URL}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>

        <div className="info-card">
          <div className={`status-pill${status.isOpen ? "" : " closed"}`}>
            {status.summary}
          </div>

          <div className="info-row">
            <i className="ti ti-map-pin"></i>
            <div>
              <strong>Address</strong>
              <span>
                {RESTAURANT.location}
                <br />
                {RESTAURANT.landmark}
              </span>
            </div>
          </div>

          <div className="info-row">
            <i className="ti ti-clock"></i>
            <div className="hours-list">
              <strong>Opening hours</strong>
              <div className="today">
                <span>Every day</span>
                <span>
                  {status.openLabel} – {status.closeLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="info-row">
            <i className="ti ti-star"></i>
            <div>
              <strong>{RESTAURANT.googleRating} on Google</strong>
              <span>Rated by our guests on Google Maps.</span>
            </div>
          </div>

          <a className="btn-primary" href={MAPS_DIRECTIONS_URL} target="_blank" rel="noreferrer">
            <i className="ti ti-directions"></i>
            Get directions
          </a>
        </div>
      </div>
    </>
  );
}
