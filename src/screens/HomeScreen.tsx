import { ScrollView, StyleSheet, View } from "react-native";
import { RootTabScreenProps } from "../typings/types";
import React, { useState } from "react";
import { ContactsItems } from "../components/ContactsList";
import ModaleScreen from "./ModalScreen";

import * as Contacts from "expo-contacts";
import { setContactsGroups } from "../apis";

export type Contact = Contacts.Contact;

export default function HomeScreen({
  navigation,
}: RootTabScreenProps<"HomeScreen">) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selection, setSelection] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact[] | null>(
    null
  );

  const allowSelection = () => {
    setSelection(true);
  };
  const onCancel = () => {
    setSelection(false);
    setSelectedContact(null);
  };

  const storeData = async (name: string) => {
    if (!!selectedContact)
      try {
        // get the value from storage
        await setContactsGroups(name, selectedContact);
        setSelection(false);
        setSelectedContact(null);
      } catch (e) {
        // saving error
        console.log(e);
      }
  };

  const onSelect = (contacts: Contact[]) => {
    setSelectedContact(contacts);
  };

  React.useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [
            Contacts.Fields.FirstName,
            Contacts.Fields.LastName,
            Contacts.Fields.PhoneNumbers,
          ],
        });

        if (data.length > 0) {
          setContacts(removeDuplicatesPhone(data) || null);
        }
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contactsView}>
        <ContactsItems
          contacts={contacts}
          checked={selectedContact || undefined}
          allowSelect={selection}
          onSelect={onSelect}
          is_cycling={false}
        />
      </ScrollView>
      <ModaleScreen
        onAdd={allowSelection}
        onSave={storeData}
        isSlector={selection}
        selectedLength={selectedContact?.length || 0}
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
    marginBottom: 80,
    // backgroundColor: "#494949",
  },
});

// remvove duplicates phone number from contact object in array
export const removeDuplicatesPhone = (contacts: Contacts.Contact[]) => {
  const uniqueContacts = contacts.map((contact) => {
    if (!!contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      let uniquePhones = uniqueBy(contact.phoneNumbers, "number");
      contact.phoneNumbers = uniquePhones;
      return contact;
    }
    return contact;
  });
  return uniqueContacts.filter(
    (item, index, self) =>
      index ===
      self.findIndex((t) => {
        return (
          t.phoneNumbers &&
          item.phoneNumbers &&
          t.phoneNumbers[0].number === item.phoneNumbers[0].number
        );
      })
  );
};

/// return unique objects from array based on property
const uniqueBy = (
  array: Contacts.PhoneNumber[],
  property: keyof Contacts.PhoneNumber
) => {
  let uniq = array.filter(
    (item, index, self) =>
      index === self.findIndex((t) => t[property] === item[property])
  );
  return uniq;
};
