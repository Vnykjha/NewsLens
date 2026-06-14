import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { MOCK_ARTICLES } from "@/lib/mockData";
import { useGetArticles } from "@workspace/api-client-react";

export default function AnalyzeDashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const { data: articles = [] } = useGetArticles();
  const activeArticles = articles && articles.length > 0 ? articles : MOCK_ARTICLES;

  // Filter articles by query
  const filteredArticles = activeArticles.filter((a) =>
    a.headline.toLowerCase().includes(query.toLowerCase()) ||
    a.publisher.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleArticlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/analysis/${id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header & Search */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Factual Audits</Text>
        <Text style={[styles.headerSubtitle, { color: colors.mutedForeground }]}>
          Review credibility ratings for today's briefing
        </Text>

        <View
          style={[
            styles.searchRow,
            {
              backgroundColor: colors.card,
              borderColor: focused ? colors.primary : colors.border,
            },
          ]}
        >
          <Feather name="search" size={16} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="Search audited stories..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); Keyboard.dismiss(); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Dashboard List */}
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        <View style={styles.dashboardGrid}>
          {filteredArticles.map((article) => {
            const credColor =
              article.credibilityScore >= 80
                ? colors.credibilityHigh
                : article.credibilityScore >= 60
                ? colors.credibilityMedium
                : colors.credibilityLow;

            return (
              <TouchableOpacity
                key={article.id}
                style={[
                  styles.auditCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => handleArticlePress(article.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.pubBadge, { backgroundColor: article.imageColor + "15" }]}>
                    <Text style={[styles.pubText, { color: article.imageColor }]}>
                      {article.publisher}
                    </Text>
                  </View>
                  <Text style={[styles.category, { color: colors.mutedForeground }]}>
                    {article.category}
                  </Text>
                </View>

                <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={2}>
                  {article.headline}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.scoreRow}>
                    <View
                      style={[
                        styles.scoreBadge,
                        { borderColor: credColor, backgroundColor: credColor + "08" },
                      ]}
                    >
                      <Text style={[styles.scoreText, { color: credColor }]}>
                        {article.credibilityScore}
                      </Text>
                    </View>
                    <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>
                      Credibility Index
                    </Text>
                  </View>

                  <View style={[styles.actionLink, { backgroundColor: colors.secondary }]}>
                    <Feather name="arrow-right" size={14} color={colors.foreground} />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "PlayfairDisplay_700Bold",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  scrollContent: {
    padding: 16,
  },
  dashboardGrid: {
    gap: 12,
  },
  auditCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pubBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pubText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.1,
  },
  category: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  headline: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    lineHeight: 21,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    paddingTop: 10,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scoreBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  scoreText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
  scoreLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
  },
  actionLink: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
});
