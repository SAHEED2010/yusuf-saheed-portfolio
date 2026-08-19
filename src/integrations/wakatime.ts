export type WakatimeSnapshot = { hours: number | null; refreshedAt: string; state: "verified" | "unavailable"; tokenConfigured: boolean };

export async function getWakatimeSnapshot(): Promise<WakatimeSnapshot> {
  const token = process.env.WAKATIME_API_KEY?.trim() || "";
  if (!token) return { hours: null, refreshedAt: new Date().toISOString(), state: "unavailable", tokenConfigured: false };
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  try {
    const credentials = Buffer.from(`${token}:`).toString("base64");
    const response = await fetch(`https://wakatime.com/api/v1/users/current/summaries?start=${start.toISOString().slice(0, 10)}&end=${end.toISOString().slice(0, 10)}`, { headers: { Accept: "application/json", Authorization: `Basic ${credentials}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`WakaTime returned ${response.status}`);
    const payload = await response.json() as { cumulative_total?: { seconds?: number } };
    const seconds = payload.cumulative_total?.seconds;
    return { hours: typeof seconds === "number" ? Math.round((seconds / 3600) * 10) / 10 : null, refreshedAt: new Date().toISOString(), state: "verified", tokenConfigured: true };
  } catch { return { hours: null, refreshedAt: new Date().toISOString(), state: "unavailable", tokenConfigured: true }; }
}
