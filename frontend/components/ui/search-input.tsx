import React from "react";
import { View, TextInput, StyleSheet, type TextInputProps, type ViewStyle } from "react-native";
import { UniversalIcon } from "./universal-icon";

interface SearchInputProps extends TextInputProps {
  containerStyle?: ViewStyle;
  iconSize?: number;
  iconColor?: string;
}

/**
 * Reusable search input component with magnifying glass icon
 * 
 * @example
 * ```tsx
 * <SearchInput
 *   placeholder="Search..."
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 * />
 * ```
 */
export const SearchInput: React.FC<SearchInputProps> = ({
  containerStyle,
  iconSize = 20,
  iconColor = "#999",
  style,
  ...textInputProps
}) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <UniversalIcon
        library="ionicons"
        name="search"
        size={iconSize}
        color={iconColor}
      />
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#999"
        {...textInputProps}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#000",
    padding: 0,
  },
});
