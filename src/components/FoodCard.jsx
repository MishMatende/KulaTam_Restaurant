import { Link } from "react-router-dom";
import { formatPrice, TONE_COLOR } from "../lib/menu";

export default function FoodCard({ item }) {
  const color = TONE_COLOR[item.category.tone] ?? "orange";

  return (
    <Link
      to={`/menu?category=${item.category.slug}#${item.slug}`}
      className="food-card"
    >
      <div className={`food-image ${color}`}>
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} loading="lazy" />
        ) : (
          <i className={`ti ${item.category.icon}`}></i>
        )}
      </div>

      <div className="food-body">
        <div className={`tag ${color}`}>{item.badge ?? item.subcategory.name}</div>
        <div className="food-title">{item.name}</div>
        {item.description && <div className="food-desc">{item.description}</div>}
        <div className="food-footer">
          <div className="food-price">{formatPrice(item.price)}</div>
        </div>
      </div>
    </Link>
  );
}
