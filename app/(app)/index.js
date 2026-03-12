import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, buzzLevels } from '../../src/theme/colors';
import { sendBuzz } from '../../src/services/buzzes';
import BuzzButton from '../../src/components/BuzzButton';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { user, partner } = useAuth();
  const [message, setMessage] = useState('');

  const handleBuzz = async (level) => {
    if (!partner) {
      Alert.alert(
        'No partner yet',
        'Go to Settings to pair with your partner first!',
      );
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await sendBuzz(user.id, partner.id, level.id, message.trim());
      setMessage('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sent!', `${level.name} buzz sent to ${partner.display_name}`);
    } catch (error) {
      Alert.alert('Failed to send', error.message);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {partner ? (
        <View style={styles.partnerBadge}>
          <Text style={styles.partnerLabel}>Buzzing</Text>
          <Text style={styles.partnerName}>{partner.display_name}</Text>
        </View>
      ) : (
        <View style={styles.noParter}>
          <Text style={styles.noPartnerEmoji}>💑</Text>
          <Text style={styles.noPartnerText}>
            Pair with your partner in Settings to start buzzing!
          </Text>
        </View>
      )}

      <TextInput
        style={styles.messageInput}
        placeholder="Add a message (optional)..."
        placeholderTextColor={colors.textLight}
        value={message}
        onChangeText={setMessage}
        maxLength={200}
        multiline
      />

      <View style={styles.buzzList}>
        {buzzLevels.map((level) => (
          <BuzzButton
            key={level.id}
            level={level}
            onPress={handleBuzz}
            disabled={!partner}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  partnerBadge: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  partnerLabel: {
    fontSize: 14,
    color: colors.textLight,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  partnerName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginTop: 2,
  },
  noParter: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  noPartnerEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  noPartnerText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 22,
  },
  messageInput: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 16,
    color: colors.text,
    marginBottom: 24,
    minHeight: 50,
    maxHeight: 100,
    fontWeight: '500',
  },
  buzzList: {
    gap: 0,
  },
});
