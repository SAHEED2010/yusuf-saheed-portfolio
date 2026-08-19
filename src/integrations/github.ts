import { readIntegrationSnapshot, writeIntegrationSnapshot } from "@/content/database";

export type GithubSnapshot = {
  username: string;
  profileUrl: string;
  publicRepos: number | null;
  contributions: number | null;
  refreshedAt: string;
  state: "verified" | "stale" | "unavailable";
  tokenConfigured: boolean;
};

const cacheKey = "github:profile";
const cacheTtlMs = 1000 * 60 * 60;

function config() {
  const username = process.env.GITHUB_USERNAME?.trim() || "SAHEED2010";
  const token = process.env.GITHUB_TOKEN?.trim() || process.env.GH_TOKEN?.trim() || "";
  return { username, token };
}

function headers(token: string) {
  return { Accept: "application/vnd.github+json", "User-Agent": "yusuf-saheed-portfolio", ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const { username, token } = config();
  const cached = readIntegrationSnapshot<GithubSnapshot>(cacheKey);
  const cacheAge = cached ? Date.now() - Date.parse(cached.refreshedAt) : Infinity;
  if (cached && cacheAge >= 0 && cacheAge < cacheTtlMs && cached.value.username === username) return { ...cached.value, tokenConfigured: Boolean(token) };

  try {
    const profileResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: headers(token), cache: "no-store" });
    if (!profileResponse.ok) throw new Error(`GitHub profile returned ${profileResponse.status}`);
    const profile = await profileResponse.json() as { public_repos?: number };
    let contributions: number | null = null;
    if (token) {
      const contributionResponse = await fetch("https://api.github.com/graphql", { method: "POST", headers: { ...headers(token), "content-type": "application/json" }, body: JSON.stringify({ query: "query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}", variables: { login: username } }), cache: "no-store" });
      if (contributionResponse.ok) {
        const payload = await contributionResponse.json() as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions?: number } } } } };
        const total = payload.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
        contributions = typeof total === "number" ? total : null;
      }
    }
    const snapshot: GithubSnapshot = { username, profileUrl: `https://github.com/${username}`, publicRepos: typeof profile.public_repos === "number" ? profile.public_repos : null, contributions, refreshedAt: new Date().toISOString(), state: "verified", tokenConfigured: Boolean(token) };
    writeIntegrationSnapshot(cacheKey, snapshot, snapshot.refreshedAt);
    return snapshot;
  } catch {
    if (cached && cached.value.username === username) return { ...cached.value, state: "stale", tokenConfigured: Boolean(token) };
    return { username, profileUrl: `https://github.com/${username}`, publicRepos: null, contributions: null, refreshedAt: new Date().toISOString(), state: "unavailable", tokenConfigured: Boolean(token) };
  }
}
