import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

const NewList = React.memo(
  ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={isOpen}
        onRequestClose={onClose}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Pressable onPress={onClose}>
              <Text style={styles.headerText}>Cancel</Text>
            </Pressable>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "600",
                color: "#0b0b0b",
              }}
            >
              New List
            </Text>
            <Pressable onPress={onClose}>
              <Text style={styles.headerText}>Message</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    );
  }
);

export default NewList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#0b0b0b",
  },
  // bottomSheet: {
  //   backgroundColor: "white",
  //   padding: 20,
  //   borderTopLeftRadius: 15,
  //   borderTopRightRadius: 15,
  //   minHeight: 200,
  // },
});
