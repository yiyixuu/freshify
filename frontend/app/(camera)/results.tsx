import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';

interface ConsolidatedItem {
  name: string;
  quantity: number;
  price: number;
  expiration_days: number | null;
}

interface ConsolidatedResults {
  items: ConsolidatedItem[];
  error?: string;
}

export default function Results() {
  const { data } = useLocalSearchParams();
  const results: ConsolidatedResults = JSON.parse(data as string);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveToSupabase = async () => {
    try {
      setIsSaving(true);
      
      // Check if user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { session, sessionError });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!session) {
        console.error('No session found');
        throw new Error('You must be logged in to save items');
      }

      console.log('User authenticated:', session.user.id);

      // Insert each item into the items table
      for (const item of results.items) {
        console.log('Attempting to insert item:', item);
        const { data, error } = await supabase
          .from('items')
          .insert([
            {
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              expiry: item.expiration_days
            }
          ])
          .select();

        if (error) {
          console.error('Supabase error details:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          throw error;
        }

        console.log('Successfully inserted item:', data);
      }

      Alert.alert(
        'Success',
        'Items saved to inventory!',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to save items to inventory. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = () => {
    Alert.alert(
      'Confirm Information',
      'Is this information correct?',
      [
        {
          text: 'No, Retake',
          style: 'cancel',
          onPress: () => router.push('/(camera)/camera' as any)
        },
        {
          text: 'Yes, Save',
          onPress: handleSaveToSupabase
        }
      ]
    );
  };

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
          <>
            {results.items.map((item: ConsolidatedItem, index: number) => (
              <View key={index} style={styles.foodItem}>
                <Text style={styles.foodName}>{item.name}</Text>
                <Text style={styles.details}>Quantity: {item.quantity}</Text>
                <Text style={styles.details}>Price: ${item.price.toFixed(2)}</Text>
                <Text style={[
                  styles.expiry,
                  !item.expiration_days && styles.missingExpiry
                ]}>
                  {item.expiration_days 
                    ? `Expires in: ${item.expiration_days} days`
                    : 'Expiry date not available'}
                </Text>
              </View>
            ))}
            <View style={styles.totalContainer}>
              <Text style={styles.totalText}>
                Total: ${results.items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}
              </Text>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.confirmButton]}
          onPress={handleConfirm}
          disabled={isSaving}
        >
          {isSaving ? (
            <Text style={styles.buttonText}>Saving...</Text>
          ) : (
            <Text style={styles.buttonText}>Confirm & Save</Text>
          )}
        </TouchableOpacity>
      </View>
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
  details: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  expiry: {
    fontSize: 16,
    color: '#4CAF50',
    marginTop: 5,
    fontWeight: '500',
  },
  missingExpiry: {
    color: '#FF6B6B',
    fontStyle: 'italic',
  },
  totalContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
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