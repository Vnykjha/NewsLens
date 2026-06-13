import { Citation, CommunityNote, Perspective, TimelineEvent } from "./mockData";

export interface AnalysisReport {
  articleId: string;
  headline: string;
  publisher: string;
  publishedAt: string;
  credibilityScore: number;
  sourceReputation: string;
  evidenceStrength: string;
  crossVerification: string;
  potentialBias: string[];
  tldr: string;
  context: string;
  keyClaims: string[];
  stakeholders: { name: string; role: string }[];
  risks: string[];
  opportunities: string[];
  futureImplications: string;
  citations: Citation[];
  timeline: TimelineEvent[];
  communityNotes: CommunityNote[];
  supportingCoverage: Perspective[];
  alternativePerspectives: Perspective[];
  contradictoryCoverage: Perspective[];
  mediaAuthenticity: {
    aiGeneratedLikelihood: "Low" | "Medium" | "High";
    metadataAvailable: boolean;
    authenticityIndicators: string[];
    warnings: string[];
  };
}

const ANALYSIS_DATABASE: Record<string, AnalysisReport> = {
  "1": {
    articleId: "1",
    headline: "Federal Reserve Signals Possible Rate Cut as Inflation Eases Toward 2% Target",
    publisher: "The Financial Times",
    publishedAt: "June 12, 2026",
    credibilityScore: 91,
    sourceReputation: "High — Financial Times has a 130-year track record and rigorous editorial standards with dedicated economic reporters.",
    evidenceStrength: "Strong — Cites Fed meeting minutes, official CPI data from the Bureau of Labor Statistics, and named senior Fed officials.",
    crossVerification: "Confirmed — Reuters, Bloomberg, and WSJ all reporting the same signals from the same press conference.",
    potentialBias: [
      "Pro-market perspective may frame rate cuts as unambiguously positive",
      "Sources are primarily institutional finance voices with limited labour perspective",
    ],
    tldr: "The Federal Reserve chairman has strongly implied interest rate cuts are coming in the next two policy meetings, as inflation data shows the Consumer Price Index reaching 2.3% — its lowest reading since 2021. Markets rallied on the news.",
    context: "After raising rates 11 times between 2022 and 2023 to combat post-pandemic inflation, the Fed has held rates at 5.25–5.5% since August 2023. This would represent the first easing cycle since 2019. Lower rates typically reduce borrowing costs for mortgages, car loans, and business credit.",
    keyClaims: [
      "CPI inflation reached 2.3% in May 2026, down from a peak of 9.1% in June 2022",
      "Fed Chair Powell used the phrase 'sufficient confidence' for the first time since 2021",
      "Markets are now pricing in a 78% probability of a September cut",
      "Core PCE — the Fed's preferred inflation measure — stood at 2.6%",
    ],
    stakeholders: [
      { name: "Federal Reserve", role: "Policy setter — weighing inflation vs. employment mandates" },
      { name: "US Consumers", role: "Impacted — lower rates reduce mortgage and credit card costs" },
      { name: "US Treasury", role: "Impacted — cheaper government borrowing if rates fall" },
      { name: "Banks & Lenders", role: "Impacted — lower net interest margins expected" },
      { name: "Equity Markets", role: "Beneficiary — rate cuts historically positive for stocks" },
    ],
    risks: [
      "Inflation could re-accelerate if the Fed cuts too soon, requiring painful reversals",
      "Housing market could overheat with increased demand from cheaper mortgages",
      "Dollar weakening could increase import costs, sustaining some inflation",
    ],
    opportunities: [
      "Mortgage refinancing wave could boost consumer spending power",
      "Small business credit access improves with lower prime rate",
      "Emerging market debt relief as dollar-denominated loans become cheaper",
    ],
    futureImplications: "If the Fed cuts in September and December 2026 as markets expect, mortgage rates could fall below 6% for the first time since 2023. This would likely reignite the housing market and boost consumer confidence heading into 2027. However, a global commodities shock could quickly change the calculus.",
    timeline: [
      { id: "t1", date: "June 2022", event: "US inflation peaks at 9.1%, highest since 1981" },
      { id: "t2", date: "Mar 2022–Aug 2023", event: "Fed raises rates 11 consecutive times to 5.25–5.5%" },
      { id: "t3", date: "August 2023", event: "Fed pauses rate hikes; holds for 10 consecutive meetings" },
      { id: "t4", date: "Jan 2026", event: "CPI falls to 2.8%, reigniting cut speculation" },
      { id: "t5", date: "May 2026", event: "CPI reaches 2.3%; Powell signals 'sufficient confidence'" },
      { id: "t6", date: "Sep 2026 (projected)", event: "First rate cut expected if data continues" },
    ],
    citations: [
      { id: "c1", title: "Fed Meeting Minutes: May 2026", publisher: "Federal Reserve", url: "#", excerpt: "Participants generally agreed that further progress on inflation would likely warrant a reduction in the target range." },
      { id: "c2", title: "Consumer Price Index — May 2026", publisher: "Bureau of Labor Statistics", url: "#", excerpt: "The all items index rose 2.3 percent for the 12 months ending May, the smallest 12-month increase since March 2021." },
      { id: "c3", title: "Fed Funds Futures Pricing", publisher: "CME Group FedWatch", url: "#", excerpt: "Markets are pricing a 78% probability of a 25-basis-point cut at the September 2026 FOMC meeting." },
    ],
    communityNotes: [
      { id: "cn1", author: "EconWatcher", content: "Important context: the Fed's 2% target uses PCE, not CPI. CPI at 2.3% doesn't mean the Fed's own measure is there yet — PCE is still at 2.6%.", upvotes: 892, timestamp: "1 hour ago", sources: ["https://bls.gov"] },
      { id: "cn2", author: "MacroReader", content: "The article frames this as almost certain. Powell actually said conditions are 'moving in the right direction' — softer language than previous dovish pivots.", upvotes: 445, timestamp: "3 hours ago" },
    ],
    supportingCoverage: [
      { id: "s1", headline: "Powell's Tone Shift Signals Summer Rate Cuts Are Back on the Table", publisher: "Bloomberg", publisherInitial: "BL", summary: "Bloomberg economists see a 75% chance of a September cut after parsing the Fed chair's precise language choices at the press conference.", publishedAt: "3 hours ago", credibilityScore: 90 },
      { id: "s2", headline: "Inflation's Last Mile Is Finally Behind Us, Fed Officials Suggest", publisher: "Reuters", publisherInitial: "RE", summary: "Three unnamed Federal Reserve governors indicated privately that the data trend is 'convincing enough' to begin discussing the path down.", publishedAt: "4 hours ago", credibilityScore: 88 },
    ],
    alternativePerspectives: [
      { id: "a1", headline: "Don't Pop the Champagne: Core Services Inflation Remains Sticky", publisher: "The Economist", publisherInitial: "EC", summary: "Shelter costs and services inflation — which make up over 60% of core CPI — have barely budged, suggesting the headline number may be misleading.", publishedAt: "5 hours ago", credibilityScore: 87 },
    ],
    contradictoryCoverage: [
      { id: "ct1", headline: "Premature Rate Cut Expectations Risk Another Inflation Wave, Warns Summers", publisher: "Washington Post", publisherInitial: "WP", summary: "Former Treasury Secretary Larry Summers argues the Fed is making the same mistake it made in the 1970s by declaring victory on inflation too soon.", publishedAt: "6 hours ago", credibilityScore: 82 },
    ],
    mediaAuthenticity: {
      aiGeneratedLikelihood: "Low",
      metadataAvailable: true,
      authenticityIndicators: ["Image metadata consistent with wire photo", "Caption matches agency attribution", "No signs of manipulation in EXIF data"],
      warnings: [],
    },
  },
  "2": {
    articleId: "2",
    headline: "AI Regulation Framework Advances in Senate: What the Bill Actually Says",
    publisher: "MIT Technology Review",
    publishedAt: "June 12, 2026",
    credibilityScore: 88,
    sourceReputation: "High — MIT Technology Review employs subject-matter experts and is editorially independent from MIT's commercial interests.",
    evidenceStrength: "Strong — Cites the actual bill text, named senators, and direct quotes from tech companies' official statements.",
    crossVerification: "Partial — Core facts verified, but bill interpretation differs significantly across publications.",
    potentialBias: [
      "Technology-focused outlet may underweight civil society concerns about AI harms",
      "Heavy sourcing from AI companies themselves on 'compliance burden'",
    ],
    tldr: "The American AI Safety and Transparency Act passed the Senate Commerce Committee 14-8. The bill requires AI companies training models above 10^26 FLOPs to submit safety reports before deployment, with FTC enforcement authority. It does not ban any AI applications outright.",
    context: "The EU AI Act set global precedent in 2024 by creating risk tiers for AI systems. The US has resisted comprehensive federal AI regulation, relying on voluntary White House commitments. This bill represents the first serious congressional attempt at binding rules for frontier AI labs.",
    keyClaims: [
      "Applies to AI models trained using more than 10^26 floating point operations (roughly GPT-4 scale and above)",
      "Requires pre-deployment safety testing and a 90-day review window with FTC",
      "Creates whistleblower protections for AI lab employees",
      "Penalties of up to $50M per violation for non-compliant deployments",
      "Open-source models with published weights are exempt from most requirements",
    ],
    stakeholders: [
      { name: "OpenAI, Google DeepMind, Anthropic", role: "Directly regulated — face compliance costs but also clearer rules" },
      { name: "Open Source Community", role: "Mostly exempt — advocacy groups see this as a win" },
      { name: "FTC", role: "New enforcement authority — significant expansion of mandate" },
      { name: "Academic Researchers", role: "Partial exemption for non-commercial models" },
      { name: "Civil Society Groups", role: "Mixed — some wanted stronger rules on AI outputs, not just training" },
    ],
    risks: [
      "Large compliance costs could entrench incumbents and disadvantage startups",
      "Compute threshold of 10^26 FLOPs may become outdated as efficiency improves",
      "FTC lacks AI expertise to meaningfully evaluate submitted safety reports",
      "US-specific rules could push development to less-regulated jurisdictions",
    ],
    opportunities: [
      "Clear rules could accelerate enterprise AI adoption by reducing liability uncertainty",
      "Whistleblower provisions could surface genuine safety issues before deployment",
      "Framework could become global template, similar to EU GDPR's influence",
    ],
    futureImplications: "If the bill passes the full Senate and survives reconciliation, it would take effect 18 months after signing. The 90-day FTC review process would effectively create a federal AI approval pathway — the first of its kind globally. International competitors, particularly China, would likely accelerate development to establish facts on the ground before enforcement begins.",
    timeline: [
      { id: "t1", date: "March 2023", event: "OpenAI publishes GPT-4; public AI regulation debate intensifies" },
      { id: "t2", date: "August 2023", event: "White House extracts voluntary safety commitments from seven major AI labs" },
      { id: "t3", date: "October 2023", event: "Biden Executive Order on AI safety directs NIST and CISA to develop standards" },
      { id: "t4", date: "March 2024", event: "EU AI Act formally adopted by European Parliament" },
      { id: "t5", date: "January 2026", event: "American AI Safety Act first introduced by Sens. Heinrich and Collins" },
      { id: "t6", date: "June 2026", event: "Bill clears Senate Commerce Committee 14-8" },
    ],
    citations: [
      { id: "c1", title: "American AI Safety and Transparency Act — Bill Text S.2847", publisher: "US Senate", url: "#", excerpt: "Any covered AI system trained using computational resources exceeding 10^26 floating point operations shall undergo pre-deployment evaluation..." },
      { id: "c2", title: "FTC Statement on AI Safety Act", publisher: "Federal Trade Commission", url: "#", excerpt: "The Commission welcomes this legislative direction and stands ready to fulfill the oversight responsibilities outlined in the Act." },
      { id: "c3", title: "Coalition Letter on AI Regulation", publisher: "BSA — The Software Alliance", url: "#", excerpt: "We support risk-based regulation that addresses real harms while preserving America's competitive edge in AI development." },
    ],
    communityNotes: [
      { id: "cn1", author: "PolicyWonk2026", content: "The article doesn't mention that the open-source exemption was added at the last minute under pressure from Meta and Mistral. This is a major concession that significantly limits the bill's scope.", upvotes: 1124, timestamp: "2 hours ago", sources: ["https://congress.gov"] },
      { id: "cn2", author: "AIResearcher", content: "10^26 FLOPs was roughly GPT-4 in 2023. By 2026, models of that capability can be trained for much less. This threshold will need updating regularly or it becomes irrelevant.", upvotes: 678, timestamp: "4 hours ago" },
    ],
    supportingCoverage: [
      { id: "s1", headline: "Bipartisan AI Bill Clears Key Hurdle in Congress", publisher: "Politico", publisherInitial: "PO", summary: "The bill's bipartisan passage out of committee suggests it has momentum to reach the Senate floor before the August recess.", publishedAt: "5 hours ago", credibilityScore: 85 },
    ],
    alternativePerspectives: [
      { id: "a1", headline: "AI Safety Bill Is a Giveaway to Big Tech, Critics Say", publisher: "Wired", publisherInitial: "WI", summary: "The compute threshold is so high that only the largest incumbents face meaningful regulation, potentially cementing their market position against smaller competitors.", publishedAt: "6 hours ago", credibilityScore: 79 },
    ],
    contradictoryCoverage: [
      { id: "ct1", headline: "Senate AI Bill Would Chill Innovation, Tech Industry Coalition Warns", publisher: "TechCrunch", publisherInitial: "TC", summary: "A coalition of 140 startups argues the compliance costs and 90-day FTC review would kill products that could be beneficial and safe.", publishedAt: "7 hours ago", credibilityScore: 74 },
    ],
    mediaAuthenticity: {
      aiGeneratedLikelihood: "Low",
      metadataAvailable: true,
      authenticityIndicators: ["Official congressional headshot used appropriately", "Committee room photo verifiable through C-SPAN footage"],
      warnings: [],
    },
  },
};

export function getAnalysis(articleId: string): AnalysisReport {
  const stored = ANALYSIS_DATABASE[articleId];
  if (stored) return stored;

  return {
    articleId,
    headline: "Analysis Generated",
    publisher: "NewsLens AI",
    publishedAt: "Just now",
    credibilityScore: 78,
    sourceReputation: "Analysis pending — source reputation data being compiled.",
    evidenceStrength: "Moderate — multiple sources identified, cross-checking in progress.",
    crossVerification: "Partial — 3 of 5 key claims verified across independent sources.",
    potentialBias: [
      "Primary source has a stated editorial stance on this topic",
      "Limited geographic diversity in sourcing",
    ],
    tldr: "This article covers a developing story with significant implications. The core claims are partially verified across independent sources. Some context is missing that would help readers assess the full picture.",
    context: "This story exists within a broader ongoing debate that has been evolving over several months. Understanding the historical context helps evaluate the significance of the current developments.",
    keyClaims: [
      "Primary claim supported by official statements",
      "Secondary claim requires additional verification",
      "Background context is accurate based on public records",
    ],
    stakeholders: [
      { name: "Primary Parties", role: "Directly involved in the reported events" },
      { name: "Affected Communities", role: "Will experience downstream consequences" },
      { name: "Policy Makers", role: "May respond with regulatory or legislative action" },
    ],
    risks: [
      "Situation may escalate if underlying tensions are not addressed",
      "Economic impacts could ripple across related sectors",
    ],
    opportunities: [
      "Opening for meaningful policy reform if stakeholders engage constructively",
      "Public attention could accelerate previously stalled initiatives",
    ],
    futureImplications: "The developments reported here are likely to have cascading effects over the next 6–12 months. Watch for follow-up reporting on official responses and any legislative or judicial action.",
    timeline: [
      { id: "t1", date: "Background", event: "Long-standing tensions emerged several years ago" },
      { id: "t2", date: "Earlier this year", event: "Preliminary developments set the stage for current events" },
      { id: "t3", date: "Last month", event: "Immediate precursor events occurred" },
      { id: "t4", date: "This week", event: "Current events reported in this article" },
    ],
    citations: [
      { id: "c1", title: "Official Statement on the Matter", publisher: "Primary Source", url: "#", excerpt: "The statement confirms the key facts as reported, with additional context provided by the issuing body." },
    ],
    communityNotes: [
      { id: "cn1", author: "CommunityReader", content: "I've been following this story closely. One important piece of context the article misses is the historical precedent from 2019 that directly parallels current events.", upvotes: 234, timestamp: "1 hour ago" },
    ],
    supportingCoverage: [
      { id: "s1", headline: "Similar Report From Alternative Outlet", publisher: "NewsWire", publisherInitial: "NW", summary: "Independent reporting reaches similar conclusions using different sourcing methodology.", publishedAt: "3 hours ago", credibilityScore: 81 },
    ],
    alternativePerspectives: [
      { id: "a1", headline: "A Different Framing of the Same Events", publisher: "Alternative View", publisherInitial: "AV", summary: "This outlet frames the same factual events within a different narrative framework, emphasizing different stakeholders.", publishedAt: "5 hours ago", credibilityScore: 72 },
    ],
    contradictoryCoverage: [
      { id: "ct1", headline: "Challenging the Core Narrative", publisher: "Counter Report", publisherInitial: "CR", summary: "This analysis disputes several key claims in the original article, citing different primary sources and expert testimony.", publishedAt: "8 hours ago", credibilityScore: 68 },
    ],
    mediaAuthenticity: {
      aiGeneratedLikelihood: "Medium",
      metadataAvailable: false,
      authenticityIndicators: ["No obvious visual manipulation detected", "Image style consistent with publication standards"],
      warnings: ["Metadata not embedded — cannot verify original capture device or timestamp"],
    },
  };
}
