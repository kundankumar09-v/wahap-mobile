import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../../theme/colors';
import eventsApi from '../../api/eventsApi';

const CATEGORIES = [
  'Music Concerts',
  'Food Festivals',
  'Tech & Hackathons',
  'Workshops',
  'Comedy Shows',
  'Cultural & Traditional',
  'Art & Exhibitions',
  'Sports & Fitness',
];

export default function AdminCreateEventScreen({ navigation }) {
  const [name, setName] = useState('');
  const [type, setType] = useState(CATEGORIES[0]);
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [time, setTime] = useState('');
  const [venue, setVenue] = useState('');
  const [city, setCity] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  // Image assets
  const [eventImage, setEventImage] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);
  const [layoutImage, setLayoutImage] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  const pickImage = async (setter) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setter(result.assets[0]);
      }
    } catch (e) {
      Alert.alert('Image Picker Error', 'Could not open photo library.');
    }
  };

  const handleCreate = async () => {
    if (!name.trim() || !venue.trim() || !date.trim()) {
      Alert.alert('Validation Error', 'Event Name, Venue, and Date are required.');
      return;
    }

    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('type', type);
      formData.append('date', date.trim());
      if (endDate.trim()) formData.append('endDate', endDate.trim());
      if (time.trim()) formData.append('time', time.trim());
      formData.append('venue', venue.trim());
      if (city.trim()) formData.append('city', city.trim());
      if (ticketPrice.trim()) formData.append('ticketPrice', ticketPrice.trim());
      if (capacity.trim()) formData.append('capacity', capacity.trim());
      if (description.trim()) formData.append('description', description.trim());

      if (eventImage) {
        const filename = eventImage.uri.split('/').pop() || 'event.jpg';
        formData.append('eventImage', {
          uri: eventImage.uri,
          name: filename,
          type: 'image/jpeg',
        });
      }

      if (bannerImage) {
        const filename = bannerImage.uri.split('/').pop() || 'banner.jpg';
        formData.append('bannerImage', {
          uri: bannerImage.uri,
          name: filename,
          type: 'image/jpeg',
        });
      }

      if (layoutImage) {
        const filename = layoutImage.uri.split('/').pop() || 'layout.jpg';
        formData.append('layoutImage', {
          uri: layoutImage.uri,
          name: filename,
          type: 'image/jpeg',
        });
      }

      await eventsApi.createEvent(formData);
      Alert.alert('Success', 'Event created successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error('Create event failed', err);
      Alert.alert('Error', 'Failed to create event. Make sure server is reachable.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create New Event</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Event Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hyderabad Music Fest 2026"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Category Picker */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.catChip, type === cat && styles.catChipActive]}
                onPress={() => setType(cat)}
              >
                <Text style={[styles.catText, type === cat && styles.catTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Dates */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Start Date *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={date}
              onChangeText={setDate}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>End Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textMuted}
              value={endDate}
              onChangeText={setEndDate}
            />
          </View>
        </View>

        {/* Time & Price */}
        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 6:00 PM"
              placeholderTextColor={colors.textMuted}
              value={time}
              onChangeText={setTime}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Ticket Price (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="0 for Free"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={ticketPrice}
              onChangeText={setTicketPrice}
            />
          </View>
        </View>

        {/* Venue & City */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Venue Location *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Hitex Exhibition Center"
            placeholderTextColor={colors.textMuted}
            value={venue}
            onChangeText={setVenue}
          />
        </View>

        <View style={styles.rowFields}>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Hyderabad"
              placeholderTextColor={colors.textMuted}
              value={city}
              onChangeText={setCity}
            />
          </View>
          <View style={[styles.fieldGroup, { flex: 1 }]}>
            <Text style={styles.label}>Max Capacity</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 500"
              placeholderTextColor={colors.textMuted}
              keyboardType="numeric"
              value={capacity}
              onChangeText={setCapacity}
            />
          </View>
        </View>

        {/* Description */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="About this event, line-up, special rules..."
            placeholderTextColor={colors.textMuted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* Media Pickers */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Event Poster Image</Text>
          <TouchableOpacity style={styles.imagePickerBox} onPress={() => pickImage(setEventImage)}>
            {eventImage ? (
              <Image source={{ uri: eventImage.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="image-outline" size={24} color={colors.textMuted} />
                <Text style={styles.imagePickerText}>Select Event Poster</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Hero Banner Image (Optional)</Text>
          <TouchableOpacity style={styles.imagePickerBox} onPress={() => pickImage(setBannerImage)}>
            {bannerImage ? (
              <Image source={{ uri: bannerImage.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="images-outline" size={24} color={colors.textMuted} />
                <Text style={styles.imagePickerText}>Select Wide Banner</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Venue Blueprint Layout (Optional)</Text>
          <TouchableOpacity style={styles.imagePickerBox} onPress={() => pickImage(setLayoutImage)}>
            {layoutImage ? (
              <Image source={{ uri: layoutImage.uri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Ionicons name="map-outline" size={24} color={colors.textMuted} />
                <Text style={styles.imagePickerText}>Select Layout Blueprint</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleCreate}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Publish Event</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    gap: 14,
    paddingBottom: 40,
  },
  fieldGroup: {
    gap: 6,
  },
  rowFields: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  catScroll: {
    gap: 8,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  catChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  catTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  imagePickerBox: {
    height: 120,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  imagePickerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  imagePickerText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
