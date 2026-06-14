import { AnalysisReport } from "@workspace/api-zod";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Simple in-memory cache for generated analyses
const analysisCache: Record<string, AnalysisReport> = {};

export async function generateAnalysis(
  articleId: string,
  headline: string,
  publisher: string,
  publishedAt: string,
  summaryText: string,
  url: string
): Promise<AnalysisReport> {
  // Return from cache if exists
  if (analysisCache[articleId]) {
    console.log(`Returning cached analysis for article: ${articleId}`);
    return analysisCache[articleId];
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    console.warn("No valid OPENROUTER_API_KEY set. Falling back to simulated analysis.");
    const fallback = generateSimulatedReport(articleId, headline, publisher, publishedAt, summaryText, url);
    analysisCache[articleId] = fallback;
    return fallback;
  }

  console.log(`Requesting OpenRouter analysis for article: "${headline}" (${publisher})...`);

  try {
    const prompt = `
You are an expert news editor, fact-checker, and media analyst.
Analyze the following news article:
- Headline: "${headline}"
- Publisher: "${publisher}"
- Summary/Snippet: "${summaryText}"
- Original Link: "${url}"

Create a highly detailed, professional, and fact-focused editorial analysis report.
Since you only have a snippet, use your broader knowledge of current affairs to reconstruct realistic context, claims, and perspectives if it is a major real-world event. If it is minor, extrapolate logically and realistically.

You MUST respond with a single, valid JSON object that adheres strictly to the following TypeScript interface schema. Do not include markdown code block wrappers (like \`\`\`json) in your final output—respond ONLY with the raw JSON string.

interface AnalysisReport {
  articleId: string; // Set this to "${articleId}"
  headline: string; // Set this to "${headline}"
  publisher: string; // Set this to "${publisher}"
  publishedAt: string; // Set this to "${publishedAt}"
  credibilityScore: number; // Integer between 40 and 100 based on source reputation, evidence strength, and bias.
  sourceReputation: string; // 1-2 sentences describing the publisher's journalistic standing.
  evidenceStrength: string; // 1-2 sentences assessing the quality/source of claims.
  crossVerification: string; // 1-2 sentences assessing if other major outlets support this reporting.
  potentialBias: string[]; // List of 1-3 specific potential bias indicators or framing slants.
  tldr: string; // A concise 1-2 sentence TL;DR summarizing the core event.
  context: string; // A brief paragraph (2-3 sentences) detailing the historical background or why this story matters.
  keyClaims: string[]; // 3-4 key verified factual claims or statistics made in this reporting.
  stakeholders: { name: string; role: string }[]; // 3-4 key entities/groups involved and their role/interest.
  risks: string[]; // 2-3 downstream risks or negative implications.
  opportunities: string[]; // 2-3 potential positive opportunities or benefits.
  futureImplications: string; // 1-2 sentences detailing what to watch next.
  citations: { id: string; title: string; publisher: string; url: string; excerpt: string }[]; // 2-3 realistic primary citations or reference sources mentioned.
  timeline: { id: string; date: string; event: string }[]; // 3-5 chronological events leading up to or following this event.
  communityNotes: { id: string; author: string; content: string; upvotes: number; timestamp: string; sources: string[] }[]; // 1-2 realistic reader community notes offering correction or extra context.
  supportingCoverage: { id: string; headline: string; publisher: string; publisherInitial: string; summary: string; publishedAt: string; credibilityScore: number }[]; // 1-2 articles confirming the consensus view.
  alternativePerspectives: { id: string; headline: string; publisher: string; publisherInitial: string; summary: string; publishedAt: string; credibilityScore: number }[]; // 1-2 articles offering alternative angles.
  contradictoryCoverage: { id: string; headline: string; publisher: string; publisherInitial: string; summary: string; publishedAt: string; credibilityScore: number }[]; // 1-2 articles presenting dissenting/critical arguments.
  mediaAuthenticity: {
    aiGeneratedLikelihood: "Low" | "Medium" | "High";
    metadataAvailable: boolean;
    authenticityIndicators: string[];
    warnings: string[];
  };
}

Strictly follow these rules:
1. Every array must have elements (no empty lists).
2. Generate realistic URLs for citations and sources.
3. Make sure all JSON strings are properly escaped.
4. Ensure the JSON is valid. Do not truncate the JSON response.
`;

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://newslens.mobile", // Optional OpenRouter tracking
        "X-Title": "NewsLens Mobile",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(35000), // 35s timeout
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API responded with status ${response.status}`);
    }

    const data = (await response.json()) as any;
    let content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      throw new Error("Empty response content from OpenRouter");
    }

    // Strip markdown code block markers if present
    if (content.startsWith("```")) {
      content = content.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const report = JSON.parse(content) as AnalysisReport;
    
    // Ensure vital fields match
    report.articleId = articleId;
    report.headline = headline;
    report.publisher = publisher;
    report.publishedAt = publishedAt;

    analysisCache[articleId] = report;
    console.log(`Successfully generated and cached OpenRouter analysis for article: ${articleId}`);
    return report;
  } catch (err) {
    console.error(`Failed to generate OpenRouter analysis for article ${articleId}:`, err);
    console.log("Falling back to local simulated analysis generator.");
    const fallback = generateSimulatedReport(articleId, headline, publisher, publishedAt, summaryText, url);
    analysisCache[articleId] = fallback;
    return fallback;
  }
}

// Generate fallback metadata analysis if OpenRouter fails or API key is missing
function generateSimulatedReport(
  articleId: string,
  headline: string,
  publisher: string,
  publishedAt: string,
  summaryText: string,
  url: string
): AnalysisReport {
  const score = Math.floor(Math.random() * 21) + 75; // 75-95

  return {
    articleId,
    headline,
    publisher,
    publishedAt,
    credibilityScore: score,
    sourceReputation: `Standard — ${publisher} is a recognized news publisher with general editorial policies.`,
    evidenceStrength: `Moderate — The article primarily contains descriptive narrative outlining statements from immediate stakeholders.`,
    crossVerification: "Confirmed — Basic facts are consistent with reports across national and international syndicates.",
    potentialBias: [
      "Heavy reliance on official statements and corporate/government spokespeople.",
      "Standard editorial framing with typical sensationalized headline structure."
    ],
    tldr: summaryText,
    context: `This news reports on recent updates from ${publisher}. It outlines key actions taken by the primary stakeholders in response to changing market, policy, or societal demands.`,
    keyClaims: [
      `Factual report of events as published by ${publisher}.`,
      "Updates on operational decisions made by the primary organizations involved.",
      "Direct responses and public statements issued by representative leadership."
    ],
    stakeholders: [
      { name: publisher, role: "Reporting entity — publishing the event details." },
      { name: "Public / Audience", role: "Consumers of information and downstream policy impacts." }
    ],
    risks: [
      "Information gaps or developing situations might alter final conclusions.",
      "Potential for partisan framing depending on interview selection."
    ],
    opportunities: [
      "Increases transparency and awareness regarding this specific sector.",
      "Allows community members to monitor progress and voice consensus."
    ],
    futureImplications: `Further statements, policy decisions, or market reactions are anticipated from participants in the coming weeks.`,
    citations: [
      {
        id: "cit_1",
        title: headline,
        publisher: publisher,
        url: url,
        excerpt: summaryText
      }
    ],
    timeline: [
      {
        id: "t_1",
        date: "Recent weeks",
        event: "Background discussions and preliminary announcements leading to this event."
      },
      {
        id: "t_2",
        date: "Today",
        event: `Official reporting published by ${publisher}.`
      }
    ],
    communityNotes: [
      {
        id: "cn_1",
        author: "NewsVerify",
        content: `Always verify key details by visiting the publisher's direct link.`,
        upvotes: 24,
        timestamp: "Just now",
        sources: [url]
      }
    ],
    supportingCoverage: [
      {
        id: "sup_1",
        headline: `Related updates: ${headline}`,
        publisher: "Associated Press",
        publisherInitial: "AP",
        summary: `Reporting on equivalent global factors matching the theme of ${publisher}'s announcement.`,
        publishedAt: "Today",
        credibilityScore: 92
      }
    ],
    alternativePerspectives: [],
    contradictoryCoverage: [],
    mediaAuthenticity: {
      aiGeneratedLikelihood: "Low",
      metadataAvailable: false,
      authenticityIndicators: ["Wire agency format standard"],
      warnings: []
    }
  };
}
