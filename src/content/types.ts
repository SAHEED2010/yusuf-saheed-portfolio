export type ContentType = "project" | "tutorial" | "research" | "question" | "resource" | "achievement";
export type Lifecycle = "draft" | "review" | "published" | "archived";
export type Visibility = "private" | "preview" | "public";
export type ProjectTemplate = "product-system" | "research-experiment" | "tool-utility" | "team-startup" | "achievement-milestone";

export type Evidence = {
  label: string;
  url?: string;
  level: "verified" | "self-reported" | "in-progress";
  note?: string;
};

export type Source = {
  label: string;
  url: string;
  kind: "dashboard" | "github" | "wakatime" | "document" | "external";
};

export type ContentRecord = {
  id: string;
  slug: string;
  contentType: ContentType;
  title: string;
  summary: string;
  body: string[];
  visibility: Visibility;
  lifecycle: Lifecycle;
  featured: boolean;
  sortOrder: number;
  publishedAt?: string;
  updatedAt: string;
  role?: string;
  tags: string[];
  links: { label: string; url: string }[];
  evidence: Evidence[];
  sources: Source[];
};

export type ProjectData =
  | { template: "product-system"; problem: string; audience: string; contribution: string; decisions: string[]; status: string; nextImprovement: string }
  | { template: "research-experiment"; question: string; framing: string; method: string; observations: string[]; result: string; limitations: string[]; openQuestions: string[] }
  | { template: "tool-utility"; repeatedPain: string; interface: string; usage: string; implementation: string; verification: string }
  | { template: "team-startup"; mission: string; teamContext: string; contribution: string; outcome: string; permission: string }
  | { template: "achievement-milestone"; organization: string; date: string; achievementType: string; whatIsProven: string; remainsUnproven: string };

export type ProjectRecord = ContentRecord & { contentType: "project"; templateData: ProjectData };
export type LibraryRecord = ContentRecord & { contentType: Exclude<ContentType, "project"> };
export type AnyContentRecord = ProjectRecord | LibraryRecord;

export type PreviewItem = Pick<ContentRecord, "slug" | "title" | "summary" | "role" | "tags" | "evidence" | "links"> & { template?: ProjectTemplate };
