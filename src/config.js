// Restaurant details shown across the site.
export const RESTAURANT = {
  name: "KulaTam",
  location: "Owang Energy · Kitengela",
  shortLocation: "Owang Energy, Kitengela",
  landmark: "Opposite Royal Finesse",
  googleRating: 4.8,
  mapsQuery: "Owang Energy, Kitengela, Kenya",
  timeZone: "Africa/Nairobi",
  // 24h "HH:MM", same every day. Adjust here if the hours change.
  hours: { open: "07:00", close: "21:00" },
};

const query = encodeURIComponent(RESTAURANT.mapsQuery);
export const MAPS_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
export const MAPS_EMBED_URL = `https://www.google.com/maps?q=${query}&output=embed`;
