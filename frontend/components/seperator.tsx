import { StyleProp, ViewStyle, View } from 'react-native'
import React from 'react'

const Seperator = ({
  orientation = "horizontal",
  style
}: {
  orientation?: "horizontal" | "vertical";
  style?: StyleProp<ViewStyle>;
}) => {
  return (
    <View
      style={
        [
          {
            height: orientation === "horizontal" ? 1 : "100%",
            width: orientation === "vertical" ? 1 : "100%",
            backgroundColor: "#E0E0E0",
          },
          style
        ]
      }
    />
  )
}

export default Seperator  