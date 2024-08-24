import React from 'react';
import { SafeAreaView } from 'react-native';
import { Stack } from 'expo-router';
import HomeScreen from './HomeScreen';
import { styles } from './styles';

export default function IndexPage() {
  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <HomeScreen />
    </SafeAreaView>
  );
}
