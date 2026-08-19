import type { ProjectData, ProjectRecord } from "@/content/types";

function shorten(value: string, length = 88) {
  return value.length > length ? `${value.slice(0, length - 1).trimEnd()}...` : value;
}

function templateLabel(data: ProjectData) {
  return data.template.replaceAll("-", " ").toUpperCase();
}

function projectSignals(project: ProjectRecord) {
  const data = project.templateData;
  if (data.template === "product-system") {
    return [
      { label: "CONTEXT", value: data.problem },
      { label: "AUDIENCE", value: data.audience },
      { label: "STATUS", value: data.status },
    ];
  }
  if (data.template === "research-experiment") {
    return [
      { label: "QUESTION", value: data.question },
      { label: "METHOD", value: data.method },
      { label: "RESULT", value: data.result },
    ];
  }
  if (data.template === "tool-utility") {
    return [
      { label: "PAIN", value: data.repeatedPain },
      { label: "INTERFACE", value: data.interface },
      { label: "VERIFICATION", value: data.verification },
    ];
  }
  if (data.template === "team-startup") {
    return [
      { label: "MISSION", value: data.mission },
      { label: "TEAM CONTEXT", value: data.teamContext },
      { label: "OUTCOME", value: data.outcome },
    ];
  }
  return [
    { label: "ORGANIZATION", value: data.organization },
    { label: "DATE", value: data.date },
    { label: "PROOF", value: data.whatIsProven },
  ];
}

export function ProjectVisual({ project }: { project: ProjectRecord }) {
  const signals = projectSignals(project);
  const evidenceCount = project.evidence.length;
  const verifiedCount = project.evidence.filter((item) => item.level === "verified").length;
  const evidenceLabel = evidenceCount === 0 ? "Evidence pending" : `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}`;
  const proofLabel = verifiedCount > 0 ? `${verifiedCount} verified source${verifiedCount === 1 ? "" : "s"}` : "Editorial review required";

  return <div className="system-visual" role="img" aria-label={`${project.title} project record visualization`}>
    <div className="system-visual-head"><strong>{templateLabel(project.templateData)} / RECORD</strong><span>{project.templateData.template === "product-system" ? project.templateData.status : project.lifecycle}</span></div>
    <div className="system-path">{signals.map((signal) => <div key={signal.label}><small>{signal.label}</small><strong>{shorten(signal.value || "Not supplied")}</strong></div>)}</div>
    <div className="system-report"><div className="system-score">{evidenceCount || "--"}</div><div><h4>{evidenceLabel.toUpperCase()}</h4><p>{proofLabel}. {project.role || "Contribution details are being prepared."}</p></div></div>
  </div>;
}
