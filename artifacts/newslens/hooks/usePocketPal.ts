import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { MOCK_ARTICLES, Citation } from "@/lib/mockData";
import { getAnalysis } from "@/lib/mockAnalysis";
import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_URL = "http://localhost:5001/v1";
const STORAGE_KEY = "newslens_pocketpal_url";

const DEFAULT_MODEL = "qwen";
const MODEL_STORAGE_KEY = "newslens_pocketpal_model";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

// Dynamically resolve the NewsLens API server URL
const getNewsApiBaseUrl = () => {
  if (Platform.OS === "web") return "http://localhost:5000";
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost?.split(":")[0];
  return localhost ? `http://${localhost}:5000` : "http://localhost:5000";
};

export function usePocketPal() {
  const [apiUrl, setApiUrl] = useState<string>(DEFAULT_URL);
  const [modelName, setModelName] = useState<string>(DEFAULT_MODEL);
  const [isConnected, setIsConnected] = useState<boolean | null>(null); // null means checking
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // Load URL and model name from storage
  useEffect(() => {
    const loadConfig = async () => {
      try {
        const storedUrl = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedUrl) {
          setApiUrl(storedUrl);
        }
        const storedModel = await AsyncStorage.getItem(MODEL_STORAGE_KEY);
        if (storedModel) {
          setModelName(storedModel);
        }
      } catch (err) {
        console.error("Failed to load PocketPal config:", err);
      }
    };
    loadConfig();
  }, []);

  // Check connectivity to the specified endpoint
  const checkConnection = useCallback(async (urlToCheck: string) => {
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const cleanedUrl = urlToCheck.replace(/\/$/, ""); // strip trailing slash
      const response = await fetch(`${cleanedUrl}/models`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok || response.status === 401) {
        setIsConnected(true);
        return true;
      }
      setIsConnected(false);
      return false;
    } catch {
      setIsConnected(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Update API URL and check connection
  const updateApiUrl = useCallback(async (newUrl: string) => {
    const cleanedUrl = newUrl.trim();
    setApiUrl(cleanedUrl);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, cleanedUrl);
    } catch (err) {
      console.error("Failed to save PocketPal URL:", err);
    }
    return checkConnection(cleanedUrl);
  }, [checkConnection]);

  // Update model name
  const updateModelName = useCallback(async (newModel: string) => {
    const cleanedModel = newModel.trim();
    setModelName(cleanedModel);
    try {
      await AsyncStorage.setItem(MODEL_STORAGE_KEY, cleanedModel);
    } catch (err) {
      console.error("Failed to save PocketPal model name:", err);
    }
  }, []);

  // Initial connection check
  useEffect(() => {
    checkConnection(apiUrl);
  }, [apiUrl, checkConnection]);

  // Generate simulated editorial response using loaded analysis
  const generateSimulatedResponse = useCallback((query: string, articleId?: string, loadedAnalysis?: any): { content: string; citations: Citation[] } => {
    const normalizedQuery = query.toLowerCase();

    if (!articleId) {
      return {
        content: `As an editor, I can provide general intelligence on today's briefing. We are tracking several key stories:\n\n1. **Federal Reserve Rate Cuts** [1]: Citing May CPI inflation at 2.3%, the Fed signals rate cuts are back on the table.\n2. **AI Regulation Act** [2]: Bipartisan Senate bill S.2847 passed the Commerce Committee, targeting frontier models (10^26 FLOPs) with pre-deployment safety evaluations.\n3. **Mpox Global Emergency** [3]: The WHO activated its highest alert level after a novel strain spread across 23 countries.\n\nSelect a specific article above to explore detailed evidence, timelines, and conflicting perspectives.`,
        citations: [
          { id: "c1", title: "Federal Reserve signals rate cut", publisher: "The Financial Times", url: "#", excerpt: "The Federal Reserve signals potential cuts as inflation reaches 2.3% in May." },
          { id: "c2", title: "American AI Safety and Transparency Act", publisher: "US Senate", url: "#", excerpt: "Any covered AI system trained using compute exceeding 10^26 FLOPs shall undergo review." },
          { id: "c3", title: "WHO mpox strain emergency declaration", publisher: "Reuters", url: "#", excerpt: "WHO declares mpox a global health emergency after variant spreads across 23 countries." }
        ]
      };
    }

    const analysis = loadedAnalysis || getAnalysis(articleId);
    if (!analysis) {
      return {
        content: `I apologize, but I do not have sufficient editorial records for this article. Please select another report from today's briefing.`,
        citations: []
      };
    }

    const citations = analysis.citations || [];
    const headline = analysis.headline || "Selected Article";
    const publisher = analysis.publisher || "Publisher";
    const url = analysis.citations?.[0]?.url || "#";
    const summary = analysis.tldr || "";

    // 1. Context / Background
    if (
      normalizedQuery.includes("context") ||
      normalizedQuery.includes("background") ||
      normalizedQuery.includes("history") ||
      normalizedQuery.includes("origin")
    ) {
      let response = `### Editorial Context: ${headline}\n\n`;
      response += `${analysis.context}\n\n`;
      if (analysis.timeline && analysis.timeline.length > 0) {
        response += `#### Historical Timeline Summary:\n`;
        analysis.timeline.slice(0, 4).forEach((evt: any) => {
          response += `- **${evt.date}**: ${evt.event}\n`;
        });
      }
      response += `\n*Source Reference: This briefing is grounded in primary records, including direct reports from ${publisher} [1].*`;
      return {
        content: response,
        citations: [
          { id: "art-cit", title: headline, publisher: publisher, url: url, excerpt: summary },
          ...citations
        ]
      };
    }

    // 2. Claims / Facts / Evidence
    if (
      normalizedQuery.includes("claim") ||
      normalizedQuery.includes("fact") ||
      normalizedQuery.includes("evidence") ||
      normalizedQuery.includes("what does it say") ||
      normalizedQuery.includes("summarize")
    ) {
      let response = `### Key Verified Claims & Evidence\n\n`;
      response += `Our editorial desk has compiled and cross-verified the following key claims from the reporting:\n\n`;
      analysis.keyClaims.forEach((claim: string, idx: number) => {
        const citIdx = idx % (citations.length || 1);
        const citText = citations.length > 0 ? ` [${citIdx + 1}]` : "";
        response += `- **${claim}**${citText}\n`;
      });
      response += `\n#### Evidence Evaluation:\n`;
      response += `${analysis.evidenceStrength}\n\n`;
      response += `*Cross-source Verification: ${analysis.crossVerification}*`;
      return { content: response, citations };
    }

    // 3. Bias / Credibility
    if (
      normalizedQuery.includes("bias") ||
      normalizedQuery.includes("credibility") ||
      normalizedQuery.includes("trust") ||
      normalizedQuery.includes("reputation") ||
      normalizedQuery.includes("score") ||
      normalizedQuery.includes("neutral")
    ) {
      let response = `### Credibility & Bias Audit\n\n`;
      response += `- **Credibility Index Rating:** \`${analysis.credibilityScore}/100\`\n`;
      response += `- **Publisher Standing:** ${analysis.sourceReputation}\n`;
      response += `- **Verification status:** ${analysis.crossVerification}\n\n`;
      
      if (analysis.potentialBias && analysis.potentialBias.length > 0) {
        response += `#### Potential Bias Indicators:\n`;
        analysis.potentialBias.forEach((bias: string) => {
          response += `- ${bias}\n`;
        });
      } else {
        response += `*No significant bias indicators were flagged in this reporting.*`;
      }
      
      response += `\n#### Media Authenticity Checklist:\n`;
      response += `- **AI Likelihood:** \`${analysis.mediaAuthenticity?.aiGeneratedLikelihood || "Low"}\`\n`;
      response += `- **EXIF Metadata Available:** \`${analysis.mediaAuthenticity?.metadataAvailable ? "Yes" : "No"}\`\n`;
      if (analysis.mediaAuthenticity?.authenticityIndicators?.length > 0) {
        response += `- **Indicators:** ${analysis.mediaAuthenticity.authenticityIndicators.join("; ")}\n`;
      }
      return { content: response, citations };
    }

    // 4. Perspectives / Contradictions / Alternative views
    if (
      normalizedQuery.includes("perspective") ||
      normalizedQuery.includes("view") ||
      normalizedQuery.includes("oppose") ||
      normalizedQuery.includes("conflict") ||
      normalizedQuery.includes("alternative") ||
      normalizedQuery.includes("contradict") ||
      normalizedQuery.includes("other side")
    ) {
      let response = `### Multi-Perspective Editorial Report\n\n`;
      response += `A comprehensive survey of media outlets reveals key variations in framing:\n\n`;

      if (analysis.supportingCoverage && analysis.supportingCoverage.length > 0) {
        response += `#### Supporting / Consensus View:\n`;
        analysis.supportingCoverage.forEach((p: any) => {
          response += `- **${p.publisher}**: *"${p.headline}"* — (Score: ${p.credibilityScore}/100)\n  ${p.summary}\n`;
        });
        response += `\n`;
      }

      if (analysis.alternativePerspectives && analysis.alternativePerspectives.length > 0) {
        response += `#### Alternative Interpretations:\n`;
        analysis.alternativePerspectives.forEach((p: any) => {
          response += `- **${p.publisher}**: *"${p.headline}"* — (Score: ${p.credibilityScore}/100)\n  ${p.summary}\n`;
        });
        response += `\n`;
      }

      if (analysis.contradictoryCoverage && analysis.contradictoryCoverage.length > 0) {
        response += `#### Dissenting / Contradictory Arguments:\n`;
        analysis.contradictoryCoverage.forEach((p: any) => {
          response += `- **${p.publisher}**: *"${p.headline}"* — (Score: ${p.credibilityScore}/100)\n  ${p.summary}\n`;
        });
      } else {
        response += `*No direct refutations or highly contradictory mainstream coverage have been flagged for this specific angle.*`;
      }
      return { content: response, citations: [] };
    }

    // 5. Stakeholders / Who is involved
    if (
      normalizedQuery.includes("stakeholder") ||
      normalizedQuery.includes("who is involved") ||
      normalizedQuery.includes("interest") ||
      normalizedQuery.includes("who cares")
    ) {
      let response = `### Stakeholder Analysis\n\n`;
      response += `The primary entities impacted by these developments and their underlying interests are:\n\n`;
      analysis.stakeholders.forEach((s: any) => {
        response += `- **${s.name}** (${s.role})\n`;
      });
      return { content: response, citations: [] };
    }

    // 6. Risks & Opportunities / Threats
    if (
      normalizedQuery.includes("risk") ||
      normalizedQuery.includes("opportunity") ||
      normalizedQuery.includes("threat") ||
      normalizedQuery.includes("benefit") ||
      normalizedQuery.includes("danger")
    ) {
      let response = `### Risk and Opportunity Ledger\n\n`;
      response += `Our assessment of downstream risks and opportunities reveals:\n\n`;
      response += `#### Core Risks:\n`;
      analysis.risks.forEach((r: string) => {
        response += `- ${r}\n`;
      });
      response += `\n#### Emerging Opportunities:\n`;
      analysis.opportunities.forEach((o: string) => {
        response += `- ${o}\n`;
      });
      return { content: response, citations: [] };
    }

    // 7. Future Implications / What happens next
    if (
      normalizedQuery.includes("future") ||
      normalizedQuery.includes("implication") ||
      normalizedQuery.includes("outlook") ||
      normalizedQuery.includes("what happens next") ||
      normalizedQuery.includes("predict")
    ) {
      let response = `### Future Implications & Outlook\n\n`;
      response += `${analysis.futureImplications}\n\n`;
      response += `*Key metrics our desk is watching include policy adjustments and regulatory enforcement timelines.*`;
      return { content: response, citations };
    }

    // 8. Timeline
    if (
      normalizedQuery.includes("timeline") ||
      normalizedQuery.includes("date") ||
      normalizedQuery.includes("when") ||
      normalizedQuery.includes("sequence") ||
      normalizedQuery.includes("event")
    ) {
      let response = `### Chronological Timeline\n\n`;
      analysis.timeline.forEach((evt: any) => {
        response += `- **${evt.date}**: ${evt.event}\n`;
      });
      return { content: response, citations: [] };
    }

    // 9. Community notes
    if (
      normalizedQuery.includes("community") ||
      normalizedQuery.includes("note") ||
      normalizedQuery.includes("public") ||
      normalizedQuery.includes("people")
    ) {
      let response = `### Community Perspectives\n\n`;
      if (analysis.communityNotes && analysis.communityNotes.length > 0) {
        response += `Readers have contributed the following context notes to this story:\n\n`;
        analysis.communityNotes.forEach((note: any) => {
          response += `> **${note.author}** (*${note.timestamp}* — ${note.upvotes} helpful ratings):\n> ${note.content}\n\n`;
        });
      } else {
        response += `*There are no verified community notes for this article at this time.*`;
      }
      return { content: response, citations: [] };
    }

    // 10. General / Fallback
    let response = `### Editorial Briefing: ${headline}\n\n`;
    response += `${analysis.tldr}\n\n`;
    response += `#### Verified Key Claims:\n`;
    analysis.keyClaims.slice(0, 3).forEach((claim: string, idx: number) => {
      const citIdx = idx % (citations.length || 1);
      const citText = citations.length > 0 ? ` [${citIdx + 1}]` : "";
      response += `- ${claim}${citText}\n`;
    });
    
    response += `\n#### Executive Assessment:\n`;
    response += `- **Credibility Index:** \`${analysis.credibilityScore}/100\`\n`;
    response += `- **Context:** ${analysis.context.substring(0, 110)}...\n`;
    response += `- **Implications:** ${analysis.futureImplications.substring(0, 110)}...\n\n`;
    response += `*Ask me for specific details on **context**, **verified claims**, **bias indicators**, **differing perspectives**, or **implications**.*`;

    return { content: response, citations };
  }, []);

  // Send message to PocketPal server, falling back to simulated mode if needed
  const sendMessage = useCallback(
    async (
      messages: { role: "user" | "assistant"; content: string }[],
      articleId?: string
    ): Promise<{ content: string; citations: Citation[] }> => {
      const lastUserMessage = messages[messages.length - 1]?.content || "";

      // Load article analysis context dynamically from the API server
      let loadedAnalysis: any = null;
      if (articleId) {
        try {
          const newsUrl = getNewsApiBaseUrl();
          const detailRes = await fetch(`${newsUrl}/api/articles/${articleId}/analysis`, {
            signal: AbortSignal.timeout(8000), // 8-second timeout
          });
          if (detailRes.ok) {
            loadedAnalysis = await detailRes.json();
          }
        } catch (err) {
          console.warn("Failed to fetch live analysis for chatbot, falling back to mock:", err);
        }
        if (!loadedAnalysis) {
          loadedAnalysis = getAnalysis(articleId);
        }
      }

      if (!isConnected) {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        return generateSimulatedResponse(lastUserMessage, articleId, loadedAnalysis);
      }

      try {
        const cleanedUrl = apiUrl.replace(/\/$/, "");
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000); // 6-second timeout for local requests

        let systemPrompt =
          "You are an intelligent, erudite newspaper editor answering user questions. Answer concisely, focusing on evidence. ";
        
        if (loadedAnalysis) {
          const headline = loadedAnalysis.headline || "Selected Article";
          const publisher = loadedAnalysis.publisher || "Publisher";
          systemPrompt += `You are answering questions about the article titled "${headline}" published by ${publisher}. `;
          systemPrompt += `Here is the editorial intelligence report for the article: `;
          systemPrompt += `TLDR: ${loadedAnalysis.tldr}. `;
          systemPrompt += `Context: ${loadedAnalysis.context}. `;
          systemPrompt += `Claims: ${loadedAnalysis.keyClaims?.join("; ") || ""}. `;
          systemPrompt += `Bias Indicators: ${loadedAnalysis.potentialBias?.join("; ") || ""}. `;
          systemPrompt += `Credibility Score: ${loadedAnalysis.credibilityScore}. `;
          systemPrompt += `Implications: ${loadedAnalysis.futureImplications}. `;
          systemPrompt += `Use this factual context to construct your response. If facts are requested, cite them by referencing [1], [2] corresponding to these sources: `;
          if (loadedAnalysis.citations) {
            loadedAnalysis.citations.forEach((c: any, idx: number) => {
              systemPrompt += `[${idx + 1}] Source Title: "${c.title}" by ${c.publisher}. `;
            });
          }
        }

        const chatMessages = [
          { role: "system", content: systemPrompt },
          ...messages,
        ];

        const response = await fetch(`${cleanedUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: modelName,
            messages: chatMessages,
            temperature: 0.2,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error("API responded with an error");
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || "";
        const citations = loadedAnalysis ? (loadedAnalysis.citations || []) : [];

        return { content, citations };
      } catch (err) {
        console.warn("PocketPal API request failed, falling back to simulated engine:", err);
        await new Promise((resolve) => setTimeout(resolve, 1200));
        return generateSimulatedResponse(lastUserMessage, articleId, loadedAnalysis);
      }
    },
    [apiUrl, modelName, isConnected, generateSimulatedResponse]
  );

  return {
    apiUrl,
    modelName,
    isConnected,
    isChecking,
    updateApiUrl,
    updateModelName,
    checkConnection,
    sendMessage,
  };
}
