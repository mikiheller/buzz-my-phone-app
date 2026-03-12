import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, buzzLevels } from '../theme/colors';
import { playBuzz, stopAll } from '../services/haptics';
import { acknowledgeBuzz } from '../services/buzzes';

export default function BuzzAlert({ buzz, senderName, onDismiss }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [acknowledging, setAcknowledging] = useState(false);

  const levelInfo = buzzLevels.find((l) => l.id === buzz?.level) || buzzLevels[0];
  const isUrgent = buzz?.level === 'urgent' || buzz?.level === 'emergency';

  useEffect(() => {
    if (!buzz) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    playBuzz(buzz.level);

    if (isUrgent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    return () => stopAll();
  }, [buzz]);

  const handleAcknowledge = async () => {
    if (acknowledging) return;
    setAcknowledging(true);
    stopAll();
    try {
      if (buzz?.id) {
        await acknowledgeBuzz(buzz.id);
      }
    } catch (e) {
      console.error('Error acknowledging buzz:', e);
    }
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setAcknowledging(false);
      onDismiss();
    });
  };

  if (!buzz) return null;

  return (
    <Modal transparent visible={!!buzz} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: levelInfo.color, transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Text style={styles.emoji}>{levelInfo.emoji}</Text>
          <Text style={styles.levelName}>{levelInfo.name}</Text>
          <Text style={styles.from}>from {senderName || 'your partner'}</Text>
          {buzz.message ? (
            <View style={styles.messageBox}>
              <Text style={styles.message}>{buzz.message}</Text>
            </View>
          ) : null}
          <Pressable
            onPress={handleAcknowledge}
            style={[styles.ackButton, isUrgent && styles.ackButtonUrgent]}
          >
            <Text style={styles.ackText}>
              {isUrgent ? "I'm here!" : 'Got it'}
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 12,
  },
  levelName: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.textInverse,
    letterSpacing: 1,
  },
  from: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  messageBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 20,
    width: '100%',
  },
  message: {
    fontSize: 18,
    color: colors.textInverse,
    textAlign: 'center',
    fontWeight: '600',
  },
  ackButton: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginTop: 28,
  },
  ackButtonUrgent: {
    paddingVertical: 20,
    paddingHorizontal: 64,
  },
  ackText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.secondary,
  },
});
