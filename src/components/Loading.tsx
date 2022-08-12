import * as React from "react";
import { View } from "react-native";
import { ActivityIndicator, Colors } from "react-native-paper";

export const Loading = () => (
  <View
    style={{
      height: "100%",
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: Colors.white,
    }}
  >
    <ActivityIndicator animating={true} color={Colors.red800} />
  </View>
);

export default Loading;
