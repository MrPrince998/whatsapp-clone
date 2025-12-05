// Universal icon component supporting multiple icon libraries

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Ionicons, AntDesign, Feather, FontAwesome, SimpleLineIcons } from "@expo/vector-icons";
import * as LucideIcons from "lucide-react-native";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

// Supported icon libraries
type IconLibrary =
  | "material"
  | "ionicons"
  | "antdesign"
  | "feather"
  | "fontawesome"
  | "lucide"
  | "simplelineicons"

// Icon component props for each library
type MaterialIconName = ComponentProps<typeof MaterialIcons>["name"];
type IoniconsName = ComponentProps<typeof Ionicons>["name"];
type AntDesignName = ComponentProps<typeof AntDesign>["name"];
type FeatherName = ComponentProps<typeof Feather>["name"];
type FontAwesomeName = ComponentProps<typeof FontAwesome>["name"];
type LucideIconName = keyof typeof LucideIcons;
type SimpleLineIconsName = ComponentProps<typeof SimpleLineIcons>["name"];

// Union type for all possible icon names
type IconName =
  | MaterialIconName
  | IoniconsName
  | AntDesignName
  | FeatherName
  | FontAwesomeName
  | LucideIconName
  | SimpleLineIconsName

/**
 * Universal icon component that supports multiple icon libraries
 * Usage examples:
 * <UniversalIcon library="lucide" name="MessageCircle" size={24} color="#000" />
 * <UniversalIcon library="ionicons" name="chatbubble-outline" size={24} color="#000" />
 * <UniversalIcon library="material" name="message" size={24} color="#000" />
 */
export function UniversalIcon({
  library = "material",
  name,
  size = 24,
  color,
  style,
}: {
  library?: IconLibrary;
  name: IconName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  // Render based on selected library
  switch (library) {
    case "ionicons":
      return (
        <Ionicons
          name={name as IoniconsName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "antdesign":
      return (
        <AntDesign
          name={name as AntDesignName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "feather":
      return (
        <Feather
          name={name as FeatherName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "fontawesome":
      return (
        <FontAwesome
          name={name as FontAwesomeName}
          size={size}
          color={color}
          style={style}
        />
      );

    case "lucide":
      const LucideIcon = (LucideIcons as any)[name as string];
      if (!LucideIcon) {
        console.warn(`Lucide icon "${name}" not found`);
        return null;
      }
      return <LucideIcon size={size} color={color} style={style} />;

    case "material":
    default:
      return (
        <MaterialIcons
          name={name as MaterialIconName}
          size={size}
          color={color}
          style={style}
        />
      );
  }
}

// Convenience components for specific libraries
export const MaterialIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="material" />;

export const IonicIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="ionicons" />;

export const LucideIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="lucide" />;

export const FeatherIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="feather" />;

export const AntIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="antdesign" />;

export const FontAwesomeIcon = (
  props: Omit<ComponentProps<typeof UniversalIcon>, "library">
) => <UniversalIcon {...props} library="fontawesome" />;
