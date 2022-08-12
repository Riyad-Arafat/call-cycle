import { StyleSheet, ScrollView, View } from "react-native";
import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { RootTabScreenProps } from "../typings/types";
import ContactsGroupe, {
  ContactsGroupeProps,
} from "../components/CntactsGroupe";
import { getContactsGroups } from "../apis";
import Loading from "../components/Loading";

export default function GroupsScreen({
  navigation,
}: RootTabScreenProps<"Groups">) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = React.useState(true);
  const [checked, setChecked] = React.useState<
    ContactsGroupeProps["groups"] | []
  >([]);

  const getData = async () => {
    setLoading(true);
    try {
      const data = await getContactsGroups();
      setChecked(data);
    } catch (e) {
      // error reading value
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Call only when screen open or when back on screen
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  if (loading) return <Loading />;

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
