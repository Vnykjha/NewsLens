import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CredibilityMeter } from "@/components/CredibilityMeter";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { MOCK_ARTICLES } from "@/lib/mockData";
import { getAnalysis } from "@/lib/mockAnalysis";
import { useGetArticles } from "@workspace/api-client-react";

const PERSPECTIVES_TABS = ["Supporting", "Alternative", "Contradictory"] as const;

export default function AnalysisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isArticleSaved, saveArticle, unsaveArticle, folders } = useApp();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [perspTab, setPerspTab] = useState<(typeof PERSPECTIVES_TABS)[number]>("Supporting");
  const [expandedSection, setExpandedSection] = useState<string | null>("tldr");

  const { data: articles = [] } = useGetArticles();
  const activeArticles = articles && articles.length > 0 ? articles : MOCK_ARTICLES;

  const article = activeArticles.find((a) => a.id === id) ?? MOCK_ARTICLES.find((a) => a.id === id) ?? MOCK_ARTICLES[0];
  const analysis = getAnalysis(id ?? "1");
  const saved = isArticleSaved(article.id);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 34;

  const headerBg = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
    extrapolate: "clamp",
  });
  const headerBorder = scrollY.interpolate({
    inputRange: [60, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const perspectivesData =
    perspTab === "Supporting"
      ? analysis.supportingCoverage
      : perspTab === "Alternative"
      ? analysis.alternativePerspectives
      : analysis.contradictoryCoverage;

  const credColor =
    analysis.credibilityScore >= 80
      ? colors.credibilityHigh
      : analysis.credibilityScore >= 60
      ? colors.credibilityMedium
      : colors.credibilityLow;

  const mediaColor =
    analysis.mediaAuthenticity.aiGeneratedLikelihood === "Low"
      ? colors.credibilityHigh
      : analysis.mediaAuthenticity.aiGeneratedLikelihood === "Medium"
      ? colors.credibilityMedium
      : colors.credibilityLow;

  const toggleSection = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection((prev) => (prev === key ? null : key));
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (saved) unsaveArticle(article.id);
    else if (folders[0]) saveArticle(article, folders[0].id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            paddingTop: topPad,
            backgroundColor: headerBg,
            borderBottomColor: colors.border,
            borderBottomWidth: headerBorder as any,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={18} color={colors.foreground} />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleSave}
          >
            <Feather name="bookmark" size={18} color={saved ? colors.accent : colors.mutedForeground} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Feather name="share-2" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 20 }]}
      >
        <View style={[styles.articleMeta, { paddingTop: topPad + 56 }]}>
          <View style={styles.metaRow}>
            <View style={[styles.publisherBadge, { backgroundColor: article.imageColor + "18" }]}>
              <View style={[styles.pubDot, { backgroundColor: article.imageColor }]} />
              <Text style={[styles.publisher, { color: article.imageColor }]}>{article.publisher}</Text>
            </View>
            <View style={styles.metaRight}>
              {article.isBreaking && (
                <View style={[styles.breakingBadge, { backgroundColor: colors.accent }]}>
                  <Text style={[styles.breakingText, { color: colors.accentForeground }]}>BREAKING</Text>
                </View>
              )}
              <Text style={[styles.metaDate, { color: colors.mutedForeground }]}>{article.publishedAt}</Text>
            </View>
          </View>

          <Text style={[styles.headline, { color: colors.foreground }]}>
            {article.headline}
          </Text>

          <View style={styles.articleStats}>
            <View style={styles.statItem}>
              <Feather name="clock" size={13} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>{article.readingTime} min read</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Feather name="tag" size={13} color={colors.mutedForeground} />
              <Text style={[styles.statText, { color: colors.mutedForeground }]}>{article.category}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.content}>
          <View style={styles.reportHeader}>
            <View style={[styles.reportHeaderBadge, { backgroundColor: colors.primary }]}>
              <Feather name="zap" size={12} color={colors.primaryForeground} />
              <Text style={[styles.reportHeaderText, { color: colors.primaryForeground }]}>AI INTELLIGENCE REPORT</Text>
            </View>
          </View>

          <CredibilityMeter score={analysis.credibilityScore} />

          <ExpandableSection
            sectionKey="tldr"
            title="TL;DR"
            icon="align-left"
            expanded={expandedSection === "tldr"}
            onToggle={toggleSection}
            colors={colors}
            defaultOpen
          >
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{analysis.tldr}</Text>
          </ExpandableSection>

          <ExpandableSection
            sectionKey="context"
            title="Context"
            icon="book-open"
            expanded={expandedSection === "context"}
            onToggle={toggleSection}
            colors={colors}
          >
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{analysis.context}</Text>
          </ExpandableSection>

          <ExpandableSection
            sectionKey="claims"
            title="Key Claims"
            icon="check-circle"
            expanded={expandedSection === "claims"}
            onToggle={toggleSection}
            colors={colors}
          >
            {analysis.keyClaims.map((claim, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bullet, { backgroundColor: colors.accent }]} />
                <Text style={[styles.bodyText, { color: colors.foreground, flex: 1 }]}>{claim}</Text>
              </View>
            ))}
          </ExpandableSection>

          <ExpandableSection
            sectionKey="stakeholders"
            title="Stakeholders"
            icon="users"
            expanded={expandedSection === "stakeholders"}
            onToggle={toggleSection}
            colors={colors}
          >
            {analysis.stakeholders.map((s, i) => (
              <View key={i} style={[styles.stakeholderRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.stakeholderName, { color: colors.foreground }]}>{s.name}</Text>
                <Text style={[styles.stakeholderRole, { color: colors.mutedForeground }]}>{s.role}</Text>
              </View>
            ))}
          </ExpandableSection>

          <View style={styles.riskOpRow}>
            <View style={[styles.riskCard, { backgroundColor: colors.destructive + "08", borderColor: colors.destructive + "25" }]}>
              <View style={styles.riskHeader}>
                <Feather name="alert-triangle" size={14} color={colors.destructive} />
                <Text style={[styles.riskTitle, { color: colors.destructive }]}>Risks</Text>
              </View>
              {analysis.risks.map((r, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.destructive }]} />
                  <Text style={[styles.smallBodyText, { color: colors.foreground, flex: 1 }]}>{r}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.riskCard, { backgroundColor: colors.success + "08", borderColor: colors.success + "25" }]}>
              <View style={styles.riskHeader}>
                <Feather name="trending-up" size={14} color={colors.success} />
                <Text style={[styles.riskTitle, { color: colors.success }]}>Opportunities</Text>
              </View>
              {analysis.opportunities.map((o, i) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.success }]} />
                  <Text style={[styles.smallBodyText, { color: colors.foreground, flex: 1 }]}>{o}</Text>
                </View>
              ))}
            </View>
          </View>

          <ExpandableSection
            sectionKey="implications"
            title="Future Implications"
            icon="trending-up"
            expanded={expandedSection === "implications"}
            onToggle={toggleSection}
            colors={colors}
          >
            <Text style={[styles.bodyText, { color: colors.foreground }]}>{analysis.futureImplications}</Text>
          </ExpandableSection>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="git-branch" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Story Timeline</Text>
            </View>
            {analysis.timeline.map((event, i) => (
              <View key={event.id} style={styles.timelineRow}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineDot, { backgroundColor: i === analysis.timeline.length - 1 ? colors.accent : colors.mutedForeground }]} />
                  {i < analysis.timeline.length - 1 && (
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineDate, { color: colors.accent }]}>{event.date}</Text>
                  <Text style={[styles.timelineEvent, { color: colors.foreground }]}>{event.event}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="shield" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Credibility Analysis</Text>
            </View>

            {[
              { label: "Source Reputation", value: analysis.sourceReputation, icon: "award" },
              { label: "Evidence Strength", value: analysis.evidenceStrength, icon: "file-text" },
              { label: "Cross-Source Verification", value: analysis.crossVerification, icon: "link" },
            ].map((item) => (
              <View key={item.label} style={[styles.credRow, { borderBottomColor: colors.border }]}>
                <View style={styles.credRowLeft}>
                  <Feather name={item.icon as any} size={13} color={colors.mutedForeground} />
                  <Text style={[styles.credLabel, { color: colors.mutedForeground }]}>{item.label}</Text>
                </View>
                <Text style={[styles.credValue, { color: colors.foreground }]}>{item.value}</Text>
              </View>
            ))}

            {analysis.potentialBias.length > 0 && (
              <View style={[styles.biasBox, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
                <View style={styles.biasHeader}>
                  <Feather name="alert-circle" size={13} color={colors.warning} />
                  <Text style={[styles.biasTitle, { color: colors.warning }]}>Potential Bias Indicators</Text>
                </View>
                {analysis.potentialBias.map((b, i) => (
                  <View key={i} style={styles.bulletRow}>
                    <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
                    <Text style={[styles.smallBodyText, { color: colors.foreground, flex: 1 }]}>{b}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="eye" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Multi-Perspective Analysis</Text>
            </View>

            <View style={styles.perspTabRow}>
              {PERSPECTIVES_TABS.map((tab) => {
                const count =
                  tab === "Supporting"
                    ? analysis.supportingCoverage.length
                    : tab === "Alternative"
                    ? analysis.alternativePerspectives.length
                    : analysis.contradictoryCoverage.length;
                return (
                  <TouchableOpacity
                    key={tab}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPerspTab(tab);
                    }}
                    style={[
                      styles.perspTab,
                      { backgroundColor: perspTab === tab ? colors.primary : colors.secondary },
                    ]}
                  >
                    <Text style={[styles.perspTabText, { color: perspTab === tab ? colors.primaryForeground : colors.mutedForeground }]}>
                      {tab} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {perspectivesData.length === 0 ? (
              <Text style={[styles.emptyPerspText, { color: colors.mutedForeground }]}>No {perspTab.toLowerCase()} coverage found for this article.</Text>
            ) : (
              perspectivesData.map((p) => {
                const pCredColor =
                  p.credibilityScore >= 80
                    ? colors.credibilityHigh
                    : p.credibilityScore >= 60
                    ? colors.credibilityMedium
                    : colors.credibilityLow;
                return (
                  <View key={p.id} style={[styles.perspCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                    <View style={styles.perspCardTop}>
                      <View style={[styles.perspPub, { backgroundColor: colors.secondary }]}>
                        <Text style={[styles.perspPubText, { color: colors.foreground }]}>{p.publisherInitial}</Text>
                      </View>
                      <View style={styles.perspPubInfo}>
                        <Text style={[styles.perspPubName, { color: colors.foreground }]}>{p.publisher}</Text>
                        <Text style={[styles.perspDate, { color: colors.mutedForeground }]}>{p.publishedAt}</Text>
                      </View>
                      <View style={[styles.perspCred, { borderColor: pCredColor }]}>
                        <Text style={[styles.perspCredText, { color: pCredColor }]}>{p.credibilityScore}</Text>
                      </View>
                    </View>
                    <Text style={[styles.perspHeadline, { color: colors.foreground }]}>{p.headline}</Text>
                    <Text style={[styles.perspSummary, { color: colors.mutedForeground }]}>{p.summary}</Text>
                  </View>
                );
              })
            )}
          </View>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="link" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Citations</Text>
            </View>
            {analysis.citations.map((c, i) => (
              <View key={c.id} style={[styles.citationRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.citationNum, { color: colors.accent }]}>[{i + 1}]</Text>
                <View style={styles.citationContent}>
                  <Text style={[styles.citationTitle, { color: colors.foreground }]}>{c.title}</Text>
                  <Text style={[styles.citationPub, { color: colors.mutedForeground }]}>{c.publisher}</Text>
                  <Text style={[styles.citationExcerpt, { color: colors.mutedForeground }]} numberOfLines={2}>
                    "{c.excerpt}"
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="image" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Media Authenticity</Text>
            </View>
            <View style={styles.mediaRow}>
              <Text style={[styles.mediaLabel, { color: colors.mutedForeground }]}>AI-Generated Likelihood</Text>
              <View style={[styles.mediaBadge, { backgroundColor: mediaColor + "18", borderColor: mediaColor + "40" }]}>
                <View style={[styles.mediaDot, { backgroundColor: mediaColor }]} />
                <Text style={[styles.mediaBadgeText, { color: mediaColor }]}>
                  {analysis.mediaAuthenticity.aiGeneratedLikelihood}
                </Text>
              </View>
            </View>
            <View style={styles.mediaRow}>
              <Text style={[styles.mediaLabel, { color: colors.mutedForeground }]}>Metadata Available</Text>
              <Text style={[styles.mediaValue, { color: analysis.mediaAuthenticity.metadataAvailable ? colors.success : colors.warning }]}>
                {analysis.mediaAuthenticity.metadataAvailable ? "Yes" : "No"}
              </Text>
            </View>
            {analysis.mediaAuthenticity.authenticityIndicators.map((ind, i) => (
              <View key={i} style={styles.bulletRow}>
                <Feather name="check" size={12} color={colors.success} />
                <Text style={[styles.smallBodyText, { color: colors.foreground, flex: 1 }]}>{ind}</Text>
              </View>
            ))}
            {analysis.mediaAuthenticity.warnings.map((w, i) => (
              <View key={i} style={[styles.warningRow, { backgroundColor: colors.warning + "10", borderColor: colors.warning + "30" }]}>
                <Feather name="alert-triangle" size={12} color={colors.warning} />
                <Text style={[styles.smallBodyText, { color: colors.warning, flex: 1 }]}>{w}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.sectionBoxHeader}>
              <Feather name="message-square" size={15} color={colors.foreground} />
              <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>Community Notes</Text>
              <View style={[styles.noteCount, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.noteCountText, { color: colors.mutedForeground }]}>{analysis.communityNotes.length}</Text>
              </View>
            </View>

            {analysis.communityNotes.map((note) => (
              <View key={note.id} style={[styles.noteCard, { borderColor: colors.border, backgroundColor: colors.background }]}>
                <View style={styles.noteHeader}>
                  <View style={[styles.noteAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.noteAvatarText, { color: colors.primaryForeground }]}>
                      {note.author.charAt(0)}
                    </Text>
                  </View>
                  <View style={styles.noteHeaderRight}>
                    <Text style={[styles.noteAuthor, { color: colors.foreground }]}>{note.author}</Text>
                    <Text style={[styles.noteTime, { color: colors.mutedForeground }]}>{note.timestamp}</Text>
                  </View>
                </View>
                <Text style={[styles.noteContent, { color: colors.foreground }]}>{note.content}</Text>
                {note.sources && (
                  <View style={styles.noteSources}>
                    <Feather name="link" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.noteSourcesText, { color: colors.mutedForeground }]}>
                      {note.sources.length} source{note.sources.length !== 1 ? "s" : ""} cited
                    </Text>
                  </View>
                )}
                <View style={styles.noteFooter}>
                  <Feather name="arrow-up" size={13} color={colors.success} />
                  <Text style={[styles.noteUpvotes, { color: colors.success }]}>{note.upvotes.toLocaleString()} helpful</Text>
                </View>
              </View>
            ))}

            <TouchableOpacity style={[styles.addNoteBtn, { borderColor: colors.border }]}>
              <Feather name="plus" size={15} color={colors.mutedForeground} />
              <Text style={[styles.addNoteBtnText, { color: colors.mutedForeground }]}>Add Community Note</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

function ExpandableSection({
  sectionKey, title, icon, expanded, onToggle, colors, children, defaultOpen,
}: {
  sectionKey: string; title: string; icon: string; expanded: boolean; onToggle: (k: string) => void;
  colors: any; children: React.ReactNode; defaultOpen?: boolean;
}) {
  return (
    <View style={[styles.sectionBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.sectionBoxHeader}
        onPress={() => onToggle(sectionKey)}
        activeOpacity={0.7}
      >
        <Feather name={icon as any} size={15} color={colors.foreground} />
        <Text style={[styles.sectionBoxTitle, { color: colors.foreground }]}>{title}</Text>
        <Feather
          name={expanded ? "chevron-up" : "chevron-down"}
          size={16}
          color={colors.mutedForeground}
          style={{ marginLeft: "auto" }}
        />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.sectionBoxBody}>{children}</View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 12,
    zIndex: 100,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  headerActions: { flexDirection: "row", gap: 8 },
  scrollContent: { paddingHorizontal: 16 },
  articleMeta: { gap: 12, paddingBottom: 20 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  publisherBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  pubDot: { width: 6, height: 6, borderRadius: 3 },
  publisher: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  metaRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  breakingBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3 },
  breakingText: { fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  metaDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
  headline: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    lineHeight: 30,
    letterSpacing: -0.4,
  },
  articleStats: { flexDirection: "row", alignItems: "center", gap: 12 },
  statItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  statText: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 12 },
  divider: { height: 1, marginBottom: 20 },
  content: { gap: 12 },
  reportHeader: { alignItems: "center", marginBottom: 4 },
  reportHeaderBadge: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  reportHeaderText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 1 },
  sectionBox: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  sectionBoxHeader: {
    flexDirection: "row", alignItems: "center", gap: 8,
    padding: 14,
  },
  sectionBoxTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionBoxBody: { paddingHorizontal: 14, paddingBottom: 14, gap: 10 },
  bodyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  smallBodyText: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginBottom: 6 },
  bullet: { width: 5, height: 5, borderRadius: 2.5, marginTop: 7 },
  stakeholderRow: { paddingVertical: 10, borderBottomWidth: 1, gap: 3 },
  stakeholderName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  stakeholderRole: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  riskOpRow: { gap: 10 },
  riskCard: { borderRadius: 12, borderWidth: 1, padding: 14, gap: 8 },
  riskHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  riskTitle: { fontSize: 13, fontFamily: "Inter_700Bold" },
  timelineRow: { flexDirection: "row", gap: 12, minHeight: 50 },
  timelineLeft: { alignItems: "center", width: 16, paddingTop: 4 },
  timelineDot: { width: 8, height: 8, borderRadius: 4 },
  timelineLine: { flex: 1, width: 2, marginTop: 4 },
  timelineContent: { flex: 1, paddingBottom: 16, gap: 3 },
  timelineDate: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  timelineEvent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  credRow: { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  credRowLeft: { flexDirection: "row", alignItems: "center", gap: 5, width: 130 },
  credLabel: { fontSize: 12, fontFamily: "Inter_500Medium", flexShrink: 1 },
  credValue: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  biasBox: { borderRadius: 8, borderWidth: 1, padding: 12, gap: 6, marginTop: 4 },
  biasHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 2 },
  biasTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  perspTabRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  perspTab: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: "center" },
  perspTabText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  perspCard: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 8 },
  perspCardTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  perspPub: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  perspPubText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  perspPubInfo: { flex: 1 },
  perspPubName: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  perspDate: { fontSize: 11, fontFamily: "Inter_400Regular" },
  perspCred: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  perspCredText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  perspHeadline: { fontSize: 14, fontFamily: "Inter_700Bold", lineHeight: 19 },
  perspSummary: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  emptyPerspText: { fontSize: 13, fontFamily: "Inter_400Regular", padding: 4 },
  citationRow: { flexDirection: "row", gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  citationNum: { fontSize: 14, fontFamily: "Inter_700Bold", width: 22 },
  citationContent: { flex: 1, gap: 3 },
  citationTitle: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  citationPub: { fontSize: 11, fontFamily: "Inter_500Medium" },
  citationExcerpt: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17, fontStyle: "italic" },
  mediaRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  mediaLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  mediaBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  mediaDot: { width: 6, height: 6, borderRadius: 3 },
  mediaBadgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  mediaValue: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  warningRow: { flexDirection: "row", alignItems: "flex-start", gap: 6, padding: 8, borderRadius: 8, borderWidth: 1 },
  noteCount: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20, marginLeft: 4 },
  noteCountText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  noteCard: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  noteAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  noteAvatarText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  noteHeaderRight: { flex: 1 },
  noteAuthor: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  noteTime: { fontSize: 11, fontFamily: "Inter_400Regular" },
  noteContent: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  noteSources: { flexDirection: "row", alignItems: "center", gap: 5 },
  noteSourcesText: { fontSize: 11, fontFamily: "Inter_400Regular" },
  noteFooter: { flexDirection: "row", alignItems: "center", gap: 5 },
  noteUpvotes: { fontSize: 12, fontFamily: "Inter_500Medium" },
  addNoteBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderWidth: 1, borderRadius: 10, borderStyle: "dashed", padding: 12,
    marginTop: 4,
  },
  addNoteBtnText: { fontSize: 14, fontFamily: "Inter_500Medium" },
});
