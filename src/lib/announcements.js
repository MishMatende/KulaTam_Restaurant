import { supabase } from "./supabase";

const COLUMNS = "id, title, body, link_url, starts_at, ends_at, is_published, created_at";

export function announcementStatus(a, now = new Date()) {
  if (!a.is_published) return "draft";
  if (new Date(a.starts_at) > now) return "scheduled";
  if (a.ends_at && new Date(a.ends_at) <= now) return "expired";
  return "live";
}

// Live announcements for the bell. RLS already hides the rest from the
// public, but admins can read drafts too, so filter here as well.
export async function fetchLiveAnnouncements() {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("announcements_kt")
    .select(COLUMNS)
    .order("starts_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return (data ?? []).filter((a) => announcementStatus(a) === "live").slice(0, 10);
}

export async function fetchAllAnnouncements() {
  const { data, error } = await supabase
    .from("announcements_kt")
    .select(COLUMNS)
    .order("starts_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function saveAnnouncement(id, fields) {
  const query = id
    ? supabase.from("announcements_kt").update(fields).eq("id", id)
    : supabase.from("announcements_kt").insert(fields);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteAnnouncement(id) {
  const { error } = await supabase.from("announcements_kt").delete().eq("id", id);
  if (error) throw error;
}

const RELATIVE = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS = [
  ["year", 31536000],
  ["month", 2592000],
  ["week", 604800],
  ["day", 86400],
  ["hour", 3600],
  ["minute", 60],
];

// "3 days ago", "in 2 hours", "just now"
export function timeAgo(date, now = new Date()) {
  const seconds = (new Date(date) - now) / 1000;
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return RELATIVE.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

const DATE_TIME = new Intl.DateTimeFormat("en-KE", { dateStyle: "medium", timeStyle: "short" });
export const formatDateTime = (date) => DATE_TIME.format(new Date(date));
