import { Modal, View, Text, Pressable, StyleSheet } from "react-native";
import React from 'react'

const NewList = React.memo(({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Pressable onPress={onClose} >
            <Text style={styles.headerText}>Cancel</Text>
          </Pressable>
          <Text style={{
            fontSize: 20,
            fontWeight: "600",
            color: "#0b0b0b",
          }}>New List</Text>
          <Pressable onPress={onClose} >
            <Text style={styles.headerText}>Message</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
})

export default NewList

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    width: "100%",
    borderRadius: 8,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "normal",
    color: "#0b0b0b",
  },
})