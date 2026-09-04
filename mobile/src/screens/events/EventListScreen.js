import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';
import { resolveImageUrl, formatEventDate } from '../../utils/imageUrl';

const EVENT_TYPES = [
  'All',
  'Music Concerts',
  'Food Festivals',
  'Tech & Hackathons',
  'Workshops',
  'Comedy Shows',
  'Cultural & Traditional',
  'Art & Exhibitions',
  'Sports & Fitness',
];

const CITIES = ['All', 'Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai'];

export default function EventListScreen({ route, navigation }) {
  const initialType = route.params?.type || 'All';
  const initialCity = route.params?.city || 'All';

  const [selectedType, setSelectedType] = useState(initialType);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const data = await eventsApi.getEvents({
        type: selectedType,
        city: selectedCity,
        query: searchQuery,
      });
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch events', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedType, selectedCity, searchQuery]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const renderEvent = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.88}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { id: item._id })}
    >
      <Image
        source={{ uri: resolveImageUrl(item.eventImage) }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventInfo}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.type || 'Event'}</Text>
          </View>
          <Text style={styles.priceTag}>
            {item.ticketPrice ? `₹${item.ticketPrice}` : 'Free'}
          </Text>
        </View>

        <Text style={styles.eventName} numberOfLines={2}>
          {item.name}
        </Text>

        <View style={styles.metaRow}>
          <Ionicons name="calendar-outline" size={14} color={colors.primaryLight} />
          <Text style={styles.metaText}>{formatEventDate(item.date)}</Text>
          {item.time ? (
            <>
              <Text style={styles.metaDot}>•</Text>
              <Text style={styles.metaText}>{item.time}</Text>
            </>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.textMuted} />
          <Text style={styles.metaText} numberOfLines={1}>
            {item.venue}, {item.city || ''}
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.viewDetailsBtn}
            onPress={() => navigation.navigate('EventDetail', { id: item._id })}
          >
            <Text style={styles.viewDetailsText}>View Details</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mapActionBtn}
            onPress={() => navigation.navigate('VenueMap', { eventId: item._id, eventName: item.name })}
          >
            <MaterialIcons name="map" size={16} color="#fff" />
            <Text style={styles.mapActionText}>Map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Events</Text>
        <Text style={styles.headerSubtitle}>
          {events.length} event{events.length === 1 ? '' : 's'} found
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Filter by name, tags, venue..."
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category Horizontal Filter */}
      <View style={styles.filterSection}>
        <FlatList
          data={EVENT_TYPES}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedType === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedType(item)}
            >
              <Text
                style={[
                  styles.filterText,
                  selectedType === item && styles.filterTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* City Horizontal Filter */}
      <View style={styles.filterSection}>
        <FlatList
          data={CITIES}
          keyExtractor={(item) => `city-${item}`}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.cityChip,
                selectedCity === item && styles.cityChipActive,
              ]}
              onPress={() => setSelectedCity(item)}
            >
              <Text
                style={[
                  styles.cityText,
                  selectedCity === item && styles.cityTextActive,
                ]}
              >
                {item === 'All' ? 'All Cities' : item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading events...</Text>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEvent}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Ionicons name="calendar-outline" size={54} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching events</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your category or city filters
              </Text>
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  filterSection: {
    marginBottom: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  cityChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cityChipActive: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  cityText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  cityTextActive: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  eventImage: {
    width: '100%',
    height: 160,
  },
  eventInfo: {
    padding: 14,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 8, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  eventName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  metaDot: {
    color: colors.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  viewDetailsBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  mapActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },
  mapActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyWrap: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
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
