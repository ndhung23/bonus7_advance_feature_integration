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
import {
  getCustomApiKey,
  hasEnvApiKey,
  saveStoredApiKey,
  clearCustomApiKey,
} from '../services/storageService';

export default function ApiKeyModal({ visible, onClose, onSaved }) {
  const [apiKey, setApiKey] = useState('');
  const [hasEnv, setHasEnv] = useState(false);
  const [hasCustom, setHasCustom] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (visible) {
      loadKeyStatus();
    }
  }, [visible]);

  const loadKeyStatus = async () => {
    const isEnvPresent = hasEnvApiKey();
    const customKey = await getCustomApiKey();
    setHasEnv(isEnvPresent);
    setHasCustom(Boolean(customKey));
    setApiKey(customKey ? customKey : '');
    setShowKey(false);
  };

  const handleSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      Alert.alert('Lưu ý', 'Vui lòng nhập API Key trước khi lưu.');
      return;
    }

    const success = await saveStoredApiKey(trimmed);
    if (success) {
      Alert.alert('Thành công', 'Đã lưu Gemini API Key tuỳ chỉnh an toàn.');
      setHasCustom(true);
      if (onSaved) onSaved(trimmed);
      onClose();
    } else {
      Alert.alert('Lỗi', 'Không thể lưu API Key vào bộ nhớ.');
    }
  };

  const handleResetToEnv = async () => {
    await clearCustomApiKey();
    setApiKey('');
    setHasCustom(false);
    Alert.alert('Thông báo', 'Đã xoá key tuỳ chỉnh, ứng dụng sẽ ưu tiên dùng key từ .env.');
    if (onSaved) onSaved(null);
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
            <Text style={styles.title}>🔒 Cấu hình Gemini AI Key</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          {hasEnv && !hasCustom && (
            <View style={styles.statusBoxActive}>
              <Text style={styles.statusTitle}>🟢 Đang sử dụng Key từ file .env</Text>
              <Text style={styles.statusDesc}>
                Key của bạn đã được bảo vệ tự động và ẩn khỏi giao diện.
              </Text>
            </View>
          )}

          {hasCustom && (
            <View style={styles.statusBoxCustom}>
              <Text style={styles.statusTitle}>🟣 Đang sử dụng Key tuỳ chỉnh (ghi đè)</Text>
              <TouchableOpacity onPress={handleResetToEnv} style={styles.resetBtn}>
                <Text style={styles.resetBtnText}>↩ Xoá key tuỳ chỉnh, dùng lại .env</Text>
              </TouchableOpacity>
            </View>
          )}

          {!hasEnv && !hasCustom && (
            <View style={styles.statusBoxMissing}>
              <Text style={styles.statusTitleMissing}>⚠️ Chưa có Gemini API Key</Text>
              <Text style={styles.statusDesc}>
                Vui lòng nhập key hoặc thêm vào file .env để Gemini AI hoạt động.
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={openAiStudio} style={styles.linkButton}>
            <Text style={styles.linkButtonText}>🌐 Nhận Key miễn phí tại Google AI Studio</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>
            {hasEnv ? 'Ghi đè bằng Key khác (nếu muốn):' : 'Nhập Gemini API Key:'}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Nhập key AIzaSy... (được ẩn an toàn)"
              placeholderTextColor={COLORS.textMuted}
              value={apiKey}
              onChangeText={setApiKey}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showKey}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowKey(!showKey)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.eyeText}>{showKey ? '🙈' : '👁️'}</Text>
            </TouchableOpacity>
          </View>

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
    marginBottom: SPACING.md,
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
  statusBoxActive: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusBoxCustom: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusBoxMissing: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: SPACING.sm + 4,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
  },
  statusTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  statusTitleMissing: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  statusDesc: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  resetBtn: {
    marginTop: 6,
  },
  resetBtnText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '600',
    textDecorationLine: 'underline',
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
    marginBottom: SPACING.lg,
  },
  input: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeText: {
    fontSize: 16,
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
