import { StyleSheet, ScrollView, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { RootTabScreenProps } from "../typings/types";
import ContactsGroupe, {
  ContactsGroupeProps,
} from "../components/CntactsGroupe";
import { getContactsGroups } from "../apis";

export default function GroupsScreen({
  navigation,
}: RootTabScreenProps<"Groups">) {
  const isFocused = useIsFocused();

  const [checked, setChecked] = React.useState<
    ContactsGroupeProps["groups"] | []
  >([]);

  const getData = async () => {
    try {
      const data = await getContactsGroups();
      setChecked(data);
    } catch (e) {
      // error reading value
      console.log(e);
    }
  };

  React.useEffect(() => {
    // Call only when screen open or when back on screen
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contactsView}>
        {/* <ContactsItems contacts={checked} /> */}
        <ContactsGroupe groups={checked} reFetch={getData} />
        {/* <ModaleScreen /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  contactsView: {
    width: "100%",
  },
});
