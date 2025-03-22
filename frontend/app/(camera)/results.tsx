import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Results() {
  const { data } = useLocalSearchParams();
  const results = JSON.parse(data as string);

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => router.push('/(tabs)')}
      >
        <Ionicons name="arrow-back" size={32} color="black" />
      </TouchableOpacity>
      
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.title}>Analysis Results</Text>
        
        {results.error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={48} color="#FF6B6B" />
            <Text style={styles.errorText}>{results.error}</Text>
          </View>
        ) : (
          results.foods.map((food: { name: string; expiration_days: number }, index: number) => (
            <View key={index} style={styles.foodItem}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.expiry}>
                Expires in: {food.expiration_days} days
              </Text>
            </View>
          ))
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.retakeButton}
        onPress={() => router.push('/(camera)/camera')}
      >
        <Text style={styles.retakeText}>Retake Image</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 60,
    textAlign: 'center',
  },
  foodItem: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f5f5f5',
    marginBottom: 10,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '600',
  },
  expiry: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  retakeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 10,
  },
  retakeText: {
    color: 'white',
    fontSize: 16,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFF3F3',
    borderRadius: 10,
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 10,
  },
}); 