import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, buzzLevels } from '../../src/theme/colors';
import { getBuzzHistory } from '../../src/services/buzzes';

function BuzzHistoryItem({ item, userId }) {
  const isSent = item.sender_id === userId;
  const levelInfo = buzzLevels.find((l) => l.id === item.level) || buzzLevels[0];
  const time = new Date(item.created_at);
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' });

  return (
    <View style={[styles.item, { borderLeftColor: levelInfo.color }]}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemEmoji}>{levelInfo.emoji}</Text>
        <View style={styles.itemInfo}>
          <Text style={styles.itemLevel}>
            {levelInfo.name}
            <Text style={styles.itemDirection}>
              {isSent ? ' — Sent' : ' — Received'}
            </Text>
          </Text>
          <Text style={styles.itemTime}>{dateStr} at {timeStr}</Text>
        </View>
        {item.acknowledged && (
          <View style={styles.ackBadge}>
            <Text style={styles.ackBadgeText}>✓</Text>
          </View>
        )}
      </View>
      {item.message ? (
        <Text style={styles.itemMessage}>{item.message}</Text>
      ) : null}
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [buzzes, setBuzzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getBuzzHistory(user.id);
      setBuzzes(data || []);
    } catch (e) {
      console.error('Error fetching history:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, [fetchHistory]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={buzzes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BuzzHistoryItem item={item} userId={user.id} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No buzzes yet</Text>
            <Text style={styles.emptyText}>
              Send your first buzz from the home screen!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  list: {
    padding: 20,
    paddingBottom: 40,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemLevel: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  itemDirection: {
    fontWeight: '500',
    color: colors.textLight,
  },
  itemTime: {
    fontSize: 13,
    color: colors.textLight,
    marginTop: 2,
    fontWeight: '500',
  },
  ackBadge: {
    backgroundColor: colors.success,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ackBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  itemMessage: {
    fontSize: 15,
    color: colors.text,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    fontWeight: '500',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    fontWeight: '500',
  },
});
