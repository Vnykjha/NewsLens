import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArticleCard } from "@/components/ArticleCard";
import { useColors } from "@/hooks/useColors";
import { MOCK_ARTICLES, TRENDING_ARTICLES } from "@/lib/mockData";
import { useGetArticles } from "@workspace/api-client-react";

const CATEGORIES = ["All", "Politics", "Technology", "Business", "Science", "Sports"];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const { data: articles = [], refetch, error, isError } = useGetArticles();
  if (isError) {
    console.error("HomeScreen: Failed to fetch articles:", error);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const activeArticles = articles && articles.length > 0 ? articles : MOCK_ARTICLES;

  const filtered =
    selectedCategory === "All"
      ? activeArticles
      : activeArticles.filter((a) => a.category === selectedCategory);

  const trendingArticles =
    articles && articles.length > 0 ? activeArticles.slice(0, 4) : TRENDING_ARTICLES;

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch {}
    setRefreshing(false);
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.header,
          {
            paddingTop: topPad + 12,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            opacity: headerOpacity,
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.headerEyebrow, { color: colors.accent }]}>
              NEWSLENS
            </Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Today's Briefing
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.headerIcon, { backgroundColor: colors.secondary }]}
            onPress={() => router.push("/(tabs)/explore")}
          >
            <Feather name="search" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: selectedCategory === cat ? colors.primary : colors.secondary,
                  borderColor: selectedCategory === cat ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat ? colors.primaryForeground : colors.mutedForeground },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPad + 20 },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.accent}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedCategory === "All" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Trending
              </Text>
            </View>
            {trendingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.mutedForeground }]} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {selectedCategory === "All" ? "Latest" : selectedCategory}
            </Text>
          </View>
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </View>

        <View style={[styles.dividerRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>
            You're all caught up
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingBottom: 0,
    zIndex: 10,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerEyebrow: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
    marginBottom: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  categoryScroll: { marginBottom: 0 },
  categoryContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 6,
    flexDirection: "row",
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  dividerRow: {
    borderTopWidth: 1,
    paddingTop: 24,
    alignItems: "center",
    marginTop: 8,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
