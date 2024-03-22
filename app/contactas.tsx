import React from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { Text } from "react-native-paper";

const GroupsScreen = React.lazy(() => import("@screens/GroupsScreen"));
const GroupForm = React.lazy(() => import("@components/Actions/GroupForm"));

export default function Home() {
  return (
    <View>
      <React.Suspense fallback={null}>
        <Stack.Screen options={{ title: "Groups", header: () => <Header /> }} />
        <GroupsScreen />
      </React.Suspense>
    </View>
  );
}

const Header = () => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#fff",
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
        }}
      >
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          Groups
        </Text>
        <GroupForm type="create" />
      </View>
    </>
  );
};
