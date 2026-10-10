import { Link, useNavigate } from "react-router-dom";
import { MAPS_DIRECTIONS_URL, RESTAURANT } from "../config";
import { useMenu } from "../context/MenuContext";
import { countItems } from "../lib/menu";
import { useOpenStatus } from "../lib/useOpenStatus";
import FoodCard from "../components/FoodCard";

export default function Home() {
  const { categories, items, featured } = useMenu();
  const status = useOpenStatus();
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <div className={`hero-pill${status.isOpen ? "" : " closed"}`}>
            <i className="ti ti-clock"></i>
            {status.summary}
          </div>

          <h1>
            Good food,
            <br />
            <em>great</em> vibes.
          </h1>

          <p>
            Fresh meals and handcrafted drinks, made just for you. Breakfast through
            dinner, from Swahili classics to kienyeji chicken.
          </p>

          <div className="hero-buttons">
            <button className="btn-primary" onClick={() => navigate("/menu")}>
              <i className="ti ti-menu-2"></i>
              Browse menu
            </button>

            <button
              className="btn-secondary"
              onClick={() => window.open(MAPS_DIRECTIONS_URL, "_blank", "noopener")}
            >
              <i className="ti ti-map-pin"></i>
              Get directions
            </button>
          </div>
        </div>

        <dl className="hero-info">
          <div>
            <dt>Hours</dt>
            <dd>
              Every day, {status.openLabel} – {status.closeLabel}
            </dd>
          </div>
          <div>
            <dt>Where</dt>
            <dd>Owang Energy, opposite Royal Finesse, Kitengela</dd>
          </div>
          <div>
            <dt>Rated</dt>
            <dd>
              <span className="stars" aria-hidden="true">★★★★★</span> {RESTAURANT.googleRating} on Google
            </dd>
          </div>
          <div>
            <dt>Menu</dt>
            <dd>{items.length} dishes &amp; drinks</dd>
          </div>
        </dl>
      </section>

      <div className="content-grid">
        <div>
          <div className="section-header">
            <h3>Categories</h3>
            <Link to="/menu">See all</Link>
          </div>

          <div className="categories">
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`category ${category.tone}`}
                onClick={() => navigate(`/menu?category=${category.slug}`)}
              >
                <div className="category-icon">
                  <i className={`ti ${category.icon}`}></i>
                </div>
                <span>{category.name}</span>
                <small>{countItems(category)} items</small>
              </button>
            ))}
          </div>

          <div className="section-header">
            <h3>Featured</h3>
          </div>

          <div className="featured-grid">
            {featured.map((item) => (
              <FoodCard key={item.slug} item={item} />
            ))}
          </div>
        </div>

        <aside className="right-column">
          <div className="mini-list">
            <div className="section-header">
              <h3>More options</h3>
              <Link to="/menu">See all</Link>
            </div>

            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/menu?category=${category.slug}`}
                className="mini-card"
              >
                <div className="mini-left">
                  <div className={`mini-icon ${category.tone}`}>
                    <i className={`ti ${category.icon}`}></i>
                  </div>

                  <div className="mini-info">
                    <h4>{category.name}</h4>
                    <span>{countItems(category)} items</span>
                  </div>
                </div>

                <div className="mini-arrow">
                  <i className="ti ti-arrow-right"></i>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </>
  );
}
