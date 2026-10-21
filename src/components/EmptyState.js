import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';

export default function EmptyState({ onTakePhoto, onPickPhoto }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📷</Text>
      <Text style={styles.title}>Chưa có bức ảnh nào</Text>
      <Text style={styles.subtitle}>
        Hãy chụp một bức ảnh mới hoặc chọn từ thư viện. Ứng dụng sẽ tự động ghi lại toạ độ GPS trên Google Maps và dùng Gemini AI để miêu tả bức ảnh!
      </Text>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={onTakePhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>📸 Chụp ảnh mới</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onPickPhoto}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>🖼️ Chọn từ thư viện</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    marginTop: 40,
  },
  icon: {
    fontSize: 56,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  buttonGroup: {
    width: '100%',
    gap: SPACING.sm,
  },
  button: {
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '500',
  },
});

