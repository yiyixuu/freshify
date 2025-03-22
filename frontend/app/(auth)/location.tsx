import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const countries = [
  { id: "us", name: "United States" },
  { id: "uk", name: "United Kingdom" },
  { id: "ca", name: "Canada" },
  { id: "au", name: "Australia" },
  { id: "fr", name: "France" },
  { id: "de", name: "Germany" },
  { id: "it", name: "Italy" },
  { id: "es", name: "Spain" },
  { id: "jp", name: "Japan" },
  { id: "kr", name: "South Korea" },
  { id: "in", name: "India" },
  { id: "br", name: "Brazil" },
  { id: "mx", name: "Mexico" },
  { id: "sg", name: "Singapore" },
  { id: "ae", name: "UAE" },
];

const cities = {
  us: [
    "New York",
    "Los Angeles",
    "Chicago",
    "Houston",
    "Phoenix",
    "Philadelphia",
    "San Antonio",
    "San Diego",
    "Dallas",
    "San Jose",
  ],
  uk: [
    "London",
    "Manchester",
    "Birmingham",
    "Glasgow",
    "Liverpool",
    "Bristol",
    "Leeds",
    "Edinburgh",
    "Newcastle",
    "Cardiff",
  ],
  ca: [
    "Toronto",
    "Montreal",
    "Vancouver",
    "Calgary",
    "Ottawa",
    "Edmonton",
    "Quebec City",
    "Winnipeg",
    "Hamilton",
    "Victoria",
  ],
  au: [
    "Sydney",
    "Melbourne",
    "Brisbane",
    "Perth",
    "Adelaide",
    "Gold Coast",
    "Newcastle",
    "Canberra",
    "Wollongong",
    "Logan",
  ],
  fr: [
    "Paris",
    "Marseille",
    "Lyon",
    "Toulouse",
    "Nice",
    "Nantes",
    "Strasbourg",
    "Montpellier",
    "Bordeaux",
    "Lille",
  ],
  de: [
    "Berlin",
    "Hamburg",
    "Munich",
    "Cologne",
    "Frankfurt",
    "Stuttgart",
    "Düsseldorf",
    "Leipzig",
    "Dortmund",
    "Essen",
  ],
  it: [
    "Rome",
    "Milan",
    "Naples",
    "Turin",
    "Palermo",
    "Genoa",
    "Bologna",
    "Florence",
    "Bari",
    "Catania",
  ],
  es: [
    "Madrid",
    "Barcelona",
    "Valencia",
    "Seville",
    "Zaragoza",
    "Málaga",
    "Murcia",
    "Palma",
    "Bilbao",
    "Alicante",
  ],
  jp: [
    "Tokyo",
    "Yokohama",
    "Osaka",
    "Nagoya",
    "Sapporo",
    "Fukuoka",
    "Kobe",
    "Kyoto",
    "Kawasaki",
    "Saitama",
  ],
  kr: [
    "Seoul",
    "Busan",
    "Incheon",
    "Daegu",
    "Daejeon",
    "Gwangju",
    "Suwon",
    "Ulsan",
    "Seongnam",
    "Goyang",
  ],
  in: [
    "Mumbai",
    "Delhi",
    "Bangalore",
    "Hyderabad",
    "Chennai",
    "Kolkata",
    "Pune",
    "Ahmedabad",
    "Jaipur",
    "Surat",
  ],
  br: [
    "São Paulo",
    "Rio de Janeiro",
    "Brasília",
    "Salvador",
    "Fortaleza",
    "Belo Horizonte",
    "Manaus",
    "Curitiba",
    "Recife",
    "Porto Alegre",
  ],
  mx: [
    "Mexico City",
    "Guadalajara",
    "Monterrey",
    "Puebla",
    "Tijuana",
    "León",
    "Juárez",
    "Zapopan",
    "Mérida",
    "Cancún",
  ],
  sg: [
    "Central Area",
    "Woodlands",
    "Tampines",
    "Jurong East",
    "Punggol",
    "Ang Mo Kio",
    "Sengkang",
    "Yishun",
    "Bedok",
    "Clementi",
  ],
  ae: [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Al Ain",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
    "Umm Al Quwain",
    "Dubai Marina",
    "Palm Jumeirah",
  ],
};

export default function LocationSelection() {
  const router = useRouter();
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showCountries, setShowCountries] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const handleCountrySelect = (countryId: string) => {
    setSelectedCountry(countryId);
    setSelectedCity("");
    setShowCountries(false);
  };

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    setShowCities(false);
  };

  const handleNext = () => {
    try {
      console.log("handleNext called");
      console.log("selectedCountry:", selectedCountry);
      console.log("selectedCity:", selectedCity);

      if (selectedCountry && selectedCity) {
        console.log("Attempting navigation to signup");
        router.push("/(auth)/signup" as any);
      } else {
        console.log("Navigation conditions not met");
      }
    } catch (error) {
      console.error("Error in handleNext:", error);
    }
  };

  console.log(!selectedCountry || !selectedCity);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color="#0f172a" />
        </TouchableOpacity>

        <View style={styles.mapIconContainer}>
          <Ionicons name="location" size={48} color="#4f46e5" />
        </View>

        <Text style={styles.title}>Select Your Location</Text>
        <Text style={styles.subtitle}>
          Choose your location to find services near you
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Your Country</Text>
            <TouchableOpacity
              style={[styles.select, showCountries && styles.activeSelect]}
              onPress={() => {
                setShowCountries(!showCountries);
                setShowCities(false);
              }}
            >
              <Text style={styles.selectText}>
                {selectedCountry
                  ? countries.find((c) => c.id === selectedCountry)?.name
                  : "Select Country"}
              </Text>
              <Ionicons
                name={showCountries ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
            {showCountries && (
              <View style={styles.dropdownWrapper}>
                <ScrollView
                  style={styles.dropdown}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {countries.map((country) => (
                    <TouchableOpacity
                      key={country.id}
                      style={styles.dropdownItem}
                      onPress={() => handleCountrySelect(country.id)}
                    >
                      <Text style={styles.dropdownText}>{country.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup2}>
            <Text style={styles.label}>Your City</Text>
            <TouchableOpacity
              style={[
                styles.select,
                !selectedCountry && styles.selectDisabled,
                showCities && styles.activeSelect,
              ]}
              onPress={() => {
                if (selectedCountry) {
                  setShowCities(!showCities);
                  setShowCountries(false);
                }
              }}
              disabled={!selectedCountry}
            >
              <Text
                style={[
                  styles.selectText,
                  !selectedCountry && styles.selectTextDisabled,
                ]}
              >
                {selectedCity || "Select City"}
              </Text>
              <Ionicons
                name={showCities ? "chevron-up" : "chevron-down"}
                size={20}
                color="#64748b"
              />
            </TouchableOpacity>
            {showCities && selectedCountry && (
              <View style={styles.dropdownWrapper}>
                <ScrollView
                  style={styles.dropdown}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {cities[selectedCountry as keyof typeof cities].map(
                    (city) => (
                      <TouchableOpacity
                        key={city}
                        style={styles.dropdownItem}
                        onPress={() => handleCitySelect(city)}
                      >
                        <Text style={styles.dropdownText}>{city}</Text>
                      </TouchableOpacity>
                    )
                  )}
                </ScrollView>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.button,
            (!selectedCountry || !selectedCity) && styles.buttonDisabled,
          ]}
          onPress={() => {
            console.log("Button pressed");
            console.log("Current state:", { selectedCountry, selectedCity });
            handleNext();
          }}
          disabled={!selectedCountry || !selectedCity}
        >
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  backButton: {
    marginTop: 20,
  },
  mapIconContainer: {
    alignSelf: "center",
    marginTop: 40,
    marginBottom: 20,
    width: 80,
    height: 80,
    backgroundColor: "#e0e7ff",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0f172a",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  form: {
    gap: 20,
    marginBottom: 40,
    position: "relative",
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
    position: "relative",
    zIndex: 2,
  },
  inputGroup2: {
    gap: 8,
    marginBottom: 16,
    position: "relative",
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 4,
  },
  select: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  activeSelect: {
    borderColor: "#4f46e5",
    backgroundColor: "#fff",
    zIndex: 1000,
  },
  selectDisabled: {
    backgroundColor: "#f1f5f9",
    borderColor: "#e2e8f0",
  },
  selectText: {
    fontSize: 16,
    color: "#0f172a",
  },
  selectTextDisabled: {
    color: "#94a3b8",
  },
  dropdownWrapper: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1000,
  },
  dropdown: {
    maxHeight: SCREEN_HEIGHT * 0.25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  dropdownText: {
    fontSize: 14,
    color: "#0f172a",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 30,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#86efac",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
