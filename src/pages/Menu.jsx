import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { useMenu } from "../context/MenuContext";
import { countItems, formatPrice, matchesSearch } from "../lib/menu";

export default function Menu() {
  const { categories } = useMenu();
  const [params, setParams] = useSearchParams();
  const { hash } = useLocation();
  const [highlight, setHighlight] = useState(null);
  const filtersRef = useRef(null);

  const query = params.get("q") ?? "";
  const activeCategory = categories.find((c) => c.slug === params.get("category")) ?? null;
  const activeSub = activeCategory?.subcategories.find((s) => s.slug === params.get("sub")) ?? null;

  const updateParams = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) =>
      value ? next.set(key, value) : next.delete(key),
    );
    setParams(next, { replace: true });
    // Switching category/subcategory starts the list from the top.
    if ("category" in changes || "sub" in changes) {
      document.querySelector(".main-content")?.scrollTo({ top: 0 });
    }
  };

  // Keep the selected chips visible in their horizontally scrolling rows.
  useEffect(() => {
    filtersRef.current?.querySelectorAll(".chip.active").forEach((chip) => {
      const row = chip.parentElement;
      row.scrollTo({
        left: chip.offsetLeft - row.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2,
        behavior: "smooth",
      });
    });
  }, [activeCategory, activeSub]);

  const sections = useMemo(
    () =>
      (activeCategory ? [activeCategory] : categories)
        .map((category) => ({
          ...category,
          subcategories: category.subcategories
            .filter((s) => !activeSub || s.slug === activeSub.slug)
            .map((subcategory) => ({
              ...subcategory,
              items: subcategory.items.filter((item) =>
                matchesSearch({ ...item, category, subcategory }, query),
              ),
            }))
            .filter((s) => s.items.length),
        }))
        .filter((c) => c.subcategories.length),
    [categories, activeCategory, activeSub, query],
  );

  const resultCount = sections.reduce((n, c) => n + countItems(c), 0);

  // Jump to an item linked as /menu?category=x#item-slug.
  useEffect(() => {
    const slug = decodeURIComponent(hash.slice(1));
    if (!slug) return;
    const el = document.getElementById(slug);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    setHighlight(slug);
    const t = setTimeout(() => setHighlight(null), 2200);
    return () => clearTimeout(t);
  }, [hash, sections]);

  return (
    <>
      <div className="page-header">
        <h1>{activeCategory ? activeCategory.name : "Full Menu"}</h1>
        <p>
          {activeCategory
            ? activeCategory.description
            : "Everything we serve, from breakfast to fresh juices. Prices in Kenyan shillings."}
        </p>
      </div>

      <div className="menu-filters" ref={filtersRef}>
        <div className="chip-row" role="tablist" aria-label="Categories">
          <button
            role="tab"
            aria-selected={!activeCategory}
            className={`chip${activeCategory ? "" : " active"}`}
            onClick={() => updateParams({ category: null, sub: null })}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              role="tab"
              aria-selected={activeCategory?.slug === category.slug}
              className={`chip${activeCategory?.slug === category.slug ? " active" : ""}`}
              onClick={() => updateParams({ category: category.slug, sub: null })}
            >
              <i className={`ti ${category.icon}`}></i>
              {category.name}
              <span className="chip-count">{countItems(category)}</span>
            </button>
          ))}
        </div>

        {activeCategory && activeCategory.subcategories.length > 1 && (
          <div className="chip-row" aria-label="Subcategories">
            <button
              className={`chip small${activeSub ? "" : " active"}`}
              onClick={() => updateParams({ sub: null })}
            >
              All {activeCategory.name}
            </button>
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.slug}
                className={`chip small${activeSub?.slug === sub.slug ? " active" : ""}`}
                onClick={() => updateParams({ sub: sub.slug })}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {query && (
        <p className="results-note">
          {resultCount} result{resultCount === 1 ? "" : "s"} for “{query}”
          {activeCategory && ` in ${activeSub?.name ?? activeCategory.name}`}.
        </p>
      )}

      {sections.length === 0 ? (
        <div className="empty-state">
          <i className="ti ti-mood-empty"></i>
          <strong>No dishes found</strong>
          <span>Try a different search or browse another category.</span>
          <br />
          <button
            className="text-btn"
            onClick={() => updateParams({ q: null, category: null, sub: null })}
          >
            Show full menu
          </button>
        </div>
      ) : (
        sections.map((category) => (
          <section key={category.slug} className="menu-category">
            {!activeCategory && (
              <div className={`menu-category-head ${category.tone}`}>
                <h2>{category.name}</h2>
                <p>{category.description}</p>
              </div>
            )}

            {category.subcategories.map((sub) => (
              <div key={sub.slug} className="menu-sub">
                <h3>{sub.name}</h3>
                <div className="menu-list">
                  {sub.items.map((item) => (
                    <article
                      key={item.slug}
                      id={item.slug}
                      className={`menu-item${highlight === item.slug ? " highlight" : ""}`}
                    >
                      <div className="menu-item-line">
                        <h4 className="menu-item-name">{item.name}</h4>
                        <span className="leader" aria-hidden="true"></span>
                        <span className="menu-item-price">{formatPrice(item.price)}</span>
                      </div>
                      {item.description && <p className="menu-item-desc">{item.description}</p>}
                      {(item.badge || item.veg) && (
                        <div className="menu-item-tags">
                          {item.badge && <span className="badge-inline">{item.badge}</span>}
                          {item.veg && <span className="veg-badge">Vegetarian</span>}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </section>
        ))
      )}
    </>
  );
}
