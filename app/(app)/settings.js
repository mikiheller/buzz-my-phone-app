import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
  Share,
} from 'react-native';
import { TextInput } from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors } from '../../src/theme/colors';

export default function SettingsScreen() {
  const { profile, partner, signOut, generatePairCode, joinWithCode, unpair } = useAuth();
  const [pairCode, setPairCode] = useState(null);
  const [joinInput, setJoinInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerateCode = async () => {
    setLoading(true);
    try {
      const code = await generatePairCode();
      setPairCode(code);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!pairCode) return;
    await Share.share({
      message: `Join me on BuzzMe! Enter this code to pair with me: ${pairCode}`,
    });
  };

  const handleJoin = async () => {
    if (!joinInput.trim()) {
      Alert.alert('Oops', 'Please enter a pairing code');
      return;
    }
    setLoading(true);
    try {
      await joinWithCode(joinInput.trim());
      setJoinInput('');
      Alert.alert('Paired!', "You're now connected with your partner!");
    } catch (error) {
      Alert.alert('Pairing failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnpair = () => {
    Alert.alert(
      'Unpair?',
      'Are you sure you want to disconnect from your partner?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unpair',
          style: 'destructive',
          onPress: async () => {
            try {
              await unpair();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign out?', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <Text style={styles.profileEmoji}>👤</Text>
        <Text style={styles.profileName}>{profile?.display_name || 'You'}</Text>
        <Text style={styles.profileEmail}>{profile?.email}</Text>
      </View>

      <Text style={styles.sectionTitle}>Partner</Text>

      {partner ? (
        <View style={styles.card}>
          <View style={styles.partnerRow}>
            <Text style={styles.partnerEmoji}>💕</Text>
            <View style={styles.partnerInfo}>
              <Text style={styles.partnerName}>{partner.display_name}</Text>
              <Text style={styles.partnerStatus}>Connected</Text>
            </View>
          </View>
          <Pressable style={styles.dangerButton} onPress={handleUnpair}>
            <Text style={styles.dangerButtonText}>Unpair</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.pairTitle}>Pair with your partner</Text>
          <Text style={styles.pairDescription}>
            One of you generates a code, the other enters it. That's it!
          </Text>

          <View style={styles.pairSection}>
            <Text style={styles.pairLabel}>Option 1: Generate a code</Text>
            <Pressable
              style={styles.primaryButton}
              onPress={handleGenerateCode}
              disabled={loading}
            >
              <Text style={styles.primaryButtonText}>
                {pairCode ? 'Generate New Code' : 'Generate Code'}
              </Text>
            </Pressable>

            {pairCode && (
              <View style={styles.codeContainer}>
                <Text style={styles.codeLabel}>Your code (expires in 15 min):</Text>
                <Text style={styles.code}>{pairCode}</Text>
                <Pressable style={styles.shareButton} onPress={handleShareCode}>
                  <Text style={styles.shareButtonText}>Share Code</Text>
                </Pressable>
              </View>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.pairSection}>
            <Text style={styles.pairLabel}>Option 2: Enter partner's code</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="Enter 6-character code"
              placeholderTextColor={colors.textLight}
              value={joinInput}
              onChangeText={setJoinInput}
              autoCapitalize="characters"
              maxLength={6}
            />
            <Pressable
              style={styles.primaryButton}
              onPress={handleJoin}
              disabled={loading || !joinInput.trim()}
            >
              <Text style={styles.primaryButtonText}>Pair</Text>
            </Pressable>
          </View>
        </View>
      )}

      <Pressable style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>BuzzMe v1.0.0</Text>
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
    paddingBottom: 60,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  profileEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  profileEmail: {
    fontSize: 15,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 28,
  },
  partnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  partnerEmoji: {
    fontSize: 40,
    marginRight: 14,
  },
  partnerInfo: {
    flex: 1,
  },
  partnerName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  partnerStatus: {
    fontSize: 15,
    color: colors.success,
    fontWeight: '600',
    marginTop: 2,
  },
  pairTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  pairDescription: {
    fontSize: 15,
    color: colors.textLight,
    marginBottom: 20,
    lineHeight: 21,
    fontWeight: '500',
  },
  pairSection: {
    gap: 12,
  },
  pairLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: colors.textInverse,
    fontSize: 16,
    fontWeight: '700',
  },
  codeContainer: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 13,
    color: colors.textLight,
    marginBottom: 8,
    fontWeight: '600',
  },
  code: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 6,
  },
  shareButton: {
    marginTop: 12,
    backgroundColor: colors.secondary,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  shareButtonText: {
    color: colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  codeInput: {
    backgroundColor: colors.background,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    letterSpacing: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  dangerButton: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  dangerButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
  },
  signOutButton: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    marginBottom: 16,
  },
  signOutText: {
    color: colors.textLight,
    fontSize: 16,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: colors.textLight,
    fontSize: 13,
    fontWeight: '500',
  },
});
