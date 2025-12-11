import {
  AntDesign,
  Entypo,
  EvilIcons,
  Feather,
  FontAwesome,
  FontAwesome5,
  FontAwesome6,
  Fontisto,
  Foundation,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  Octicons,
  SimpleLineIcons,
  Zocial,
} from '@expo/vector-icons';
import React from 'react';
import { StyleProp, TextStyle } from 'react-native';

// Type definitions for icon families
export type IconFamily =
  | 'AntDesign'
  | 'Entypo'
  | 'EvilIcons'
  | 'Feather'
  | 'FontAwesome'
  | 'FontAwesome5'
  | 'FontAwesome6'
  | 'Fontisto'
  | 'Foundation'
  | 'Ionicons'
  | 'MaterialCommunityIcons'
  | 'MaterialIcons'
  | 'Octicons'
  | 'SimpleLineIcons'
  | 'Zocial';

// Props interface
export interface UniversalIconProps {
  family: IconFamily;
  name: string;
  size?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/**
 * UniversalIcon Component
 * 
 * A unified icon component that supports multiple icon families from @expo/vector-icons
 * 
 * @example
 * ```tsx
 * <UniversalIcon family="Ionicons" name="home" size={24} color="#000" />
 * <UniversalIcon family="MaterialIcons" name="settings" size={30} color="#666" />
 * <UniversalIcon family="FontAwesome" name="user" size={20} />
 * ```
 */
const UniversalIcon: React.FC<UniversalIconProps> = ({
  family,
  name,
  size = 24,
  color = '#000',
  style,
}) => {
  // Map icon family to corresponding component
  const iconComponents = {
    AntDesign: AntDesign,
    Entypo: Entypo,
    EvilIcons: EvilIcons,
    Feather: Feather,
    FontAwesome: FontAwesome,
    FontAwesome5: FontAwesome5,
    FontAwesome6: FontAwesome6,
    Fontisto: Fontisto,
    Foundation: Foundation,
    Ionicons: Ionicons,
    MaterialCommunityIcons: MaterialCommunityIcons,
    MaterialIcons: MaterialIcons,
    Octicons: Octicons,
    SimpleLineIcons: SimpleLineIcons,
    Zocial: Zocial,
  };

  const IconComponent = iconComponents[family];

  if (!IconComponent) {
    console.warn(`Icon family "${family}" not found. Using default Ionicons.`);
    return <Ionicons name="help-circle" size={size} color={color} style={style} />;
  }

  return (
    <IconComponent
      // @ts-ignore - Dynamic icon names are hard to type correctly
      name={name}
      size={size}
      color={color}
      style={style}
    />
  );
};

export default UniversalIcon;
