import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function AnimatedWorkerCard({
  worker,
  index,
}) {
  const fadeAnim = useRef(
    new Animated.Value(0)
  ).current;

  const slideAnim = useRef(
    new Animated.Value(35)
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        delay: 300 + index * 150,
        useNativeDriver: true,
      }),

      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        delay: 300 + index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.workerCard,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: slideAnim,
            },
          ],
        },
      ]}
    >

      {/* WORKER IMAGE */}

      <Image
        source={{
          uri: worker.image,
        }}
        style={styles.workerImage}
      />

      {/* WORKER INFORMATION */}

      <View style={styles.workerInfo}>

        <Text style={styles.workerName}>
          {worker.name}
        </Text>

        <View style={styles.ratingRow}>

          <Ionicons
            name="star"
            size={14}
            color="#F59E0B"
          />

          <Text style={styles.ratingText}>
            {worker.rating} • {worker.experience}
          </Text>

        </View>

        <Text style={styles.price}>
          {worker.price}
        </Text>

      </View>

    </Animated.View>
  );
}

export default function Carpenterscreen({ onBack }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
        <Text style={styles.headerTitle}>Carpenter Services</Text>
        <View style={{ width: 24 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Find experienced carpenters near you</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 16,
  },
  workerCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  workerInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  workerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#64748B',
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
    marginTop: 4,
  },
});