import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '@/store/userStore';
import { notificationsApi, NotificationItem } from '@/services/api';
import BottomNavigation from '@/components/BottomNavigation';

export default function NotificationsScreen() {
  const { userId } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await notificationsApi.listByUser(userId);
      setNotifications(data);
    } catch (err) {
      console.warn('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, [userId]);

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      Alert.alert('Notifications', 'All notifications marked as read.');
    } catch (e) {
      //
    }
  };

  const handleReadSingle = async (notifId: string) => {
    try {
      await notificationsApi.markAsRead(userId, notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n))
      );
    } catch (e) {
      //
    }
  };

  const getIconForType = (type: string, title: string) => {
    if (title.toLowerCase().includes('booking')) return '✓';
    if (title.toLowerCase().includes('driver')) return '🚗';
    if (title.toLowerCase().includes('departure')) return '⏰';
    return '🔔';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.headerTitle}>Notifications</Text>

          <Pressable onPress={handleMarkAllRead}>
            <Text style={{ fontSize: 13, color: '#0071E3', fontWeight: '700' }}>Mark all</Text>
          </Pressable>
        </View>

        {loading ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color="#0071E3" />
          </View>
        ) : notifications.length > 0 ? (
          notifications.map((item) => (
            <Pressable key={item.id} onPress={() => handleReadSingle(item.id)}>
              <NotificationCard
                icon={getIconForType(item.type, item.title)}
                title={item.title}
                message={item.message}
                time={item.time || 'Recently'}
                type={item.type || 'info'}
              />
            </Pressable>
          ))
        ) : null}

        {/* Empty-style footer */}
        <View style={styles.footer}>
          <Text style={styles.footerIcon}>🔔</Text>
          <Text style={styles.footerTitle}>You{"'"}re all caught up</Text>
          <Text style={styles.footerText}>
            New trip alerts and payment notifications from Blublu server will appear here.
          </Text>
        </View>
      </ScrollView>
      <BottomNavigation />
    </SafeAreaView>
  );
}

function NotificationCard({
  icon,
  title,
  message,
  time,
  type,
}: {
  icon: string;
  title: string;
  message: string;
  time: string;
  type: 'success' | 'info' | 'warning';
}) {
  return (
    <View style={styles.notificationCard}>
      <View
        style={[
          styles.iconContainer,
          type === 'success' && styles.successIcon,
          type === 'info' && styles.infoIcon,
          type === 'warning' && styles.warningIcon,
        ]}
      >
        <Text
          style={[
            styles.icon,
            type === 'success' && styles.successIconText,
            type === 'info' && styles.infoIconText,
            type === 'warning' && styles.warningIconText,
          ]}
        >
          {icon}
        </Text>
      </View>

      <View style={styles.notificationContent}>
        <View style={styles.titleRow}>
          <Text style={styles.notificationTitle}>{title}</Text>
          <Text style={styles.time}>{time}</Text>
        </View>

        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7', // Apple Canvas
  },

  content: {
    padding: 20,
    paddingBottom: 100,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
  },

  back: {
    fontSize: 26,
    lineHeight: 28,
    color: '#1D1D1F',
    fontWeight: '300',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1D1D1F',
    letterSpacing: -0.3,
  },

  notificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(229, 229, 234, 0.8)',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
      },
      default: {},
    }),
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  successIcon: {
    backgroundColor: 'rgba(52, 199, 89, 0.12)',
  },

  infoIcon: {
    backgroundColor: 'rgba(0, 113, 227, 0.08)',
  },

  warningIcon: {
    backgroundColor: 'rgba(255, 149, 0, 0.12)',
  },

  icon: {
    fontSize: 18,
    fontWeight: '900',
  },

  successIconText: {
    color: '#34C759',
  },

  infoIconText: {
    color: '#0071E3',
  },

  warningIconText: {
    color: '#FF9500',
  },

  notificationContent: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  notificationTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  time: {
    marginLeft: 8,
    fontSize: 10,
    color: '#86868B',
  },

  message: {
    marginTop: 3,
    fontSize: 12,
    lineHeight: 17,
    color: '#86868B',
  },

  footer: {
    alignItems: 'center',
    paddingVertical: 35,
  },

  footerIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  footerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1D1D1F',
  },

  footerText: {
    marginTop: 4,
    fontSize: 12,
    color: '#86868B',
  },
});