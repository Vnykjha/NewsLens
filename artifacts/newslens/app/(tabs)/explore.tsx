import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
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
import { ArticleCard } from "@/components/ArticleCard";
import { useColors } from "@/hooks/useColors";
import { MOCK_ARTICLES } from "@/lib/mockData";

const TOPICS = [
  { id: "t1", name: "AI & Tech", icon: "cpu", color: "#6D28D9" },
  { id: "t2", name: "Politics", icon: "globe", color: "#1D4ED8" },
  { id: "t3", name: "Business", icon: "trending-up", color: "#D97706" },
  { id: "t4", name: "Science", icon: "activity", color: "#1A7F4B" },
  { id: "t5", name: "Climate", icon: "wind", color: "#0EA5E9" },
  { id: "t6", name: "Sports", icon: "award", color: "#C41E3A" },
];

const PUBLISHERS = [
  { id: "p1", name: "Reuters", initial: "RE", color: "#C41E3A" },
  { id: "p2", name: "Bloomberg", initial: "BL", color: "#0D0D0D" },
  { id: "p3", name: "The Guardian", initial: "GU", color: "#1A7F4B" },
  { id: "p4", name: "AP News", initial: "AP", color: "#C41E3A" },
  { id: "p5", name: "MIT Tech Review", initial: "MT", color: "#6D28D9" },
  { id: "p6", name: "FT", initial: "FT", color: "#D97706" },
];

export default function ExploreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const results = query.length > 1
    ? MOCK_ARTICLES.filter(
        (a) =>
          a.headline.toLowerCase().includes(query.toLowerCase()) ||
          a.publisher.toLowerCase().includes(query.toLowerCase()) ||
          a.category.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Explore</Text>

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
            placeholder="Search topics, publishers, keywords..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(""); Keyboard.dismiss(); }}>
              <Feather name="x" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        {results.length > 0 ? (
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
              {results.length} result{results.length !== 1 ? "s" : ""}
            </Text>
            {results.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        ) : query.length > 1 ? (
          <View style={styles.emptyState}>
            <Feather name="search" size={32} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results found</Text>
            <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Try different keywords or browse topics below</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Browse Topics</Text>
              <View style={styles.topicGrid}>
                {TOPICS.map((topic) => (
                  <TouchableOpacity
                    key={topic.id}
                    style={[styles.topicCard, { backgroundColor: topic.color + "12", borderColor: topic.color + "30" }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setQuery(topic.name.split(" ")[0]);
                    }}
                    activeOpacity={0.75}
                  >
                    <Feather name={topic.icon as any} size={20} color={topic.color} />
                    <Text style={[styles.topicName, { color: topic.color }]}>{topic.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Publishers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.publisherRow}>
                {PUBLISHERS.map((pub) => (
                  <TouchableOpacity
                    key={pub.id}
                    style={[styles.publisherCard, { borderColor: colors.border, backgroundColor: colors.card }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setQuery(pub.name);
                    }}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.publisherAvatar, { backgroundColor: pub.color }]}>
                      <Text style={styles.publisherInitial}>{pub.initial}</Text>
                    </View>
                    <Text style={[styles.publisherName, { color: colors.foreground }]} numberOfLines={2}>{pub.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Articles</Text>
              {MOCK_ARTICLES.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </View>
          </>
        )}
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
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    padding: 0,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.3,
    marginBottom: 14,
  },
  topicGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  topicCard: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicName: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  publisherRow: {
    gap: 10,
    paddingRight: 8,
  },
  publisherCard: {
    width: 80,
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  publisherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  publisherInitial: {
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  publisherName: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  emptyBody: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
