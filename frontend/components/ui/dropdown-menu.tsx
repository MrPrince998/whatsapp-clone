import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated,
  Dimensions,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { UniversalIcon } from "./universal-icon";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export interface DropdownMenuItem {
  label: string;
  icon?: {
    library: "ionicons" | "fontawesome" | "material" | "antdesign" | "feather" | "lucide" | "simplelineicons";
    name: string;
  };
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  containerStyle?: ViewStyle;
}

/**
 * Dropdown menu component inspired by shadcn/ui
 * 
 * @example
 * ```tsx
 * <DropdownMenu
 *   trigger={
 *     <Pressable>
 *       <UniversalIcon library="antdesign" name="ellipsis" size={24} />
 *     </Pressable>
 *   }
 *   items={[
 *     {
 *       label: "Edit",
 *       icon: { library: "feather", name: "edit" },
 *       onPress: () => console.log("Edit"),
 *     },
 *     {
 *       label: "Delete",
 *       icon: { library: "feather", name: "trash" },
 *       onPress: () => console.log("Delete"),
 *       destructive: true,
 *     },
 *   ]}
 * />
 * ```
 */
export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  items,
  align = "right",
  containerStyle,
}) => {
  const [visible, setVisible] = useState(false);
  const [triggerLayout, setTriggerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const triggerRef = useRef<View>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleOpen = () => {
    triggerRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setTriggerLayout({ x: pageX, y: pageY, width, height });
      setVisible(true);
    });
  };

  const handleClose = () => {
    setVisible(false);
  };

  const handleItemPress = (item: DropdownMenuItem) => {
    if (!item.disabled) {
      item.onPress();
      handleClose();
    }
  };

  const menuStyle: ViewStyle = {
    position: "absolute",
    top: triggerLayout.y + triggerLayout.height + 8,
    [align === "right" ? "right" : "left"]:
      align === "right"
        ? SCREEN_WIDTH - triggerLayout.x - triggerLayout.width
        : triggerLayout.x,
  };

  return (
    <View ref={triggerRef} style={containerStyle}>
      <Pressable onPress={handleOpen}>
        {trigger}
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="none"
        onRequestClose={handleClose}
      >
        <Pressable style={styles.overlay} onPress={handleClose}>
          <Animated.View
            style={[
              styles.menu,
              menuStyle,
              {
                opacity: opacityAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-10, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {items.map((item, index) => (
              <Pressable
                key={index}
                onPress={() => handleItemPress(item)}
                disabled={item.disabled}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && !item.disabled && styles.menuItemPressed,
                  item.disabled && styles.menuItemDisabled,
                  index === 0 && styles.firstMenuItem,
                  index === items.length - 1 && styles.lastMenuItem,
                ]}
              >
                <Text
                  style={[
                    styles.menuItemText,
                    item.destructive && styles.menuItemTextDestructive,
                    item.disabled && styles.menuItemTextDisabled,
                  ]}
                >
                  {item.label}
                </Text>
                {item.icon && (
                  <UniversalIcon
                    library={item.icon.library}
                    name={item.icon.name as any}
                    size={18}
                    color={
                      item.disabled
                        ? "#999"
                        : item.destructive
                          ? "#ef4444"
                          : "#000"
                    }
                  />
                )}
              </Pressable>
            ))}
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
  },
  menu: {
    backgroundColor: "#fff",
    borderRadius: 8,
    minWidth: 180,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingVertical: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  menuItemPressed: {
    backgroundColor: "#f5f5f5",
  },
  menuItemDisabled: {
    opacity: 0.5,
  },
  firstMenuItem: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  lastMenuItem: {
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  menuItemText: {
    fontSize: 15,
    color: "#000",
    fontWeight: "400",
  },
  menuItemTextDestructive: {
    color: "#ef4444",
  },
  menuItemTextDisabled: {
    color: "#999",
  },
});
