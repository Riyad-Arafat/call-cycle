import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NotFoundScreen from "../screens/NotFoundScreen";
import { RootStackParamList } from "../typings/types";
import LinkingConfiguration from "./LinkingConfiguration";
import GroupsScreen from "@screens/GroupsScreen";
import { Button } from "react-native-paper";
import CreateGroup from "@components/Actions/CreateGroup/CreateGroup";
import { View, Text } from "react-native";

export default function Navigation() {
  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <RootNavigator />
    </NavigationContainer>
  );
}

/**
 * A root stack navigator is often used for displaying modals on top of all other content.
 * https://reactnavigation.org/docs/modal
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

const Header = () => {
  const [openGroupForm, setOpenGroupForm] = React.useState(false);

  return (
    <>
      <CreateGroup
        type="create"
        visible={openGroupForm}
        hideModal={() => setOpenGroupForm(false)}
      />
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
        <Text>Groups</Text>
        <Button
          onPress={() => setOpenGroupForm(true)}
          icon={"plus"}
          mode="contained"
        >
          Add Group
        </Button>
      </View>
    </>
  );
};

export function RootNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Root"
        component={GroupsScreen}
        options={{
          title: "Groups",
          header(props) {
            return (
              <>
                <Header />
              </>
            );
          },
        }}
      />
      <Stack.Screen
        name="NotFound"
        component={NotFoundScreen}
        options={{ title: "Oops!" }}
      />
    </Stack.Navigator>
  );
}
