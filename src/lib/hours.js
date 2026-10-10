import { RESTAURANT } from "../config";

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

// "21:00" -> "9 PM", "07:30" -> "7:30 AM"
export function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return m ? `${hour}:${String(m).padStart(2, "0")} ${suffix}` : `${hour} ${suffix}`;
}

// Current minutes-since-midnight and weekday in the restaurant's time zone.
function localNow(date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: RESTAURANT.timeZone,
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  return {
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
    weekday: get("weekday"),
  };
}

export function getOpenStatus(date = new Date()) {
  const { open, close } = RESTAURANT.hours;
  const { minutes, weekday } = localNow(date);
  const isOpen = minutes >= toMinutes(open) && minutes < toMinutes(close);
  const opensLater = minutes < toMinutes(open);

  return {
    isOpen,
    weekday,
    openLabel: formatTime(open),
    closeLabel: formatTime(close),
    summary: isOpen
      ? `Open until ${formatTime(close)}`
      : `Closed · Opens ${opensLater ? "" : "tomorrow "}${formatTime(open)}`,
  };
}
