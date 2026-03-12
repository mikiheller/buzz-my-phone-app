import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/colors';
import BuzzAlert from '../src/components/BuzzAlert';
import { subscribeToBuzzes } from '../src/services/buzzes';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
} from '../src/services/notifications';
import { playBuzz, stopAll } from '../src/services/haptics';

function RootLayoutNav() {
  const { user, partner, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [activeBuzz, setActiveBuzz] = useState(null);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(app)');
    }
  }, [user, loading, segments]);

  useEffect(() => {
    if (!user) return;

    const sub = subscribeToBuzzes(user.id, (buzz) => {
      setActiveBuzz(buzz);
      playBuzz(buzz.level);
    });

    return () => {
      sub.unsubscribe();
      stopAll();
    };
  }, [user]);

  useEffect(() => {
    const receivedSub = addNotificationReceivedListener((notification) => {
      const data = notification.request.content.data;
      if (data?.level) {
        setActiveBuzz(data);
        playBuzz(data.level);
      }
    });

    const responseSub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      if (data?.level) {
        setActiveBuzz(data);
      }
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <BuzzAlert
        buzz={activeBuzz}
        senderName={partner?.display_name}
        onDismiss={() => setActiveBuzz(null)}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
