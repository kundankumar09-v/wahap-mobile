import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';
import bannersApi from '../../api/bannersApi';
import { resolveImageUrl, formatEventDate } from '../../utils/imageUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BANNER_WIDTH = SCREEN_WIDTH - 32;

const CITIES = ['All', 'Hyderabad', 'Bengaluru', 'Mumbai', 'Delhi', 'Pune', 'Chennai'];

const EVENT_TYPES = [
  'Music Concerts',
  'Food Festivals',
  'Tech & Hackathons',
  'Workshops',
  'Comedy Shows',
  'Cultural & Traditional',
  'Art & Exhibitions',
  'Sports & Fitness',
];

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      const [eventsData, bannersData] = await Promise.all([
        eventsApi.getEvents({ city: selectedCity, query: searchQuery }),
        bannersApi.getBanners().catch(() => []),
      ]);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setBanners(Array.isArray(bannersData) ? bannersData : []);
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCity, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Group events by category
  const getEventsByCategory = (category) => {
    return events.filter(
      (e) => (e.type || '').toLowerCase() === category.toLowerCase()
    );
  };

  const renderBanner = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.bannerItem}
      onPress={() => {
        if (item.eventId) {
          navigation.navigate('EventDetail', { id: item.eventId });
        }
      }}
    >
      <Image
        source={{ uri: resolveImageUrl(item.imageUrl || item.image) }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
      <View style={styles.bannerOverlay}>
        <Text style={styles.bannerTitle} numberOfLines={1}>
          {item.title || 'Featured Event'}
        </Text>
        {item.subtitle ? (
          <Text style={styles.bannerSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  const renderEventCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetail', { id: item._id })}
    >
      <Image
        source={{ uri: resolveImageUrl(item.eventImage) }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardCategoryBadge}>
        <Text style={styles.cardCategoryText}>{item.type || 'Event'}</Text>
      </View>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.cardInfoRow}>
          <Ionicons name="calendar-outline" size={13} color={colors.primaryLight} />
          <Text style={styles.cardInfoText}>{formatEventDate(item.date)}</Text>
        </View>
        <View style={styles.cardInfoRow}>
          <Ionicons name="location-outline" size={13} color={colors.textMuted} />
          <Text style={styles.cardInfoText} numberOfLines={1}>
            {item.venue || item.city || 'Venue TBA'}
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.cardPrice}>
            {item.ticketPrice ? `₹${item.ticketPrice}` : 'Free Entry'}
          </Text>
          <View style={styles.mapPill}>
            <MaterialIcons name="map" size={12} color={colors.primary} />
            <Text style={styles.mapPillText}>Map</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* App Top Bar */}
      <View style={styles.topBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogo}>
            <Ionicons name="sparkles" size={18} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>WAHAP</Text>
            <Text style={styles.brandSubtitle}>Events & Venue Navigation</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.qrHeaderBtn}
          onPress={() => navigation.navigate('QrTab')}
        >
          <Ionicons name="qr-code-outline" size={20} color={colors.primaryLight} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} style={styles.searchIcon} />
          <TextInput
            placeholder="Search events, venues, performers..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* City Filter Pills */}
        <View style={styles.citiesWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.citiesScroll}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityChip,
                  selectedCity === city && styles.cityChipActive,
                ]}
                onPress={() => setSelectedCity(city)}
              >
                <Text
                  style={[
                    styles.cityText,
                    selectedCity === city && styles.cityTextActive,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Hero Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <FlatList
              data={banners}
              renderItem={renderBanner}
              keyExtractor={(item, index) => item._id || index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH);
                setActiveBannerIndex(index);
              }}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
            {banners.length > 1 && (
              <View style={styles.dotsWrap}>
                {banners.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.dot,
                      activeBannerIndex === i && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}

        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Discovering live events...</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-clear-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptySubtitle}>
              Try changing the city or search terms.
            </Text>
          </View>
        ) : (
          /* Category Shelves */
          EVENT_TYPES.map((category) => {
            const catEvents = getEventsByCategory(category);
            if (catEvents.length === 0) return null;

            return (
              <View key={category} style={styles.shelfSection}>
                <View style={styles.shelfHeader}>
                  <Text style={styles.shelfTitle}>{category}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('EventsTab', {
                        screen: 'EventList',
                        params: { type: category, city: selectedCity },
                      })
                    }
                  >
                    <Text style={styles.viewAllText}>View all ({catEvents.length})</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  data={catEvents.slice(0, 8)}
                  renderItem={renderEventCard}
                  keyExtractor={(item) => item._id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.shelfScroll}
                />
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogo: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '500',
  },
  qrHeaderBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 6,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
  },
  citiesWrap: {
    marginBottom: 14,
  },
  citiesScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  cityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cityChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cityText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
  },
  cityTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  bannerSection: {
    marginBottom: 20,
  },
  bannerItem: {
    width: BANNER_WIDTH,
    height: 170,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    marginRight: 12,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  dotsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.textMuted,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },
  shelfSection: {
    marginBottom: 22,
  },
  shelfHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  shelfTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  viewAllText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  shelfScroll: {
    paddingHorizontal: 16,
    gap: 14,
  },
  eventCard: {
    width: 210,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  cardImage: {
    width: '100%',
    height: 115,
  },
  cardCategoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(7, 9, 14, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.accent,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cardInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.success,
  },
  mapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 8, 68, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mapPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
  },
  loaderContainer: {
    paddingVertical: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
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
    textAlign: 'center',
  },
});
