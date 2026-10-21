import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
} from 'react-native';
import { COLORS, SPACING } from '../styles/theme';
import PhotoCard from '../components/PhotoCard';
import EmptyState from '../components/EmptyState';

export default function GalleryScreen({
  photos,
  refreshing,
  onRefresh,
  onPhotoPress,
  onPhotoDelete,
  onTakePhoto,
  onPickPhoto,
}) {
  if (photos.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState onTakePhoto={onTakePhoto} onPickPhoto={onPickPhoto} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PhotoCard
            photo={item}
            onPress={onPhotoPress}
            onDelete={onPhotoDelete}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: 100, // Space for floating action buttons
  },
});
