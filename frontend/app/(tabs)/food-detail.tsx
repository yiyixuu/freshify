import { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";
import { ThemedText } from "@/components/ThemedText";

type FoodDetailParams = Record<string, string>;

export default function FoodDetailScreen() {
  const params = useLocalSearchParams<FoodDetailParams>();
  const [quantity, setQuantity] = useState(parseInt(params.quantity || "0"));

  // Calculate freshness score (1-5) based on expiry days
  const expiryDays = parseInt(params.expiry || "0");
  const getFreshnessLevel = () => {
    if (expiryDays <= 2) return "Bad";
    if (expiryDays <= 4) return "Poor";
    if (expiryDays <= 6) return "Average";
    if (expiryDays <= 8) return "Good";
    return "Excellent";
  };

  const getFreshnessPosition = () => {
    const levels = {
      Bad: 0,
      Poor: 0.25,
      Average: 0.5,
      Good: 0.75,
      Excellent: 1,
    };
    return levels[getFreshnessLevel()] * 100;
  };

  const handleMarkCompleted = async () => {
    try {
      // const { error: updateError } = await supabase
      //   .from("items")
      //   .delete()
      //   .eq("id", params.id);

      // if (updateError) {
      //   console.error("Error updating item:", updateError);
      //   throw updateError;
      // }

      console.log(expiryDays);

      // Increment waste counters if food is about to expire
      if (expiryDays <= 3) {
        console.log("Incrementing impact counters");
        const { error: impactError } = await supabase.rpc(
          "increment_impact_counters",
          {
            money_amount: parseFloat(params.price || "0"),
            meals_amount: 1,
            user_id: params.user_id,
          }
        );
        if (impactError) {
          console.error("Error updating impact:", impactError);
          throw impactError;
        }
      }

      router.back();
    } catch (error) {
      console.error("Error marking item as completed:", error);
    }
  };

  const handleMarkWasted = async () => {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found");
        return;
      }

      // Delete the item
      const { error: deleteError } = await supabase
        .from("items")
        .delete()
        .eq("id", params.id)
        .eq("user_id", user.id);

      if (deleteError) {
        console.error("Error deleting item:", deleteError);
        throw deleteError;
      }

      // Increment waste counters
      const { error: wasteError } = await supabase.rpc(
        "increment_waste_counters",
        {
          user_id: user.id,
          amount: quantity,
        }
      );

      if (wasteError) {
        console.error("Error updating waste counters:", wasteError);
        throw wasteError;
      }

      router.back();
    } catch (error) {
      console.error("Error marking item as wasted:", error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <Image
        source={{ uri: params.img_url }}
        style={styles.image}
        resizeMode="contain"
      />

      <View style={styles.pageIndicator}>
        <View style={styles.activeDot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={styles.content}>
        <ThemedText style={styles.title}>{params.name}</ThemedText>
        <ThemedText style={styles.expiry}>
          Expires in {params.expiry} Days
        </ThemedText>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Freshness</ThemedText>
          <View style={styles.freshnessBar}>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barIndicator,
                  { left: `${getFreshnessPosition()}%` },
                ]}
              />
            </View>
            <View style={styles.barLabels}>
              <ThemedText style={styles.barLabel}>Bad</ThemedText>
              <ThemedText style={styles.barLabel}>Poor</ThemedText>
              <ThemedText style={styles.barLabel}>Average</ThemedText>
              <ThemedText style={styles.barLabel}>Good</ThemedText>
              <ThemedText style={styles.barLabel}>Excellent</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Quantity:</ThemedText>
          <View style={styles.quantityControl}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(0, quantity - 1))}
              style={styles.quantityButton}
            >
              <ThemedText style={styles.quantityButtonText}>−</ThemedText>
            </TouchableOpacity>
            <ThemedText style={styles.quantity}>{quantity}</ThemedText>
            <TouchableOpacity
              onPress={() => setQuantity(quantity + 1)}
              style={styles.quantityButton}
            >
              <ThemedText style={styles.quantityButtonText}>+</ThemedText>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.stateButton, { marginTop: 16 }]}
            onPress={async () => {
              try {
                const { error } = await supabase
                  .from("items")
                  .update({ quantity: quantity })
                  .eq("id", params.id);

                if (error) {
                  console.error("Error updating quantity:", error);
                  throw error;
                }
                router.back();
              } catch (error) {
                console.error("Error saving quantity:", error);
              }
            }}
          >
            <ThemedText style={styles.stateButtonText}>
              Save Quantity
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Freshness State:</ThemedText>
          <TouchableOpacity
            style={styles.stateButton}
            onPress={handleMarkCompleted}
          >
            <ThemedText style={styles.stateButtonText}>Completed</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.stateButton, styles.wastedButton]}
            onPress={handleMarkWasted}
          >
            <ThemedText style={styles.stateButtonText}>Wasted</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  image: {
    width: "100%",
    height: 400,
    backgroundColor: "#f8fafc",
  },
  pageIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#e2e8f0",
  },
  activeDot: {
    width: 24,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 8,
  },
  expiry: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  freshnessBar: {
    width: "100%",
  },
  barBackground: {
    height: 8,
    backgroundColor: "#e2e8f0",
    borderRadius: 4,
    marginBottom: 8,
    position: "relative",
  },
  barIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    position: "absolute",
    top: -4,
    marginLeft: -8,
  },
  barLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  barLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 24,
    color: "#64748b",
  },
  quantity: {
    fontSize: 24,
    fontWeight: "600",
  },
  stateButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  wastedButton: {
    backgroundColor: "#ef4444",
  },
  stateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
