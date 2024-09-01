import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

interface SwapResultAnnouncementProps {
  blendingComplete: boolean;
  error: string | null;
}

export const SwapResultAnnouncement: React.FC<SwapResultAnnouncementProps> = ({
  blendingComplete,
  error,
}) => {
  return (
    <>
      {blendingComplete && (
        <ThemedText style={styles.successText}>
          Face swap complete! The result is visible in the image above.
        </ThemedText>
      )}
      {error && (
        <ThemedText style={styles.errorText}>Error: {error}</ThemedText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  successText: {
    color: 'green',
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});
