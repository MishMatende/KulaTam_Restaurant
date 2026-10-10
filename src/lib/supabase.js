import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Captured before the client reads (and clears) auth tokens from the URL,
// so the reset-password page can tell a recovery link from an expired one.
export const initialAuthHash = typeof window === "undefined" ? "" : window.location.hash;

// Null when env vars are missing; the app then uses the bundled menu.
export const supabase = url && anonKey ? createClient(url, anonKey) : null;
