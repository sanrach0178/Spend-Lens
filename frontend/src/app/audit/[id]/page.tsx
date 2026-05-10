import { Metadata } from "next";
import AuditResultClient from "./AuditResultClient";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = params;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  try {
    const res = await fetch(`${apiUrl}/audit/${id}`, { cache: "no-store" });

    if (!res.ok) {
      return {
        title: "Audit Not Found — SpendLens",
        description: "This audit could not be found.",
      };
    }

    const data = await res.json();
    const savings = Math.round(data.totalMonthlySavings || 0);
    const summaryText = data.summary || "See your personalized AI spend audit results.";
    const description = summaryText.length > 150 ? summaryText.slice(0, 147) + "..." : summaryText;
    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://spendlens.credex.co"}/audit/${id}`;

    return {
      title: `AI Spend Audit — $${savings}/mo in potential savings found`,
      description,
      openGraph: {
        title: `AI Spend Audit — $${savings}/mo in potential savings found`,
        description,
        url: publicUrl,
        type: "website",
        siteName: "SpendLens by Credex",
      },
      twitter: {
        card: "summary_large_image",
        title: `AI Spend Audit — $${savings}/mo in potential savings found`,
        description,
      },
    };
  } catch {
    return {
      title: "AI Spend Audit — SpendLens",
      description: "Audit your AI tool spend and find savings in 60 seconds.",
    };
  }
}

export default function AuditResultPage({ params }: PageProps) {
  return <AuditResultClient id={params.id} />;
}
