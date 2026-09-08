import { readIntegrationSnapshot, writeIntegrationSnapshot } from "@/content/database";

export type GithubSnapshot = {
  username: string;
  profileUrl: string;
  publicRepos: number | null;
  contributions: number | null;
  followers: number | null;
  stars: number | null;
  lastPushedAt: string | null;
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

type RepoSummary = { stargazers_count?: number; fork?: boolean; pushed_at?: string | null };

// Aggregates the public repository list into total stars and the most recent
// public push. One request covers up to 100 repositories; forks are excluded.
//
// Deliberately no language breakdown: GitHub reports one primary language per
// repository, so any share computed from this account is dominated by early
// learning exercises and reports "HTML" for someone whose substantial work is
// TypeScript in a private repository and Python in an organisation. A figure
// that inverts the truth is worse than no figure.
function summarizeRepos(repos: RepoSummary[]) {
  const owned = repos.filter((repo) => !repo.fork);
  const stars = owned.reduce((total, repo) => total + (typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0), 0);
  const pushDates = owned
    .map((repo) => (repo.pushed_at ? Date.parse(repo.pushed_at) : NaN))
    .filter((value) => Number.isFinite(value));
  const lastPushedAt = pushDates.length > 0 ? new Date(Math.max(...pushDates)).toISOString() : null;
  return { stars, lastPushedAt };
}

export async function getGithubSnapshot(): Promise<GithubSnapshot> {
  const { username, token } = config();
  const cached = await readIntegrationSnapshot<GithubSnapshot>(cacheKey);
  const cacheAge = cached ? Date.now() - Date.parse(cached.refreshedAt) : Infinity;
  if (cached && cacheAge >= 0 && cacheAge < cacheTtlMs && cached.value.username === username) {
    return { ...cached.value, tokenConfigured: Boolean(token) };
  }

  try {
    const profileResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers: headers(token), cache: "no-store" });
    if (!profileResponse.ok) throw new Error(`GitHub profile returned ${profileResponse.status}`);
    const profile = await profileResponse.json() as { public_repos?: number; followers?: number };

    let stars: number | null = null;
    let lastPushedAt: string | null = null;
    try {
      const reposResponse = await fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed`,
        { headers: headers(token), cache: "no-store" },
      );
      if (reposResponse.ok) {
        const repos = await reposResponse.json() as RepoSummary[];
        if (Array.isArray(repos)) ({ stars, lastPushedAt } = summarizeRepos(repos));
      }
    } catch {
      // Repository aggregation is optional; the profile figures still stand.
    }

    let contributions: number | null = null;
    if (token) {
      const contributionResponse = await fetch("https://api.github.com/graphql", { method: "POST", headers: { ...headers(token), "content-type": "application/json" }, body: JSON.stringify({ query: "query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions}}}}", variables: { login: username } }), cache: "no-store" });
      if (contributionResponse.ok) {
        const payload = await contributionResponse.json() as { data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions?: number } } } } };
        const total = payload.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
        contributions = typeof total === "number" ? total : null;
      }
    }

    const snapshot: GithubSnapshot = {
      username,
      profileUrl: `https://github.com/${username}`,
      publicRepos: typeof profile.public_repos === "number" ? profile.public_repos : null,
      contributions,
      followers: typeof profile.followers === "number" ? profile.followers : null,
      stars,
      lastPushedAt,
      refreshedAt: new Date().toISOString(),
      state: "verified",
      tokenConfigured: Boolean(token),
    };
    await writeIntegrationSnapshot(cacheKey, snapshot, snapshot.refreshedAt);
    return snapshot;
  } catch {
    if (cached && cached.value.username === username) return { ...cached.value, state: "stale", tokenConfigured: Boolean(token) };
    return { username, profileUrl: `https://github.com/${username}`, publicRepos: null, contributions: null, followers: null, stars: null, lastPushedAt: null, refreshedAt: new Date().toISOString(), state: "unavailable", tokenConfigured: Boolean(token) };
  }
}
