import { StyleSheet, View, ScrollView } from "react-native";
import React from "react";
import { ContactsList } from "../components/ContactsList";

import { useGlobal } from "../context/Global";
import FabGroup from "@components/FabGroup";

const List = () => {
  const { contacts } = useGlobal();

  return (
    <ScrollView style={styles.contactsView}>
      <ContactsList
        contacts={contacts}
        checked={undefined}
        allowSelect={false}
      />
    </ScrollView>
  );
};

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <List />
      <FabGroup />
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
