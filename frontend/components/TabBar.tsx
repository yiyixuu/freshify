import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./ThemedText";

export function TabBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", icon: "home", route: "/" },
    { name: "My Food", icon: "search", route: "/myfood" },
    { name: "Recipes", icon: "restaurant", route: "/recipes" },
    { name: "Impact", icon: "heart", route: "/impact" },
    { name: "Account", icon: "person", route: "/(auth)/login" },
  ];

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.route as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive ? "#22c55e" : "#64748b"}
            />
            <ThemedText
              style={[
                styles.tabText,
                { color: isActive ? "#22c55e" : "#64748b" },
              ]}
            >
              {tab.name}
            </ThemedText>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 24 : 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  tabText: {
    fontSize: 12,
    marginTop: 4,
  },
});
