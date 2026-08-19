import type { ProjectData, ProjectRecord } from "./types";

const required = (value: unknown, label: string, errors: string[]) => {
  if (typeof value !== "string" || value.trim().length === 0) errors.push(`${label} is required`);
};

function validUrl(value: string, label: string, errors: string[]) {
  try {
    const url = new URL(value);
    if (!["http:", "https:", "mailto:"].includes(url.protocol)) errors.push(`${label} must use http, https, or mailto`);
  } catch { errors.push(`${label} must be a valid URL`); }
}

export function validateProject(project: ProjectRecord): string[] {
  const errors: string[] = [];
  required(project.title, "title", errors);
  required(project.slug, "slug", errors);
  required(project.summary, "summary", errors);
  required(project.role, "role", errors);
  for (const link of project.links) { required(link.label, "link label", errors); validUrl(link.url, "link URL", errors); }
  for (const evidence of project.evidence) { required(evidence.label, "evidence label", errors); if (evidence.url) validUrl(evidence.url, "evidence URL", errors); }
  if (project.visibility === "public" && project.lifecycle === "published" && project.evidence.length === 0) {
    errors.push("a published public project needs at least one evidence item");
  }

  const data = project.templateData as ProjectData;
  switch (data.template) {
    case "product-system":
      required(data.problem, "product problem", errors);
      required(data.audience, "product audience", errors);
      required(data.contribution, "product contribution", errors);
      required(data.status, "product status", errors);
      break;
    case "research-experiment":
      required(data.question, "research question", errors);
      required(data.method, "research method", errors);
      required(data.result, "research result", errors);
      break;
    case "tool-utility":
      required(data.repeatedPain, "tool pain", errors);
      required(data.interface, "tool interface", errors);
      required(data.verification, "tool verification", errors);
      break;
    case "team-startup":
      required(data.mission, "team mission", errors);
      required(data.contribution, "team contribution", errors);
      required(data.permission, "team permission", errors);
      break;
    case "achievement-milestone":
      required(data.organization, "issuing organization", errors);
      required(data.date, "achievement date", errors);
      required(data.whatIsProven, "what is proven", errors);
      break;
  }
  return errors;
}
