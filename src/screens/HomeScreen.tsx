import { ScrollView, StyleSheet, View } from "react-native";
import { RootTabScreenProps } from "../typings/types";
import React from "react";
import { ContactsList } from "../components/ContactsList";
import ModaleScreen from "./ModalScreen";

import * as Contacts from "expo-contacts";
import { setContactsGroups } from "../apis";
import Loading from "../components/Loading";
import { useGlobal } from "../context/Global";

export type Contact = Contacts.Contact;

export default function HomeScreen({
  navigation,
}: RootTabScreenProps<"HomeScreen">) {
  const [selection, setSelection] = React.useState(false);
  const [selectedContacts, setSelectedContacts] = React.useState<
    Contact[] | null
  >(null);
  const { search_value, handel_search_value } = useGlobal();
  const [search_result, setsearch_result] = React.useState<Contact[]>([]);
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

  React.useEffect(() => {
    if (!!search_value) {
      setsearch_result(search_fun(search_value, contacts));
    } else setsearch_result(contacts);
  }, [search_value]);

  if (contacts.length === 0) return <Loading />;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contactsView}>
        <ContactsList
          contacts={!!search_value ? search_result : contacts}
          checked={undefined}
          allowSelect={selection}
          onSelect={onSelect}
          is_cycling={false}
        />
      </ScrollView>
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
    // marginBottom: 80,
    borderBottomWidth: 2,
    borderBottomColor: "black",
    // backgroundColor: "#494949",
  },
});

// remvove duplicates phone number from contact object in array
export const removeDuplicatesPhone = (
  contacts: Contacts.Contact[]
): Promise<{ data: Contact[] }> => {
  return new Promise((resolve, reject) => {
    const uniqueContacts = contacts.map((contact) => {
      if (!!contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        let uniquePhones = uniqueBy(contact.phoneNumbers, "number");
        contact.phoneNumbers = uniquePhones;
        return contact;
      }
      return contact;
    });
    let data = uniqueContacts.filter(
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
    resolve({ data });
  });
};

/// search in Contacts[] by name or phone number
export const search_fun = (str: string, contacts: Contact[]) => {
  let result = [...contacts];
  const notUndefined = (anyValue: Contact) => typeof anyValue !== "undefined";
  if (!!str)
    result = result.map((cont) => {
      if (cont.name.toLowerCase().includes(str.toLowerCase())) return cont;
      if (
        cont?.phoneNumbers[0].number.toLowerCase().includes(str.toLowerCase())
      )
        return cont;
    });

  return result.filter(notUndefined) || [];
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
