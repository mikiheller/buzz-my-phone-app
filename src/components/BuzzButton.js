import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Animated,
} from 'react-native';
import { colors } from '../theme/colors';

export default function BuzzButton({ level, onPress, disabled }) {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [sending, setSending] = useState(false);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.93,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = async () => {
    if (sending || disabled) return;
    setSending(true);
    try {
      await onPress(level);
    } finally {
      setSending(false);
    }
  };

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || sending}
        style={[
          styles.button,
          { backgroundColor: level.color, opacity: disabled ? 0.5 : 1 },
        ]}
      >
        <Text style={styles.emoji}>{level.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.name}>{level.name}</Text>
          <Text style={styles.description}>{level.description}</Text>
        </View>
        {sending && (
          <View style={styles.sendingOverlay}>
            <Text style={styles.sendingText}>Sending...</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  emoji: {
    fontSize: 36,
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    fontWeight: '500',
  },
  sendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  sendingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
