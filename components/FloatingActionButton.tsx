import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Video as LucideIcon } from 'lucide-react-native';

interface FloatingActionButtonProps {
  icon: LucideIcon;
  onPress: () => void;
  style?: ViewStyle;
  size?: 'small' | 'large';
}

export default function FloatingActionButton({
  icon: Icon,
  onPress,
  style,
  size = 'small',
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.fab,
        size === 'large' ? styles.largeFab : styles.smallFab,
        style,
      ]}
      onPress={onPress}
    >
      <Icon size={size === 'large' ? 24 : 20} color="#fff" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  smallFab: {
    width: 48,
    height: 48,
  },
  largeFab: {
    width: 56,
    height: 56,
  },
});