import { readIntegrationSnapshot, writeIntegrationSnapshot } from "@/content/database";

export type ContributionDay = { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 };
export type ContributionWeek = { days: ContributionDay[] };
export type ContributionCalendar = { total: number; weeks: ContributionWeek[] };

export type GithubSnapshot = {
  username: string;
  profileUrl: string;
  publicRepos: number | null;
  contributions: number | null;
  followers: number | null;
  stars: number | null;
  lastPushedAt: string | null;
  calendar: ContributionCalendar | null;
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

// Maps raw daily counts onto five intensity levels. Thresholds are derived
// from the busiest day so the grid stays readable for any contribution volume
// rather than saturating or looking empty at a fixed scale.
function buildCalendar(total: number, weeks: { contributionDays?: { date?: string; contributionCount?: number }[] }[]): ContributionCalendar {
  const counts = weeks.flatMap((week) => (week.contributionDays ?? []).map((day) => day.contributionCount ?? 0));
  const busiest = Math.max(1, ...counts);
  const level = (count: number): ContributionDay["level"] => {
    if (count <= 0) return 0;
    const ratio = count / busiest;
    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;
    return 4;
  };
  return {
    total,
    weeks: weeks.map((week) => ({
      days: (week.contributionDays ?? [])
        .filter((day): day is { date: string; contributionCount?: number } => typeof day.date === "string")
        .map((day) => ({ date: day.date, count: day.contributionCount ?? 0, level: level(day.contributionCount ?? 0) })),
    })),
  };
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

    // The contribution calendar is only exposed through the authenticated
    // GraphQL API, so without a token both the yearly total and the daily grid
    // stay null and their UI is omitted rather than faked.
    let contributions: number | null = null;
    let calendar: ContributionCalendar | null = null;
    if (token) {
      const query = `query($login:String!){user(login:$login){contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date contributionCount}}}}}}`;
      const contributionResponse = await fetch("https://api.github.com/graphql", { method: "POST", headers: { ...headers(token), "content-type": "application/json" }, body: JSON.stringify({ query, variables: { login: username } }), cache: "no-store" });
      if (contributionResponse.ok) {
        const payload = await contributionResponse.json() as {
          data?: { user?: { contributionsCollection?: { contributionCalendar?: { totalContributions?: number; weeks?: { contributionDays?: { date?: string; contributionCount?: number }[] }[] } } } };
        };
        const raw = payload.data?.user?.contributionsCollection?.contributionCalendar;
        const total = raw?.totalContributions;
        contributions = typeof total === "number" ? total : null;
        if (Array.isArray(raw?.weeks) && typeof total === "number") calendar = buildCalendar(total, raw.weeks);
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
      calendar,
      refreshedAt: new Date().toISOString(),
      state: "verified",
      tokenConfigured: Boolean(token),
    };
    await writeIntegrationSnapshot(cacheKey, snapshot, snapshot.refreshedAt);
    return snapshot;
  } catch {
    if (cached && cached.value.username === username) return { ...cached.value, state: "stale", tokenConfigured: Boolean(token) };
    return { username, profileUrl: `https://github.com/${username}`, publicRepos: null, contributions: null, followers: null, stars: null, lastPushedAt: null, calendar: null, refreshedAt: new Date().toISOString(), state: "unavailable", tokenConfigured: Boolean(token) };
  }
}
