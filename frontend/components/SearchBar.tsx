import React from 'react';
import { TextInput, TextInputProps, TouchableOpacity, View } from 'react-native';
import UniversalIcon, { IconFamily } from './UniversalIcon';

interface SearchBarProps extends TextInputProps {
  /** Optional icon to display on the left side */
  leftIcon?: {
    family: IconFamily;
    name: string;
    size?: number;
    color?: string;
  };
  /** Optional icon to display on the right side */
  rightIcon?: {
    family: IconFamily;
    name: string;
    size?: number;
    color?: string;
    onPress?: () => void;
  };
  /** Container class name for styling */
  containerClassName?: string;
  /** Input class name for styling */
  inputClassName?: string;
}

/**
 * SearchBar Component
 * 
 * A reusable search bar with optional left and right icons
 * 
 * @example
 * ```tsx
 * <SearchBar 
 *   placeholder="Search chats..."
 *   leftIcon={{ family: 'Ionicons', name: 'search', size: 20, color: '#6B7280' }}
 *   rightIcon={{ family: 'Ionicons', name: 'filter', size: 20, color: '#6B7280', onPress: () => {} }}
 * />
 * ```
 */
const SearchBar: React.FC<SearchBarProps> = ({
  leftIcon,
  rightIcon,
  containerClassName = '',
  inputClassName = '',
  placeholder = 'Search...',
  ...textInputProps
}) => {
  return (
    <View className={`flex-row items-center bg-gray-100 rounded-full px-4 py-2 ${containerClassName}`}>
      {/* Left Icon */}
      {leftIcon && (
        <UniversalIcon
          family={leftIcon.family}
          name={leftIcon.name}
          size={leftIcon.size || 20}
          color={leftIcon.color || '#6B7280'}
          style={{ marginRight: 8 }}
        />
      )}

      {/* Text Input */}
      <TextInput
        className={`flex-1 text-base ${inputClassName}`}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        {...textInputProps}
      />

      {/* Right Icon */}
      {rightIcon && (
        rightIcon.onPress ? (
          <TouchableOpacity onPress={rightIcon.onPress} activeOpacity={0.7}>
            <UniversalIcon
              family={rightIcon.family}
              name={rightIcon.name}
              size={rightIcon.size || 20}
              color={rightIcon.color || '#6B7280'}
              style={{ marginLeft: 8 }}
            />
          </TouchableOpacity>
        ) : (
          <UniversalIcon
            family={rightIcon.family}
            name={rightIcon.name}
            size={rightIcon.size || 20}
            color={rightIcon.color || '#6B7280'}
            style={{ marginLeft: 8 }}
          />
        )
      )}
    </View>
  );
};

export default SearchBar;
