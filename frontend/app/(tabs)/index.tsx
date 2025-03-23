import { useState, useEffect } from "react";
import {
  Image,
  StyleSheet,
  Platform,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "@/lib/supabase";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { TabBar } from "@/components/TabBar";

interface Item {
  id: number;
  created_at: string;
  name: string;
  quantity: number;
  price: number;
  expiry: number;
  user_id: string;
  img_url: string;
}

export default function HomeScreen() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const isExpiringSoon = (expiryDays: number) => {
    return expiryDays <= 5; // Item expires in 5 days or less
  };

  const fetchItems = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/(auth)/signin" as any);
        return;
      }

      // First get all items for the user
      const { data: items, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("user_id", user.id);

      if (itemsError) throw itemsError;

      // Filter expiring items first
      const allItems = items || [];
      const expiringSoonItems = allItems.filter((item) =>
        isExpiringSoon(item.expiry)
      );
      const otherItems = allItems.filter(
        (item) => !isExpiringSoon(item.expiry)
      );

      // Only fetch images for items expiring soon
      const itemsWithImages = await Promise.all([
        ...(await Promise.all(
          expiringSoonItems.map(async (item) => {
            // Look up the reference image URL
            const { data: refImage, error: refError } = await supabase
              .from("food_reference_images")
              .select("file_name")
              .eq("food_name", item.name.toLowerCase())
              .single();

            if (refError) {
              console.error(
                `Error fetching reference image for ${item.name}:`,
                refError
              );
              return item;
            }

            if (refImage?.file_name) {
              // Get the actual image URL from storage
              const { data, error } = await supabase.storage
                .from("food-images")
                .createSignedUrl(refImage.file_name, 60);

              return {
                ...item,
                img_url: data?.signedUrl,
              };
            }

            return item;
          })
        )),
        ...otherItems, // Add other items without fetching images
      ]);

      setItems(itemsWithImages);
    } catch (error: any) {
      console.error("Error fetching items:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    return items.reduce((total, item) => total + (item.price || 0), 0);
  };

  const calculateMeals = () => {
    return items.length;
  };

  const expiringSoonItems = items.filter((item) => isExpiringSoon(item.expiry));

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </ThemedView>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </ThemedView>

        <ThemedView style={styles.content}>
          <View style={styles.statsContainer}>
            <ThemedText type="title">Weekly Save's?</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.reportText}>See Report</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.statsCards}>
            <ThemedView style={styles.statsCard}>
              <ThemedText style={styles.statsAmount}>
                ${calculateSavings()}
              </ThemedText>
              <ThemedText style={styles.statsLabel}>$400 This Year</ThemedText>
            </ThemedView>
            <ThemedView style={styles.statsCard}>
              <ThemedText style={styles.statsAmount}>
                {calculateMeals()}
              </ThemedText>
              <ThemedText style={styles.statsLabel}>
                263 Meals This Year
              </ThemedText>
            </ThemedView>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText type="title">Expiring Soon</ThemedText>
            <TouchableOpacity>
              <ThemedText style={styles.seeAll}>See all</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsGrid}>
            {expiringSoonItems.map((item) => (
              <ThemedView key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.img_url }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemExpiry}>
                    Expires in {item.expiry} days
                  </ThemedText>
                </View>
                <TouchableOpacity style={styles.removeButton}>
                  <Ionicons name="close-circle" size={24} color="#22c55e" />
                </TouchableOpacity>
              </ThemedView>
            ))}
          </View>

          <TouchableOpacity
            style={styles.scanButton}
            onPress={() => router.push("/(camera)/receipt")}
          >
            <ThemedText style={styles.scanButtonText}>
              Scan Your Food
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
      <TabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  reportText: {
    color: "#22c55e",
    fontSize: 16,
  },
  statsCards: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statsCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  statsAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAll: {
    color: "#22c55e",
    fontSize: 16,
  },
  itemsGrid: {
    gap: 16,
    marginBottom: 24,
  },
  itemCard: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemExpiry: {
    fontSize: 14,
    opacity: 0.7,
  },
  removeButton: {
    padding: 4,
  },
  scanButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  scanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
