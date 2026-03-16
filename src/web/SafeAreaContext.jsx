import React from 'react';
import { View } from 'react-native-web';

export const SafeAreaProvider = ({ children }) => {
  return <View style={{ flex: 1 }}>{children}</View>;
};

export const SafeAreaView = ({ children, style }) => {
  return <View style={[{ flex: 1 }, style]}>{children}</View>;
};

export const useSafeAreaInsets = () => ({
  top: 0,
  bottom: 0,
  left: 0,
  right: 0,
});
