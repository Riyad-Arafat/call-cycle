import React, { memo, useCallback, useEffect } from "react";
import { Text } from "react-native-paper";
import { Contact } from "../../typings/types";
import { View, FlatList } from "react-native";
import { useGlobal } from "@hooks/useGlobal";
import ListItem from "./ListItem";

type ContactListProps =
  | {
      porpuse: "call";
      contactsList: Contact[];
      onDeleteContact: (contact: Contact) => void;
      onToggleDisable: (contact: Contact) => void;
    }
  | {
      porpuse: "select";
      contactsList: Contact[];
      selectedContacts?: Contact[];
      onCheck: (contact: Contact) => void;
    };

export const ContactsList = memo((props: ContactListProps) => {
  const { startCallCycle } = useGlobal();
  const [contacts, setContacts] = React.useState<Contact[]>(
    props.contactsList || []
  );
  const [selected_contacts, set_selected_contacts] = React.useState<Contact[]>(
    []
  );

  useEffect(() => {
    setContacts(props.contactsList);
  }, [props.contactsList]);

  useEffect(() => {
    if (props.porpuse === "select") {
      const passedContactsList = props.selectedContacts;
      set_selected_contacts(passedContactsList);
    } else {
      set_selected_contacts([]);
    }
  }, [props]);

  const isChecked = useCallback(
    (contact: Contact) => {
      const con = selected_contacts.find((c) => {
        if (c.phoneNumbers && contact.phoneNumbers)
          return c.phoneNumbers[0].number === contact.phoneNumbers[0].number;
        return false;
      });
      return !!con;
    },
    [selected_contacts]
  );
  const handleAction = useCallback(
    (action: "delete" | "toggle" | "check", contact: Contact) => {
      switch (action) {
        case "delete":
          if (props.porpuse !== "call") return;
          props.onDeleteContact(contact);
          break;
        case "toggle":
          if (props.porpuse !== "call") return;
          props.onToggleDisable(contact);
          break;
        case "check":
          if (props.porpuse !== "select") return;
          props.onCheck(contact);
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.porpuse]
  );
  if (contacts.length > 0)
    return (
      <FlatList
        data={contacts}
        renderItem={({ item, index }) => (
          <ListItem
            contact={item}
            porpuse={props.porpuse}
            removeContact={(contact) => handleAction("delete", contact)}
            onPress={(contact) => handleAction("check", contact)}
            isChecked={isChecked(item)}
            StartSubCycle={() => {
              startCallCycle(contacts.slice(index, contacts.length));
            }}
            toggleDisable={(contact) => handleAction("toggle", contact)}
          />
        )}
        keyExtractor={(item, index) => `${item.name}-${index}-${item.id}`}
      />
    );

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>No Contacts Found</Text>
    </View>
  );
});
