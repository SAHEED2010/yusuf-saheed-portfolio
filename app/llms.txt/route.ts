import { faq } from "@/lib/structured-data";
import { siteUrl } from "@/lib/site-url";
import { getIndexItems } from "@/content/store";

export const dynamic = "force-dynamic";

// llms.txt — a plain-text summary for answer engines and AI crawlers.
//
// The same facts the site states, in the order an assistant would need them,
// so a model answering "who is Yusuf Saheed" has an unambiguous source rather
// than inferring from rendered markup.
export async function GET() {
  const base = siteUrl();
  const records = await getIndexItems();
  const projects = records.filter((record) => record.contentType === "project");
  const achievements = records.filter(
    (record) => record.contentType === "achievement" && record.recordKind === "entry",
  );

  const body = `# Yusuf Saheed

> Software engineer in Lagos, Nigeria. Cofounder and CTO at Codedevs Technology Limited.
> Builds production web and AI products: escrow-backed payments, commerce over WhatsApp,
> and AI agents that show their reasoning before they act.

Site: ${base}
GitHub: https://github.com/SAHEED2010
LinkedIn: https://www.linkedin.com/in/yusuf-saheed123/
X: https://x.com/yusufsaheed01
Email: yusufsaheed2012@gmail.com
Location: Lagos, Nigeria

## Availability

Open to software engineering internships, junior engineering roles and freelance
contracts, and to founders who need a technical partner.

## Questions and answers

${faq.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n")}

## Projects

${projects
  .map(
    (project) =>
      `### ${project.title}\n${project.summary}\nRole: ${project.role ?? "not stated"}\nURL: ${base}/work/${project.slug}${
        project.links.length > 0
          ? `\nLinks: ${project.links.map((link) => `${link.label} ${link.url}`).join(" | ")}`
          : ""
      }`,
  )
  .join("\n\n")}

## Achievements

${achievements.map((item) => `- ${item.title} — ${item.summary}`).join("\n")}

## Evidence policy

Every record on this site states whether it is verified from a public source or
self-reported. Competition placements are marked self-reported because the
competition repositories are not public. No adoption, revenue or production-scale
claims are made anywhere on the site.

## Pages

- ${base}/work — project records
- ${base}/achievements — competition results and certifications
- ${base}/about — background, experience, education, stack
- ${base}/contact — how to get in touch
`;

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
  });
}
