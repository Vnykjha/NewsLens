import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";
import { COMMUNITY_ARTICLES } from "@/lib/mockData";

const SORT_OPTIONS = ["Top", "New", "Discussed"];

export default function CommunityScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { upvotedArticles, downvotedArticles, toggleUpvote, toggleDownvote, addToHistory } = useApp();
  const [sort, setSort] = useState("Top");

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Community</Text>
        <View style={styles.sortRow}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt}
              onPress={() => setSort(opt)}
              style={[
                styles.sortPill,
                { backgroundColor: sort === opt ? colors.primary : colors.secondary, borderColor: sort === opt ? colors.primary : colors.border }
              ]}
            >
              <Text style={[styles.sortText, { color: sort === opt ? colors.primaryForeground : colors.mutedForeground }]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        <View style={[styles.banner, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="users" size={20} color={colors.accent} />
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.foreground }]}>Community Intelligence</Text>
            <Text style={[styles.bannerBody, { color: colors.mutedForeground }]}>
              Real readers adding context, corrections and additional sources to news stories.
            </Text>
          </View>
        </View>

        {COMMUNITY_ARTICLES.map((item) => {
          const isUp = upvotedArticles.includes(item.id);
          const isDown = downvotedArticles.includes(item.id);
          const netVotes = item.upvotes - item.downvotes + (isUp ? 1 : 0) - (isDown ? 1 : 0);
          const credColor =
            item.credibilityScore >= 80
              ? colors.credibilityHigh
              : item.credibilityScore >= 60
              ? colors.credibilityMedium
              : colors.credibilityLow;

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                addToHistory(item);
                router.push(`/analysis/${item.id}`);
              }}
              activeOpacity={0.85}
            >
              <View style={styles.cardTop}>
                <View style={[styles.publisherBadge, { backgroundColor: item.imageColor + "18" }]}>
                  <View style={[styles.pubDot, { backgroundColor: item.imageColor }]} />
                  <Text style={[styles.publisher, { color: item.imageColor }]}>{item.publisher}</Text>
                </View>
                <View style={[styles.credBadge, { borderColor: credColor }]}>
                  <Text style={[styles.credText, { color: credColor }]}>{item.credibilityScore}</Text>
                </View>
              </View>

              <Text style={[styles.headline, { color: colors.foreground }]} numberOfLines={3}>
                {item.headline}
              </Text>

              <View style={[styles.notesRow, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                <Feather name="message-square" size={13} color={colors.mutedForeground} />
                <Text style={[styles.notesText, { color: colors.mutedForeground }]}>
                  {item.notes} community note{item.notes !== 1 ? "s" : ""}
                </Text>
                <TouchableOpacity style={styles.viewNotesBtn} onPress={() => router.push(`/analysis/${item.id}`)}>
                  <Text style={[styles.viewNotesBtnText, { color: colors.accent }]}>View</Text>
                  <Feather name="chevron-right" size={12} color={colors.accent} />
                </TouchableOpacity>
              </View>

              <View style={styles.voteRow}>
                <TouchableOpacity
                  style={[styles.voteBtn, isUp && { backgroundColor: colors.success + "18" }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleUpvote(item.id);
                  }}
                >
                  <Feather name="arrow-up" size={16} color={isUp ? colors.success : colors.mutedForeground} />
                  <Text style={[styles.voteCount, { color: isUp ? colors.success : colors.mutedForeground }]}>
                    {item.upvotes + (isUp ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.voteBtn, isDown && { backgroundColor: colors.destructive + "18" }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleDownvote(item.id);
                  }}
                >
                  <Feather name="arrow-down" size={16} color={isDown ? colors.destructive : colors.mutedForeground} />
                  <Text style={[styles.voteCount, { color: isDown ? colors.destructive : colors.mutedForeground }]}>
                    {item.downvotes + (isDown ? 1 : 0)}
                  </Text>
                </TouchableOpacity>

                <View style={styles.spacer} />
                <Text style={[styles.netVotes, { color: netVotes > 0 ? colors.success : colors.mutedForeground }]}>
                  {netVotes > 0 ? "+" : ""}{netVotes} net
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
  },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  sortRow: { flexDirection: "row", gap: 6 },
  sortPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  sortText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  scrollContent: { padding: 16, gap: 12 },
  banner: { borderRadius: 12, borderWidth: 1, padding: 14, flexDirection: "row", gap: 12, marginBottom: 4 },
  bannerText: { flex: 1, gap: 3 },
  bannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  bannerBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  card: { borderRadius: 10, borderWidth: 1, padding: 14, gap: 10 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  publisherBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, maxWidth: "60%" },
  pubDot: { width: 6, height: 6, borderRadius: 3 },
  publisher: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  credBadge: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  credText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  headline: { fontSize: 16, fontFamily: "Inter_700Bold", lineHeight: 22, letterSpacing: -0.2 },
  notesRow: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  notesText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  viewNotesBtn: { flexDirection: "row", alignItems: "center", gap: 2 },
  viewNotesBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  voteRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  voteBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  voteCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  spacer: { flex: 1 },
  netVotes: { fontSize: 12, fontFamily: "Inter_500Medium" },
});
