import { Link } from "react-router-dom";
import { formatPrice, TONE_COLOR } from "../lib/menu";

export default function FoodCard({ item }) {
  const color = TONE_COLOR[item.category.tone] ?? "orange";

  return (
    <Link
      to={`/menu?category=${item.category.slug}#${item.slug}`}
      className={`food-card ${color}${item.imageUrl ? " has-image" : ""}`}
    >
      {/* Only real photos; no placeholder art. */}
      {item.imageUrl && (
        <div className="food-image">
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        </div>
      )}

      <div className="food-body">
        <div className="tag">{item.badge ?? item.subcategory.name}</div>
        <div className="food-title">{item.name}</div>
        {item.description && <div className="food-desc">{item.description}</div>}
        <div className="food-footer">
          <div className="food-price">{formatPrice(item.price)}</div>
          <span className="food-more">
            See on menu <i className="ti ti-arrow-right"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}
