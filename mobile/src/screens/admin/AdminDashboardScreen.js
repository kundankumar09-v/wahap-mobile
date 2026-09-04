import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';
import { resolveImageUrl, formatEventDate } from '../../utils/imageUrl';

export default function AdminDashboardScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventsApi.getEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load admin events', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const handleDeleteEvent = (event) => {
    Alert.alert(
      'Delete Event',
      `Are you sure you want to delete "${event.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventsApi.deleteEvent(event._id);
              setEvents((prev) => prev.filter((e) => e._id !== event._id));
              Alert.alert('Success', 'Event deleted successfully.');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete event.');
            }
          },
        },
      ]
    );
  };

  const renderAdminCard = ({ item }) => (
    <View style={styles.adminCard}>
      <Image
        source={{ uri: resolveImageUrl(item.eventImage) }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.cardTopRow}>
          <Text style={styles.cardType}>{item.type || 'Event'}</Text>
          <Text style={styles.cardCity}>{item.city || 'TBA'}</Text>
        </View>

        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.cardDate}>
          {formatEventDate(item.date)} • {item.venue}
        </Text>

        {/* Action Buttons */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnEdit}
            onPress={() => navigation.navigate('AdminEditEvent', { id: item._id })}
          >
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnMap}
            onPress={() =>
              navigation.navigate('AdminMapEditor', {
                eventId: item._id,
                eventName: item.name,
                layoutImage: item.layoutImage,
              })
            }
          >
            <MaterialIcons name="layers" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Map Editor</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDelete}
            onPress={() => handleDeleteEvent(item)}
          >
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Command Center</Text>
            <Text style={styles.headerSubtitle}>Event & Venue Administration</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Ionicons name="reload" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Quick Action Hub */}
      <View style={styles.actionHub}>
        <TouchableOpacity
          style={styles.createEventBtn}
          onPress={() => navigation.navigate('AdminCreateEvent')}
        >
          <Ionicons name="add-circle" size={22} color="#fff" />
          <Text style={styles.createEventBtnText}>Create New Event</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manageBannersBtn}
          onPress={() => navigation.navigate('ManagerBanners')}
        >
          <Ionicons name="images-outline" size={18} color={colors.accent} />
          <Text style={styles.manageBannersText}>Hero Banners</Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Managed Events ({events.length})</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading admin records...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderAdminCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Events Created Yet</Text>
              <Text style={styles.emptySubtitle}>Tap 'Create New Event' to launch an event.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  refreshBtn: {
    padding: 8,
  },
  actionHub: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  createEventBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 14,
  },
  createEventBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  manageBannersBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 12,
    borderRadius: 14,
  },
  manageBannersText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  adminCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardType: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  cardCity: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnEdit: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnMap: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: colors.info,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionBtnDelete: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 4,
  },
});
