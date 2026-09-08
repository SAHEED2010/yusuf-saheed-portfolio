import type { Metadata } from "next";
import { VisitorAssistant } from "@/components/visitor-assistant";
import { getAiProviderStatus } from "@/ai/provider";

export const metadata: Metadata = {
  title: "Ask about the work",
  description: "Ask questions about Yusuf Saheed's published projects, evidence and availability.",
};

export default function AssistantPage() {
  return <VisitorAssistant aiLive={getAiProviderStatus().configured} />;
}
