import type { GithubSnapshot } from "@/integrations/github";
import type { WakatimeSnapshot } from "@/integrations/wakatime";
import { BrandIcon } from "@/components/brand-icon";

function relativeDay(iso: string | null) {
  if (!iso) return null;
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000);
  if (!Number.isFinite(days) || days < 0) return null;
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? "last month" : `${months} months ago`;
}

export function GithubPanel({ github, wakatime }: { github: GithubSnapshot; wakatime: WakatimeSnapshot }) {
  const figures: { value: string; label: string }[] = [];
  if (github.contributions !== null) figures.push({ value: String(github.contributions), label: "Contributions / year" });
  if (github.publicRepos !== null) figures.push({ value: String(github.publicRepos), label: "Public repositories" });
  if (github.stars !== null && github.stars > 0) figures.push({ value: String(github.stars), label: "Stars earned" });
  if (github.followers !== null && github.followers > 0) figures.push({ value: String(github.followers), label: "Followers" });
  if (wakatime.hours !== null) figures.push({ value: `${wakatime.hours}h`, label: "Coded / 7 days" });

  // Nothing verifiable came back, so the panel stays off rather than showing
  // empty tiles or a decorative placeholder.
  if (figures.length === 0) return null;

  const lastPush = relativeDay(github.lastPushedAt);

  return (
    <section className="gh-panel" aria-labelledby="github-activity-title">
      <div className="gh-panel-head">
        <div>
          <p className="home-kicker">Live from GitHub</p>
          <h2 id="github-activity-title">Still building.</h2>
        </div>
        <a className="gh-profile-link" href={github.profileUrl} rel="me noopener">
          <BrandIcon icon="github" size={18} />
          <span>@{github.username}</span>
        </a>
      </div>

      {figures.length > 0 && (
        <div className="gh-figures">
          {figures.map((figure) => (
            <div key={figure.label}>
              <strong>{figure.value}</strong>
              <span>{figure.label}</span>
            </div>
          ))}
        </div>
      )}

      <p className="provenance">
        Fetched from the GitHub API and cached hourly — not a badge image.
        {lastPush ? ` Last public push ${lastPush}.` : ""}
        {github.state === "stale" ? " Showing the last successful snapshot." : ""}
      </p>
    </section>
  );
}
