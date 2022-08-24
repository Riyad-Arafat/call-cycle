import { ScrollView, StyleSheet, View } from "react-native";
import { Contact } from "../typings/types";
import React from "react";
import { ContactsList } from "../components/ContactsList";
import ModaleScreen from "./ModalScreen";

import { setContactsGroups } from "../apis";
import Loading from "../components/Loading";
import { useGlobal } from "../context/Global";

export default function HomeScreen() {
  const [selection, setSelection] = React.useState(false);
  const [selectedContacts, setSelectedContacts] = React.useState<
    Contact[] | null
  >(null);
  const { handel_search_value } = useGlobal();
  const { contacts } = useGlobal();

  const allowSelection = () => {
    setSelection(true);
  };
  const onCancel = () => {
    setSelection(false);
    onSelect([]);
  };

  const storeData = async (name: string) => {
    if (!!selectedContacts)
      try {
        // get the value from storage
        await setContactsGroups(name, selectedContacts);
        setSelection(false);
        onSelect([]);
        handel_search_value("");
      } catch (e) {
        // saving error
        console.log(e);
      }
  };

  const onSelect = async (values: Contact[]) => {
    setSelectedContacts(values);
  };

  if (contacts.length === 0) return <Loading />;

  return (
    <View style={styles.container}>
      <View style={styles.contactsView}>
        <ContactsList
          contacts={contacts}
          checked={undefined}
          allowSelect={selection}
          onSelect={onSelect}
        />
      </View>
      <ModaleScreen
        onAdd={allowSelection}
        onSave={storeData}
        isSlector={selection}
        selectedLength={selectedContacts?.length || 0}
        onCancel={onCancel}
      />
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
    height: "75%",
    borderBottomWidth: 2,
    borderBottomColor: "black",
    // backgroundColor: "#494949",
  },
});
