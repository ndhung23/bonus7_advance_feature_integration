import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
} from 'react-native';
import { COLORS, SPACING, RADIUS } from '../styles/theme';
import { getStoredApiKey, saveStoredApiKey } from '../services/storageService';

export default function ApiKeyModal({ visible, onClose, onSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (visible) {
      loadKey();
    }
  }, [visible]);

  const loadKey = async () => {
    const key = await getStoredApiKey();
    setApiKey(key || '');
    setIsSaved(!!key);
  };

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Alert.alert('Lưu ý', 'Vui lòng nhập API Key trước khi lưu.');
      return;
    }

    const success = await saveStoredApiKey(trimmed);
    if (success) {
      Alert.alert('Thành công', 'Đã lưu Gemini API Key vào máy của bạn.');
      setIsSaved(true);
      if (onSaved) onSaved(trimmed);
      onClose();
    } else {
      Alert.alert('Lỗi', 'Không thể lưu API Key vào bộ nhớ.');
    }
  };

  const openAiStudio = () => {
    Linking.openURL('https://aistudio.google.com/app/apikey');
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.header}>
            <Text style={styles.title}>🔑 Cấu hình Gemini AI Key</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.guideText}>
            Gemini AI cần API Key để phân tích và tạo mô tả cho ảnh đã chụp.
            Bạn có thể lấy key hoàn toàn miễn phí tại Google AI Studio.
          </Text>

          <TouchableOpacity onPress={openAiStudio} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>🌐 Mở Google AI Studio để lấy Key</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Nhập Google Gemini API Key:</Text>
          <TextInput
            style={styles.input}
            placeholder="AIzaSy..."
            placeholderTextColor={COLORS.textMuted}
            value={apiKey}
            onChangeText={setApiKey}
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.cancelBtn]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Đóng</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.saveBtn]}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>Lưu Key</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 16,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  guideText: {
    fontSize: 13,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginBottom: SPACING.sm,
  },
  linkButton: {
    marginBottom: SPACING.md,
  },
  linkButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  actionBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: COLORS.background,
  },
  cancelBtnText: {
    color: COLORS.textMuted,
    fontWeight: '600',
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
