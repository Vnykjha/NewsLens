import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const TOPICS_PREFS = ["Politics", "Technology", "Business", "Science", "Sports", "Climate", "Culture"];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { savedArticles, folders, readingHistory } = useApp();
  const [notifications, setNotifications] = useState(true);
  const [breakingAlerts, setBreakingAlerts] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(["Technology", "Science", "Business"]);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : 60;

  const toggleTopic = (topic: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Profile</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPad + 16 }]}
      >
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={[styles.avatarText, { color: colors.primaryForeground }]}>NL</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.foreground }]}>NewsLens Reader</Text>
            <Text style={[styles.profileSub, { color: colors.mutedForeground }]}>Free Plan · Joined June 2026</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]}>
            <Feather name="edit-2" size={14} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          {[
            { label: "Analyzed", value: readingHistory.length.toString(), icon: "zap" },
            { label: "Saved", value: savedArticles.length.toString(), icon: "bookmark" },
            { label: "Folders", value: folders.length.toString(), icon: "folder" },
          ].map((stat) => (
            <View key={stat.label} style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name={stat.icon as any} size={18} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Topic Preferences</Text>
          <View style={styles.topicsWrap}>
            {TOPICS_PREFS.map((topic) => {
              const sel = selectedTopics.includes(topic);
              return (
                <TouchableOpacity
                  key={topic}
                  onPress={() => toggleTopic(topic)}
                  style={[
                    styles.topicPill,
                    {
                      backgroundColor: sel ? colors.primary : colors.secondary,
                      borderColor: sel ? colors.primary : colors.border,
                    }
                  ]}
                >
                  {sel && <Feather name="check" size={11} color={colors.primaryForeground} />}
                  <Text style={[styles.topicPillText, { color: sel ? colors.primaryForeground : colors.mutedForeground }]}>
                    {topic}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Notifications</Text>
          <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <SettingRow
              icon="bell"
              label="Push Notifications"
              value={notifications}
              onToggle={() => setNotifications((v) => !v)}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <SettingRow
              icon="zap"
              label="Breaking News Alerts"
              value={breakingAlerts}
              onToggle={() => setBreakingAlerts((v) => !v)}
              colors={colors}
            />
          </View>
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Reading History</Text>
          {readingHistory.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              No articles analyzed yet. Tap "Analyze" on any article to get started.
            </Text>
          ) : (
            readingHistory.slice(0, 5).map((article) => (
              <TouchableOpacity
                key={article.id}
                style={[styles.historyRow, { borderBottomColor: colors.border }]}
                onPress={() => router.push(`/analysis/${article.id}`)}
                activeOpacity={0.7}
              >
                <View style={[styles.histPub, { backgroundColor: article.imageColor + "20" }]}>
                  <Text style={[styles.histPubText, { color: article.imageColor }]}>
                    {article.publisher.substring(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.histHeadline, { color: colors.foreground }]} numberOfLines={2}>
                  {article.headline}
                </Text>
                <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
              </TouchableOpacity>
            ))
          )}
        </View>

        <View style={[styles.section, { borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subscription</Text>
          <View style={[styles.planCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.planRow}>
              <View>
                <Text style={[styles.planName, { color: colors.foreground }]}>Free Plan</Text>
                <Text style={[styles.planDesc, { color: colors.mutedForeground }]}>5 AI analyses per day</Text>
              </View>
              <View style={[styles.freeBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.freeBadgeText, { color: colors.mutedForeground }]}>FREE</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}>
              <Feather name="star" size={14} color={colors.primaryForeground} />
              <Text style={[styles.upgradeBtnText, { color: colors.primaryForeground }]}>Upgrade to Premium</Text>
            </TouchableOpacity>
            <Text style={[styles.upgradeDesc, { color: colors.mutedForeground }]}>
              Unlimited analyses · Offline reading · No ads
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function SettingRow({ icon, label, value, onToggle, colors }: any) {
  return (
    <View style={styles.settingRow}>
      <Feather name={icon} size={16} color={colors.mutedForeground} />
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.secondary, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1 },
  headerTitle: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  scrollContent: { padding: 16, gap: 20 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontFamily: "Inter_700Bold" },
  profileSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 1 },
  editBtn: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, borderRadius: 10, borderWidth: 1, padding: 12, alignItems: "center", gap: 4 },
  statValue: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  topicsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  topicPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  topicPillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  settingsCard: { borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  settingLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  divider: { height: 1 },
  historyRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  histPub: { width: 36, height: 36, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  histPubText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  histHeadline: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium", lineHeight: 18 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  planCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 12 },
  planRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  planName: { fontSize: 16, fontFamily: "Inter_700Bold" },
  planDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  freeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  freeBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.8 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 6, padding: 12, borderRadius: 10, justifyContent: "center" },
  upgradeBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  upgradeDesc: { fontSize: 12, fontFamily: "Inter_400Regular", textAlign: "center" },
});
