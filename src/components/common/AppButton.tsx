import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'action' | 'success' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

const AppButton: React.FC<AppButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false, 
  loading = false,
  style = {}
}) => {
  const containerStyle = [
    styles.button,
    styles[variant],
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    variant === 'ghost' && styles.ghostText, // Only apply ghostText if variant is 'ghost'
  ];

  const loaderColor = variant === 'ghost' ? COLORS.primary : COLORS.white;

  return (
    <TouchableOpacity onPress={onPress} style={containerStyle} disabled={disabled || loading}>
      {loading ? (
        <ActivityIndicator color={loaderColor} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginVertical: 5,
  },
  text: {
    fontSize: FONT_SIZES.body,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  // Variants
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  danger: {
    backgroundColor: COLORS.danger,
  },
  action: {
    backgroundColor: COLORS.action,
  },
  success: {
    backgroundColor: COLORS.success,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  // Text variants
  ghostText: {
    color: COLORS.primary,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default AppButton;
