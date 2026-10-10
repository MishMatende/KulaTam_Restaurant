import { supabase } from "./supabase";

const bySortOrder = (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0);

// Maps rows from the *_kt tables to the same shape as src/data/menu.json.
function fromSupabase(rows) {
  return rows
    .filter((c) => c.is_active)
    .sort(bySortOrder)
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      description: c.description,
      icon: c.icon,
      tone: c.tone,
      subcategories: (c.subcategories_kt ?? [])
        .filter((s) => s.is_active)
        .sort(bySortOrder)
        .map((s) => ({
          slug: s.slug,
          name: s.name,
          items: (s.menu_items_kt ?? [])
            .filter((i) => i.is_available)
            .sort(bySortOrder)
            .map((i) => ({
              slug: i.slug,
              name: i.name,
              description: i.description,
              price: i.price,
              veg: i.is_vegetarian,
              featured: i.is_featured,
              badge: i.badge,
              imageUrl: i.image_url,
            })),
        })),
    }));
}

export async function fetchMenu() {
  if (!supabase) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("categories_kt")
    .select(
      `slug, name, description, icon, tone, sort_order, is_active,
       subcategories_kt (
         slug, name, sort_order, is_active,
         menu_items_kt (
           slug, name, description, price, is_vegetarian,
           is_featured, badge, image_url, is_available, sort_order
         )
       )`,
    );

  if (error) throw error;
  const categories = fromSupabase(data ?? []);
  if (!categories.length) throw new Error("Menu tables are empty");
  return categories;
}

// Flat list of items, each carrying its category and subcategory.
export function flattenMenu(categories) {
  return categories.flatMap((category) =>
    category.subcategories.flatMap((subcategory) =>
      subcategory.items.map((item) => ({ ...item, category, subcategory })),
    ),
  );
}

export const countItems = (category) =>
  category.subcategories.reduce((n, s) => n + s.items.length, 0);

const PRICE_FORMAT = new Intl.NumberFormat("en-KE");
export const formatPrice = (amount) => `KSh ${PRICE_FORMAT.format(amount)}`;

// Theme colour name used by .food-image / .tag for each category tone.
export const TONE_COLOR = {
  am: "orange",
  lu: "green",
  me: "red",
  dr: "blue",
  sn: "yellow",
  pu: "purple",
  tl: "teal",
};

export function matchesSearch(item, query) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.name, item.description, item.subcategory.name, item.category.name]
    .filter(Boolean)
    .some((text) => text.toLowerCase().includes(q));
}
