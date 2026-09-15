"use client";

import { useState } from "react";
import type { ProjectData, ProjectTemplate } from "@/content/types";

const templates: { value: ProjectTemplate; label: string }[] = [
  { value: "product-system", label: "Product system" },
  { value: "research-experiment", label: "Research experiment" },
  { value: "tool-utility", label: "Tool or utility" },
  { value: "team-startup", label: "Team or startup work" },
  { value: "achievement-milestone", label: "Achievement milestone" },
];

// Every field is prefixed pd_ (project data) and read back apart in
// app/api/admin/content/route.ts, keyed off pd_template. Array fields are
// one item per line, matching the same convention already used for links
// and evidence elsewhere on this form -- one way to edit a list, not two.
function fieldsFor(template: ProjectTemplate, data: Partial<ProjectData> | undefined) {
  const text = (key: string) => (data && key in data ? String((data as Record<string, unknown>)[key] ?? "") : "");
  const list = (key: string) => (data && key in data ? ((data as Record<string, unknown>)[key] as string[] | undefined)?.join("\n") ?? "" : "");

  switch (template) {
    case "product-system":
      return (
        <>
          <label>Problem<textarea name="pd_problem" defaultValue={text("problem")} placeholder="What problem does this solve?" /></label>
          <label>Audience<input name="pd_audience" defaultValue={text("audience")} placeholder="Who is this for?" /></label>
          <label>Contribution<textarea name="pd_contribution" defaultValue={text("contribution")} placeholder="What did you personally build or decide?" /></label>
          <label>Decisions (one per line)<textarea name="pd_decisions" defaultValue={list("decisions")} placeholder="Keep risk scoring deterministic" /></label>
          <label>Status<input name="pd_status" defaultValue={text("status")} placeholder="e.g. In active development" /></label>
          <label>Next improvement<textarea name="pd_nextImprovement" defaultValue={text("nextImprovement")} /></label>
        </>
      );
    case "research-experiment":
      return (
        <>
          <label>Question<textarea name="pd_question" defaultValue={text("question")} /></label>
          <label>Framing<textarea name="pd_framing" defaultValue={text("framing")} /></label>
          <label>Method<textarea name="pd_method" defaultValue={text("method")} /></label>
          <label>Observations (one per line)<textarea name="pd_observations" defaultValue={list("observations")} /></label>
          <label>Result<textarea name="pd_result" defaultValue={text("result")} /></label>
          <label>Limitations (one per line)<textarea name="pd_limitations" defaultValue={list("limitations")} /></label>
          <label>Open questions (one per line)<textarea name="pd_openQuestions" defaultValue={list("openQuestions")} /></label>
        </>
      );
    case "tool-utility":
      return (
        <>
          <label>Repeated pain<textarea name="pd_repeatedPain" defaultValue={text("repeatedPain")} placeholder="What did you keep doing by hand?" /></label>
          <label>Interface<textarea name="pd_interface" defaultValue={text("interface")} placeholder="How do you use it?" /></label>
          <label>Usage<textarea name="pd_usage" defaultValue={text("usage")} /></label>
          <label>Implementation<textarea name="pd_implementation" defaultValue={text("implementation")} /></label>
          <label>Verification<textarea name="pd_verification" defaultValue={text("verification")} placeholder="How do you know it works?" /></label>
        </>
      );
    case "team-startup":
      return (
        <>
          <label>Mission<textarea name="pd_mission" defaultValue={text("mission")} /></label>
          <label>Team context<textarea name="pd_teamContext" defaultValue={text("teamContext")} placeholder="Team size, your role relative to others" /></label>
          <label>Your contribution<textarea name="pd_contribution" defaultValue={text("contribution")} /></label>
          <label>Outcome<textarea name="pd_outcome" defaultValue={text("outcome")} /></label>
          <label>Permission<input name="pd_permission" defaultValue={text("permission")} placeholder="What are you cleared to say publicly?" /></label>
        </>
      );
    case "achievement-milestone":
      return (
        <>
          <label>Organization<input name="pd_organization" defaultValue={text("organization")} /></label>
          <label>Date<input name="pd_date" defaultValue={text("date")} placeholder="2026-08-18" /></label>
          <label>Achievement type<input name="pd_achievementType" defaultValue={text("achievementType")} placeholder="1st place, certification, publication…" /></label>
          <label>What is proven<textarea name="pd_whatIsProven" defaultValue={text("whatIsProven")} /></label>
          <label>What remains unproven<textarea name="pd_remainsUnproven" defaultValue={text("remainsUnproven")} /></label>
        </>
      );
  }
}

export function ProjectTemplateFields({ initial }: { initial?: ProjectData }) {
  const [template, setTemplate] = useState<ProjectTemplate>(initial?.template ?? "product-system");
  return (
    <fieldset className="project-template-fields">
      <legend>Project template</legend>
      <label>
        Template
        <select name="pd_template" value={template} onChange={(event) => setTemplate(event.target.value as ProjectTemplate)}>
          {templates.map((option) => (
            <option value={option.value} key={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <p className="provenance">Used only when content type is project. Switching templates clears the fields below to that template's blank shape — save before switching if you want to keep what you typed.</p>
      {fieldsFor(template, template === initial?.template ? initial : undefined)}
    </fieldset>
  );
}
