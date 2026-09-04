import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import stallsApi from '../../api/stallsApi';
import { STALL_TYPES, snapToCorridor } from '../../utils/routeMath';
import { resolveImageUrl } from '../../utils/imageUrl';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_SIZE = SCREEN_WIDTH - 32;

export default function AdminMapEditorScreen({ route, navigation }) {
  const { eventId, eventName, layoutImage } = route.params || {};

  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Stall Placement Dialog
  const [showPlacementModal, setShowPlacementModal] = useState(false);
  const [stallCoords, setStallCoords] = useState({ x: 50, y: 50 });
  const [stallName, setStallName] = useState('');
  const [stallType, setStallType] = useState('stall');
  const [savingStall, setSavingStall] = useState(false);

  const fetchStalls = useCallback(async () => {
    try {
      setLoading(true);
      const data = await stallsApi.getStallsByEvent(eventId);
      setStalls(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load venue stalls.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchStalls();
  }, [fetchStalls]);

  const handleCanvasTap = (evt) => {
    const { locationX, locationY } = evt.nativeEvent;
    // Map click pixel to percentage (0 - 100)
    const rawX = (locationX / MAP_SIZE) * 100;
    const rawY = (locationY / MAP_SIZE) * 100;

    // Corridor snapping
    const snappedX = snapToCorridor(rawX);
    const snappedY = snapToCorridor(rawY);

    setStallCoords({
      x: Math.round(snappedX * 10) / 10,
      y: Math.round(snappedY * 10) / 10,
    });
    setStallName(`Stall ${stalls.length + 1}`);
    setShowPlacementModal(true);
  };

  const handleAddStall = async () => {
    if (!stallName.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for the stall.');
      return;
    }

    try {
      setSavingStall(true);
      await stallsApi.addStall({
        eventId,
        name: stallName.trim(),
        type: stallType,
        x: stallCoords.x,
        y: stallCoords.y,
      });

      setShowPlacementModal(false);
      fetchStalls();
    } catch (e) {
      Alert.alert('Error', 'Failed to add stall to layout.');
    } finally {
      setSavingStall(false);
    }
  };

  const handleDeleteStall = (stall) => {
    Alert.alert(
      'Remove Stall',
      `Delete "${stall.name}" from venue map?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await stallsApi.deleteStall(stall._id);
              setStalls((prev) => prev.filter((s) => s._id !== stall._id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete stall.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            Map Editor: {eventName || 'Venue'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Tap on canvas to place stalls & snap to corridors
          </Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchStalls}>
          <Ionicons name="reload" size={18} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Helper Hint */}
        <View style={styles.hintBanner}>
          <Ionicons name="information-circle-outline" size={18} color={colors.info} />
          <Text style={styles.hintText}>
            Tap anywhere on the grid below to place a stall. Stalls snap automatically to aisle corridors.
          </Text>
        </View>

        {/* 2D Canvas */}
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.mapCanvas, { width: MAP_SIZE, height: MAP_SIZE }]}
          onPress={handleCanvasTap}
        >
          {layoutImage ? (
            <Image
              source={{ uri: resolveImageUrl(layoutImage) }}
              style={styles.layoutImgBg}
              resizeMode="cover"
            />
          ) : null}

          {/* Corridor grid lines */}
          <View style={[styles.corridorH, { top: '37.5%' }]} />
          <View style={[styles.corridorH, { top: '62.5%' }]} />
          <View style={[styles.corridorV, { left: '37.5%' }]} />
          <View style={[styles.corridorV, { left: '62.5%' }]} />

          {/* Rendered Stalls */}
          {stalls.map((stall) => {
            const cfg = STALL_TYPES[(stall.type || 'stall').toLowerCase()] || STALL_TYPES.stall;
            return (
              <View
                key={stall._id}
                style={[
                  styles.markerNode,
                  {
                    left: `${stall.x}%`,
                    top: `${stall.y}%`,
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.markerBadge, { borderColor: cfg.color }]}
                  onPress={() => handleDeleteStall(stall)}
                >
                  <Text style={styles.markerEmoji}>{cfg.emoji}</Text>
                  <View style={styles.deleteBadge}>
                    <Ionicons name="close" size={8} color="#fff" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.markerLabel} numberOfLines={1}>
                  {stall.name}
                </Text>
              </View>
            );
          })}
        </TouchableOpacity>

        {/* Existing Stalls List */}
        <View style={styles.stallsListSection}>
          <Text style={styles.stallsListTitle}>
            Configured Stalls ({stalls.length})
          </Text>
          {loading ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : stalls.length === 0 ? (
            <Text style={styles.noStallsText}>
              No stalls placed yet. Tap the grid above to add your first stall!
            </Text>
          ) : (
            stalls.map((s) => {
              const cfg = STALL_TYPES[(s.type || 'stall').toLowerCase()] || STALL_TYPES.stall;
              return (
                <View key={s._id} style={styles.stallListItem}>
                  <View style={styles.stallListLeft}>
                    <Text style={styles.stallListEmoji}>{cfg.emoji}</Text>
                    <View>
                      <Text style={styles.stallListName}>{s.name}</Text>
                      <Text style={styles.stallListCoords}>
                        {cfg.label} • Position: ({s.x}%, {s.y}%)
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.stallDeleteBtn}
                    onPress={() => handleDeleteStall(s)}
                  >
                    <Ionicons name="trash-outline" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Placement Modal */}
      <Modal visible={showPlacementModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Stall to Layout</Text>
              <TouchableOpacity onPress={() => setShowPlacementModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalCoordsText}>
              Snapped Grid Position: X: {stallCoords.x}%, Y: {stallCoords.y}%
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Stall / Area Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Craft Corner, Main Stage, Food 01"
                placeholderTextColor={colors.textMuted}
                value={stallName}
                onChangeText={setStallName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Type & Category</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                {Object.entries(STALL_TYPES).map(([typeKey, cfg]) => (
                  <TouchableOpacity
                    key={typeKey}
                    style={[
                      styles.typeChip,
                      stallType === typeKey && styles.typeChipActive,
                    ]}
                    onPress={() => setStallType(typeKey)}
                  >
                    <Text style={styles.typeEmoji}>{cfg.emoji}</Text>
                    <Text
                      style={[
                        styles.typeText,
                        stallType === typeKey && styles.typeTextActive,
                      ]}
                    >
                      {cfg.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity
              style={styles.saveStallBtn}
              onPress={handleAddStall}
              disabled={savingStall}
            >
              {savingStall ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveStallText}>Place Stall</Text>
              )}
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 11,
    color: colors.textMuted,
  },
  refreshBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 16,
  },
  hintBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginBottom: 14,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    color: colors.info,
    lineHeight: 16,
  },
  mapCanvas: {
    backgroundColor: '#0c1220',
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'center',
  },
  layoutImgBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.35,
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
  markerNode: {
    position: 'absolute',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    alignItems: 'center',
    zIndex: 10,
  },
  markerBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1e293b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    position: 'relative',
  },
  markerEmoji: {
    fontSize: 13,
  },
  deleteBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#ffffff',
    backgroundColor: 'rgba(7, 9, 14, 0.8)',
    paddingHorizontal: 3,
    borderRadius: 3,
    marginTop: 2,
    maxWidth: 50,
  },
  stallsListSection: {
    marginTop: 20,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  stallsListTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  noStallsText: {
    fontSize: 12,
    color: colors.textMuted,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  stallListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceBorder,
  },
  stallListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stallListEmoji: {
    fontSize: 18,
  },
  stallListName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  stallListCoords: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  stallDeleteBtn: {
    padding: 8,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  modalCoordsText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: '600',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.background,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  typeScroll: {
    gap: 8,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeEmoji: {
    fontSize: 14,
  },
  typeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  typeTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  saveStallBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveStallText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
