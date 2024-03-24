import { Link, Stack } from "expo-router";
import * as React from "react";
import { View, Text, StyleSheet } from "react-native";

const NotFoundScreen = () => {
  return (
    <>
      <Stack.Screen options={{ header: () => null }} />
      <View style={styles.container}>
        <Text style={styles.text}>404: Page Not Found</Text>
        <Link href="/login">Go to Home</Link>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF",
  },
  text: {
    fontSize: 20,
    textAlign: "center",
    margin: 10,
  },
});

export default NotFoundScreen;
