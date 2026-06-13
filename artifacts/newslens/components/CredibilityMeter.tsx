import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface CredibilityMeterProps {
  score: number;
  size?: "sm" | "lg";
}

export function CredibilityMeter({ score, size = "lg" }: CredibilityMeterProps) {
  const colors = useColors();

  const color =
    score >= 80
      ? colors.credibilityHigh
      : score >= 60
      ? colors.credibilityMedium
      : colors.credibilityLow;

  const label =
    score >= 80 ? "High Credibility" : score >= 60 ? "Moderate" : "Low Credibility";

  if (size === "sm") {
    return (
      <View style={[styles.smContainer, { borderColor: color }]}>
        <Text style={[styles.smNumber, { color }]}>{score}</Text>
      </View>
    );
  }

  const barWidth = `${score}%` as const;

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.labelText, { color: colors.mutedForeground }]}>Credibility Score</Text>
          <Text style={[styles.scoreText, { color }]}>{score}<Text style={[styles.outOf, { color: colors.mutedForeground }]}>/100</Text></Text>
        </View>
        <View style={[styles.badge, { backgroundColor: color + "18", borderColor: color + "40" }]}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <Text style={[styles.badgeText, { color }]}>{label}</Text>
        </View>
      </View>

      <View style={[styles.barTrack, { backgroundColor: colors.secondary }]}>
        <View style={[styles.barFill, { width: barWidth as any, backgroundColor: color }]} />
      </View>

      <View style={styles.markers}>
        <Text style={[styles.markerText, { color: colors.credibilityLow }]}>0</Text>
        <Text style={[styles.markerText, { color: colors.credibilityMedium }]}>60</Text>
        <Text style={[styles.markerText, { color: colors.credibilityHigh }]}>100</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  labelText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginBottom: 2,
  },
  scoreText: {
    fontSize: 36,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1,
  },
  outOf: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    letterSpacing: 0,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  markers: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  markerText: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  smContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  smNumber: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
});
