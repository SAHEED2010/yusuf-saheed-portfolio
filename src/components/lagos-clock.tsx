"use client";

import { useEffect, useState } from "react";

export function LagosClock() {
  const [value, setValue] = useState("Lagos --:-- WAT");
  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-NG", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false });
    const update = () => setValue(`Lagos ${formatter.format(new Date())} WAT`);
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return <time dateTime={new Date().toISOString()} className="time-label">{value}</time>;
}
