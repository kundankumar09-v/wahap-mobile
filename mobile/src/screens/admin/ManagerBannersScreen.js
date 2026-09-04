import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import bannersApi from '../../api/bannersApi';
import { resolveImageUrl } from '../../utils/imageUrl';

export default function ManagerBannersScreen({ navigation }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // New banner modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [bannerImage, setBannerImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bannersApi.getBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      Alert.alert('Error', 'Failed to load banners.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.85,
      });

      if (!res.canceled && res.assets && res.assets[0]) {
        setBannerImage(res.assets[0]);
      }
    } catch (e) {
      Alert.alert('Error', 'Could not open image picker.');
    }
  };

  const handleAddBanner = async () => {
    if (!title.trim() || !bannerImage) {
      Alert.alert('Validation Error', 'Title and banner image are required.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('subtitle', subtitle.trim());

      const filename = bannerImage.uri.split('/').pop() || 'banner.jpg';
      formData.append('bannerImage', {
        uri: bannerImage.uri,
        name: filename,
        type: 'image/jpeg',
      });

      await bannersApi.createBanner(formData);
      setShowAddModal(false);
      setTitle('');
      setSubtitle('');
      setBannerImage(null);
      fetchBanners();
    } catch (e) {
      Alert.alert('Error', 'Failed to upload banner.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMoveBanner = async (id, direction) => {
    try {
      await bannersApi.moveBanner(id, direction);
      fetchBanners();
    } catch (e) {
      Alert.alert('Error', 'Could not reorder banner.');
    }
  };

  const handleDeleteBanner = (banner) => {
    Alert.alert(
      'Delete Banner',
      `Delete "${banner.title || 'this banner'}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await bannersApi.deleteBanner(banner._id);
              setBanners((prev) => prev.filter((b) => b._id !== banner._id));
            } catch (e) {
              Alert.alert('Error', 'Failed to delete banner.');
            }
          },
        },
      ]
    );
  };

  const handleResetBanners = () => {
    Alert.alert(
      'Reset Banners',
      'Reset all banners to default sample carousel?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              await bannersApi.resetBanners();
              fetchBanners();
            } catch (e) {
              Alert.alert('Error', 'Failed to reset banners.');
            }
          },
        },
      ]
    );
  };

  const renderBannerItem = ({ item, index }) => (
    <View style={styles.bannerCard}>
      <Image
        source={{ uri: resolveImageUrl(item.imageUrl || item.image) }}
        style={styles.bannerImg}
        resizeMode="cover"
      />
      <View style={styles.bannerDetails}>
        <Text style={styles.bannerTitleText} numberOfLines={1}>
          {item.title || 'Untitled Banner'}
        </Text>
        {item.subtitle ? (
          <Text style={styles.bannerSubText} numberOfLines={1}>
            {item.subtitle}
          </Text>
        ) : null}

        <View style={styles.bannerControls}>
          <View style={styles.orderControls}>
            <TouchableOpacity
              style={[styles.orderBtn, index === 0 && styles.orderBtnDisabled]}
              disabled={index === 0}
              onPress={() => handleMoveBanner(item._id, 'up')}
            >
              <Ionicons name="chevron-up" size={18} color={index === 0 ? colors.textMuted : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.orderBtn, index === banners.length - 1 && styles.orderBtnDisabled]}
              disabled={index === banners.length - 1}
              onPress={() => handleMoveBanner(item._id, 'down')}
            >
              <Ionicons name="chevron-down" size={18} color={index === banners.length - 1 ? colors.textMuted : colors.text} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteBanner(item)}
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Hero Banners</Text>
      </View>

      {/* Action Row */}
      <View style={styles.topActions}>
        <TouchableOpacity
          style={styles.addBannerBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.addBannerText}>Upload Banner</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.resetBtn} onPress={handleResetBanners}>
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={styles.resetText}>Reset Defaults</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading banners...</Text>
        </View>
      ) : (
        <FlatList
          data={banners}
          renderItem={renderBannerItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No Hero Banners</Text>
              <Text style={styles.emptySubtitle}>Upload a wide 16:9 banner to display on Home screen.</Text>
            </View>
          }
        />
      )}

      {/* Add Banner Modal */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Upload Hero Banner</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Banner Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Grand Music Fiesta 2026"
                placeholderTextColor={colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Subtitle / Tagline</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Live at Hyderabad Stadium"
                placeholderTextColor={colors.textMuted}
                value={subtitle}
                onChangeText={setSubtitle}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Banner Image * (16:9)</Text>
              <TouchableOpacity style={styles.imgPickerBox} onPress={pickImage}>
                {bannerImage ? (
                  <Image source={{ uri: bannerImage.uri }} style={styles.previewImage} />
                ) : (
                  <View style={styles.pickerPlaceholder}>
                    <Ionicons name="cloud-upload-outline" size={28} color={colors.textMuted} />
                    <Text style={styles.pickerText}>Select Banner Picture</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.uploadSubmitBtn}
              onPress={handleAddBanner}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.uploadSubmitText}>Upload Banner</Text>
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
    gap: 12,
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
  },
  addBannerBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  addBannerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  resetBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    paddingVertical: 12,
    borderRadius: 12,
  },
  resetText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  listContent: {
    padding: 16,
    gap: 14,
  },
  bannerCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  bannerImg: {
    width: '100%',
    height: 130,
  },
  bannerDetails: {
    padding: 14,
  },
  bannerTitleText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  bannerSubText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  bannerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceBorder,
  },
  orderControls: {
    flexDirection: 'row',
    gap: 8,
  },
  orderBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderBtnDisabled: {
    opacity: 0.4,
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
    textAlign: 'center',
    paddingHorizontal: 20,
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
  imgPickerBox: {
    height: 120,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  pickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  pickerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  uploadSubmitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  uploadSubmitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
