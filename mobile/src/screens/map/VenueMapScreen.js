import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../../theme/colors';
import stallsApi from '../../api/stallsApi';
import visitsApi from '../../api/visitsApi';
import { STALL_TYPES, buildRoutes } from '../../utils/routeMath';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_SIZE = SCREEN_WIDTH - 32;

export default function VenueMapScreen({ route, navigation }) {
  const { eventId, eventName, layoutImage } = route.params || {};
  const { user } = useAuth();

  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visitedIds, setVisitedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('all');

  // Routing state
  const [startStall, setStartStall] = useState(null);
  const [endStall, setEndStall] = useState(null);

  // Selected stall modal
  const [selectedStall, setSelectedStall] = useState(null);
  const [stallFeedback, setStallFeedback] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Feedback form inside modal
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load visited stalls from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(`vm_visited_${eventId}`);
        if (stored) {
          setVisitedIds(new Set(JSON.parse(stored)));
        }
      } catch (e) {
        // ignore
      }
    })();
  }, [eventId]);

  const fetchStalls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stallsApi.getStallsByEvent(eventId);
      setStalls(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load stalls', err);
      Alert.alert('Error', 'Unable to load venue layout stalls.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStalls();
  }, [fetchStalls]);

  // Load feedback when stall is opened
  const openStallModal = async (stall) => {
    setSelectedStall(stall);
    setShowFeedbackForm(false);
    setRating(5);
    setFeedbackText('');
    try {
      setLoadingFeedback(true);
      const res = await visitsApi.getStallFeedback(stall._id);
      setStallFeedback(Array.isArray(res) ? res : []);
    } catch (e) {
      setStallFeedback([]);
    } finally {
      setLoadingFeedback(false);
    }
  };

  const markStallVisited = async (stallId) => {
    const next = new Set(visitedIds);
    next.add(stallId);
    setVisitedIds(next);
    await AsyncStorage.setItem(
      `vm_visited_${eventId}`,
      JSON.stringify(Array.from(next))
    );
  };

  const submitFeedback = async () => {
    if (!selectedStall) return;
    try {
      setSubmittingFeedback(true);
      const username = user?.name || 'Guest Explorer';
      await visitsApi.recordVisit({
        username,
        stallId: selectedStall._id,
        eventId,
        feedback: feedbackText,
        rating,
      });

      await markStallVisited(selectedStall._id);
      Alert.alert('Success', 'Thank you for your visit feedback!');
      setShowFeedbackForm(false);
      // Refresh feedback
      const res = await visitsApi.getStallFeedback(selectedStall._id);
      setStallFeedback(Array.isArray(res) ? res : []);
    } catch (e) {
      Alert.alert('Error', 'Could not record feedback. Please try again.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Route paths
  const activeRoutes = useMemo(() => {
    if (!startStall || !endStall) return [];
    return buildRoutes(startStall, endStall);
  }, [startStall, endStall]);

  const filteredStalls = useMemo(() => {
    if (filterType === 'all') return stalls;
    return stalls.filter((s) => (s.type || '').toLowerCase() === filterType.toLowerCase());
  }, [stalls, filterType]);

  const visitedCount = visitedIds.size;
  const totalCount = stalls.length;
  const progressPercent = totalCount > 0 ? (visitedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.topBarInfo}>
          <Text style={styles.venueTitle} numberOfLines={1}>
            {eventName || 'Venue Map'}
          </Text>
          <Text style={styles.venueSubtitle}>Interactive Floor Navigation</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchStalls}>
          <Ionicons name="reload" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress & Route Bar */}
      <View style={styles.statusBar}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            Explored: {visitedCount} / {totalCount} Stalls
          </Text>
          <Text style={styles.progressPct}>{Math.round(progressPercent)}%</Text>
        </View>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>

        {/* Active Route banner */}
        {startStall && endStall ? (
          <View style={styles.routeBanner}>
            <View style={styles.routeBannerTextWrap}>
              <Text style={styles.routeBannerTitle}>Active Route</Text>
              <Text style={styles.routeBannerRoute}>
                {startStall.name} ➔ {endStall.name}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.clearRouteBtn}
              onPress={() => {
                setStartStall(null);
                setEndStall(null);
              }}
            >
              <Text style={styles.clearRouteText}>Clear</Text>
            </TouchableOpacity>
          </View>
        ) : startStall ? (
          <View style={styles.routeBanner}>
            <Text style={styles.routeBannerPrompt}>
              Start set: {startStall.name}. Tap any stall to set Destination!
            </Text>
          </View>
        ) : null}
      </View>

      {/* Filter Category Chips */}
      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.chip, filterType === 'all' && styles.chipActive]}
            onPress={() => setFilterType('all')}
          >
            <Text style={[styles.chipText, filterType === 'all' && styles.chipTextActive]}>
              All ({stalls.length})
            </Text>
          </TouchableOpacity>
          {Object.entries(STALL_TYPES).map(([typeKey, cfg]) => {
            const count = stalls.filter((s) => (s.type || '').toLowerCase() === typeKey).length;
            if (count === 0) return null;
            return (
              <TouchableOpacity
                key={typeKey}
                style={[styles.chip, filterType === typeKey && styles.chipActive]}
                onPress={() => setFilterType(typeKey)}
              >
                <Text style={styles.chipEmoji}>{cfg.emoji}</Text>
                <Text style={[styles.chipText, filterType === typeKey && styles.chipTextActive]}>
                  {cfg.label} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Rendering venue layout...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.mapScroll} maximumZoomScale={2.5} minimumZoomScale={1}>
          {/* Venue 2D Canvas */}
          <View style={[styles.mapCanvas, { width: MAP_SIZE, height: MAP_SIZE }]}>
            {/* Optional Custom Layout Image or Grid */}
            {layoutImage ? (
              <Image
                source={{ uri: resolveImageUrl(layoutImage) }}
                style={styles.layoutImgBg}
                resizeMode="cover"
              />
            ) : null}

            {/* Procedural Venue Corridors & Grid */}
            <View style={styles.gridOverlay}>
              {/* Main Corridors */}
              <View style={[styles.corridorH, { top: '37.5%' }]} />
              <View style={[styles.corridorH, { top: '62.5%' }]} />
              <View style={[styles.corridorV, { left: '37.5%' }]} />
              <View style={[styles.corridorV, { left: '62.5%' }]} />
              <View style={styles.centerPlaza}>
                <Text style={styles.centerPlazaText}>MAIN PLAZA</Text>
              </View>
            </View>

            {/* Active L-Route Lines */}
            {activeRoutes.length > 0 &&
              activeRoutes[0].map((pt, idx) => {
                if (idx === activeRoutes[0].length - 1) return null;
                const nextPt = activeRoutes[0][idx + 1];
                const isHorizontal = pt.y === nextPt.y;
                const top = Math.min(pt.y, nextPt.y) + '%';
                const left = Math.min(pt.x, nextPt.x) + '%';
                const w = isHorizontal ? `${Math.abs(pt.x - nextPt.x)}%` : 4;
                const h = isHorizontal ? 4 : `${Math.abs(pt.y - nextPt.y)}%`;

                return (
                  <View
                    key={`route-seg-${idx}`}
                    style={[
                      styles.routeSegment,
                      { top, left, width: w, height: h },
                    ]}
                  />
                );
              })}

            {/* Stall Markers */}
            {filteredStalls.map((stall) => {
              const cfg = STALL_TYPES[(stall.type || 'stall').toLowerCase()] || STALL_TYPES.stall;
              const isVisited = visitedIds.has(stall._id);
              const isStart = startStall?._id === stall._id;
              const isEnd = endStall?._id === stall._id;

              return (
                <TouchableOpacity
                  key={stall._id}
                  activeOpacity={0.8}
                  style={[
                    styles.markerNode,
                    {
                      left: `${stall.x}%`,
                      top: `${stall.y}%`,
                    },
                    isStart && styles.markerStart,
                    isEnd && styles.markerEnd,
                  ]}
                  onPress={() => openStallModal(stall)}
                >
                  <View style={[styles.markerBadge, { borderColor: cfg.color }]}>
                    <Text style={styles.markerEmoji}>{cfg.emoji}</Text>
                    {isVisited && (
                      <View style={styles.visitedTick}>
                        <Ionicons name="checkmark" size={10} color="#fff" />
                      </View>
                    )}
                  </View>
                  <Text style={styles.markerLabel} numberOfLines={1}>
                    {stall.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* Stall Detail & Route Modal */}
      <Modal
        visible={!!selectedStall}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedStall(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            {selectedStall && (
              <>
                <View style={styles.modalHeader}>
                  <View style={styles.modalHeaderLeft}>
                    <Text style={styles.modalEmoji}>
                      {STALL_TYPES[(selectedStall.type || 'stall').toLowerCase()]?.emoji || '🛍️'}
                    </Text>
                    <View>
                      <Text style={styles.modalStallName}>{selectedStall.name}</Text>
                      <Text style={styles.modalStallType}>
                        {STALL_TYPES[(selectedStall.type || 'stall').toLowerCase()]?.label || 'Stall'}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedStall(null)}>
                    <Ionicons name="close" size={24} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Route Actions */}
                <View style={styles.modalRouteActions}>
                  <TouchableOpacity
                    style={[
                      styles.routeBtn,
                      startStall?._id === selectedStall._id && styles.routeBtnActive,
                    ]}
                    onPress={() => {
                      setStartStall(selectedStall);
                      setSelectedStall(null);
                    }}
                  >
                    <Ionicons name="navigate-outline" size={16} color="#fff" />
                    <Text style={styles.routeBtnText}>Set Start Point</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.routeBtn,
                      styles.routeBtnDest,
                      endStall?._id === selectedStall._id && styles.routeBtnActive,
                    ]}
                    onPress={() => {
                      setEndStall(selectedStall);
                      setSelectedStall(null);
                    }}
                  >
                    <MaterialIcons name="flag" size={16} color="#fff" />
                    <Text style={styles.routeBtnText}>Set Destination</Text>
                  </TouchableOpacity>
                </View>

                {/* Rate & Visit Action */}
                <TouchableOpacity
                  style={styles.rateBtn}
                  onPress={() => setShowFeedbackForm(!showFeedbackForm)}
                >
                  <Ionicons name="star" size={16} color={colors.warning} />
                  <Text style={styles.rateBtnText}>
                    {visitedIds.has(selectedStall._id) ? 'Update Feedback & Rating' : 'Mark Visited & Rate'}
                  </Text>
                </TouchableOpacity>

                {/* Feedback Form */}
                {showFeedbackForm ? (
                  <View style={styles.feedbackBox}>
                    <Text style={styles.feedbackPrompt}>Rate your experience (1-5):</Text>
                    <View style={styles.starRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity key={star} onPress={() => setRating(star)}>
                          <Ionicons
                            name={star <= rating ? 'star' : 'star-outline'}
                            size={28}
                            color={colors.warning}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>
                    <TextInput
                      style={styles.feedbackInput}
                      placeholder="Share your thoughts about this stall..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      value={feedbackText}
                      onChangeText={setFeedbackText}
                    />
                    <TouchableOpacity
                      style={styles.submitFeedbackBtn}
                      onPress={submitFeedback}
                      disabled={submittingFeedback}
                    >
                      {submittingFeedback ? (
                        <ActivityIndicator size="small" color="#fff" />
                      ) : (
                        <Text style={styles.submitFeedbackText}>Submit Review</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Recent Reviews List */}
                <Text style={styles.feedbackHeader}>Recent Visitor Feedback</Text>
                {loadingFeedback ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : stallFeedback.length === 0 ? (
                  <Text style={styles.noFeedbackText}>Be the first to leave feedback for this stall!</Text>
                ) : (
                  <ScrollView style={styles.feedbackList} showsVerticalScrollIndicator={false}>
                    {stallFeedback.map((fb, idx) => (
                      <View key={fb._id || idx} style={styles.feedbackItem}>
                        <View style={styles.fbItemTop}>
                          <Text style={styles.fbUser}>{fb.username || 'Attendee'}</Text>
                          <View style={styles.fbStars}>
                            {[...Array(fb.rating || 5)].map((_, i) => (
                              <Ionicons key={i} name="star" size={12} color={colors.warning} />
                            ))}
                          </View>
                        </View>
                        {fb.feedback ? (
                          <Text style={styles.fbText}>{fb.feedback}</Text>
                        ) : null}
                      </View>
                    ))}
                  </ScrollView>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  topBarInfo: {
    flex: 1,
  },
  venueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  venueSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  refreshBtn: {
    padding: 8,
  },
  statusBar: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressPct: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.success,
  },
  routeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 8, 68, 0.12)',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  routeBannerTextWrap: {
    flex: 1,
  },
  routeBannerTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryLight,
    textTransform: 'uppercase',
  },
  routeBannerRoute: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  routeBannerPrompt: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '500',
  },
  clearRouteBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearRouteText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  filterBar: {
    paddingVertical: 8,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipEmoji: {
    fontSize: 13,
  },
  chipText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  mapScroll: {
    padding: 16,
    alignItems: 'center',
  },
  mapCanvas: {
    backgroundColor: '#0c1220',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  layoutImgBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
  },
  gridOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  corridorH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  corridorV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  centerPlaza: {
    position: 'absolute',
    top: '42%',
    left: '42%',
    width: '16%',
    height: '16%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlazaText: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.25)',
    fontWeight: '700',
    letterSpacing: 1,
  },
  routeSegment: {
    position: 'absolute',
    backgroundColor: '#ff0844',
    zIndex: 5,
    borderRadius: 2,
  },
  markerNode: {
    position: 'absolute',
    transform: [{ translateX: -18 }, { translateY: -18 }],
    alignItems: 'center',
    zIndex: 10,
  },
  markerBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  markerEmoji: {
    fontSize: 14,
  },
  markerStart: {
    zIndex: 20,
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.15 }],
  },
  markerEnd: {
    zIndex: 20,
    transform: [{ translateX: -20 }, { translateY: -20 }, { scale: 1.15 }],
  },
  visitedTick: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.success,
    borderRadius: 6,
    width: 12,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(7, 9, 14, 0.75)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
    maxWidth: 60,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 10,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalEmoji: {
    fontSize: 32,
  },
  modalStallName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalStallType: {
    fontSize: 12,
    color: colors.textMuted,
  },
  modalRouteActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  routeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 12,
  },
  routeBtnDest: {
    backgroundColor: colors.info,
  },
  routeBtnActive: {
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  routeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  rateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceLight,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
  },
  rateBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  feedbackBox: {
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 14,
    marginBottom: 14,
  },
  feedbackPrompt: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  starRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  feedbackInput: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: 10,
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  submitFeedbackBtn: {
    backgroundColor: colors.success,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitFeedbackText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  feedbackHeader: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  noFeedbackText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  feedbackList: {
    maxHeight: 140,
  },
  feedbackItem: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },
  fbItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  fbUser: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  fbStars: {
    flexDirection: 'row',
  },
  fbText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
