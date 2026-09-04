import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';
import { resolveImageUrl, formatEventDate } from '../../utils/imageUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EventDetailScreen({ route, navigation }) {
  const { id } = route.params;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getEventById(id);
      setEvent(data);
    } catch (err) {
      console.error('Failed to get event details', err);
      setError('Unable to load event details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onShare = async () => {
    if (!event) return;
    try {
      await Share.share({
        message: `Check out ${event.name} on WAHAP! Happening at ${event.venue} on ${formatEventDate(event.date)}.`,
      });
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading event details...</Text>
      </SafeAreaView>
    );
  }

  if (error || !event) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={54} color={colors.danger} />
        <Text style={styles.errorText}>{error || 'Event not found'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Banner with Floating Buttons */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: resolveImageUrl(event.bannerImage || event.eventImage) }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.imageGradientOverlay} />

          <SafeAreaView style={styles.floatingNav} edges={['top']}>
            <TouchableOpacity style={styles.iconCircle} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconCircle} onPress={onShare}>
              <Ionicons name="share-social-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>

          <View style={styles.badgeOverlay}>
            <View style={styles.categoryChip}>
              <Text style={styles.categoryText}>{event.type || 'Event'}</Text>
            </View>
            <View style={styles.priceChip}>
              <Text style={styles.priceText}>
                {event.ticketPrice ? `₹${event.ticketPrice}` : 'Free Entry'}
              </Text>
            </View>
          </View>
        </View>

        {/* Content Body */}
        <View style={styles.body}>
          <Text style={styles.title}>{event.name}</Text>

          {/* Quick Info Grid */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="calendar" size={18} color={colors.primaryLight} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>
                  {formatEventDate(event.date)}
                  {event.time ? ` at ${event.time}` : ''}
                </Text>
                {event.endDate ? (
                  <Text style={styles.infoSubvalue}>
                    Until {formatEventDate(event.endDate)}
                  </Text>
                ) : null}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIconBox}>
                <Ionicons name="location" size={18} color={colors.info} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Venue Location</Text>
                <Text style={styles.infoValue}>{event.venue}</Text>
                <Text style={styles.infoSubvalue}>
                  {event.city || 'Location details in venue map'}
                </Text>
              </View>
            </View>

            {event.capacity ? (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoIconBox}>
                    <Ionicons name="people" size={18} color={colors.success} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Capacity</Text>
                    <Text style={styles.infoValue}>{event.capacity} Attendees</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>

          {/* Interactive Map Banner CTA */}
          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.mapCtaCard}
            onPress={() =>
              navigation.navigate('VenueMap', {
                eventId: event._id,
                eventName: event.name,
                layoutImage: event.layoutImage,
              })
            }
          >
            <View style={styles.mapCtaLeft}>
              <View style={styles.mapIconBig}>
                <MaterialIcons name="map" size={26} color="#fff" />
              </View>
              <View>
                <Text style={styles.mapCtaTitle}>Interactive Venue Map</Text>
                <Text style={styles.mapCtaSubtitle}>
                  Explore stalls, stages, restrooms & routes
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color={colors.primaryLight} />
          </TouchableOpacity>

          {/* About Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this event</Text>
            <Text style={styles.description}>
              {event.description || 'No description provided for this event.'}
            </Text>
          </View>

          {/* Event QR Verification Code */}
          <View style={styles.qrSection}>
            <View style={styles.qrHeader}>
              <Ionicons name="qr-code" size={20} color={colors.accent} />
              <Text style={styles.qrTitle}>Event Fast-Pass ID</Text>
            </View>
            <Text style={styles.qrSubtitle}>
              Present this event code or scan inside the venue for quick stall navigation.
            </Text>
            <View style={styles.qrCodeBadge}>
              <Text style={styles.qrCodeValue}>{event._id}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom Action Bar */}
      <SafeAreaView edges={['bottom']} style={styles.fixedBottomBar}>
        <TouchableOpacity
          style={styles.openMapMainBtn}
          onPress={() =>
            navigation.navigate('VenueMap', {
              eventId: event._id,
              eventName: event.name,
              layoutImage: event.layoutImage,
            })
          }
        >
          <MaterialIcons name="navigation" size={20} color="#fff" />
          <Text style={styles.openMapText}>Open Venue Map & Stalls</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  backButton: {
    marginTop: 16,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: colors.text,
    fontWeight: '600',
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: 280,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  imageGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 9, 14, 0.4)',
  },
  floatingNav: {
    position: 'absolute',
    top: 8,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  categoryChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  categoryText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  priceChip: {
    backgroundColor: 'rgba(7, 9, 14, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  priceText: {
    color: colors.success,
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 16,
    lineHeight: 28,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  infoSubvalue: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: 12,
  },
  mapCtaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 8, 68, 0.1)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 8, 68, 0.3)',
    marginBottom: 20,
  },
  mapCtaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  mapIconBig: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapCtaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  mapCtaSubtitle: {
    fontSize: 12,
    color: colors.accent,
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  qrSection: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    marginBottom: 20,
  },
  qrHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  qrTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  qrSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  qrCodeBadge: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
  },
  qrCodeValue: {
    fontSize: 13,
    color: colors.primaryLight,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  fixedBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  openMapMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  openMapText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
});
