import { createContext, useContext, useEffect, useMemo, useState } from "react";
import localMenu from "../data/menu.json";
import { fetchMenu, flattenMenu } from "../lib/menu";

const MenuContext = createContext(null);

// Renders instantly from the bundled menu, then swaps in the live
// Supabase menu (categories_kt / subcategories_kt / menu_items_kt) once loaded.
export function MenuProvider({ children }) {
  const [categories, setCategories] = useState(localMenu.categories);
  const [source, setSource] = useState("local");

  useEffect(() => {
    let cancelled = false;
    fetchMenu()
      .then((live) => {
        if (cancelled) return;
        setCategories(live);
        setSource("supabase");
      })
      .catch((err) => {
        console.warn("Using bundled menu:", err.message ?? err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const items = flattenMenu(categories);
    return {
      categories,
      items,
      featured: items.filter((i) => i.featured),
      source,
    };
  }, [categories, source]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside <MenuProvider>");
  return ctx;
}
