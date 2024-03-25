import React, { memo, useCallback } from "react";
import { Text } from "react-native-paper";
import { Contact } from "../../typings/types";
import { View, FlatList } from "react-native";
import { useGlobal } from "@hooks/useGlobal";
import ListItem from "./ListItem";

type ViewContactListProps = {
  contactsList: Contact[];
  onDeleteContact: (contact: Contact) => void;
  onToggleDisable: (contact: Contact) => void;
};

const ContactsList = memo(
  ({
    contactsList,
    onDeleteContact,
    onToggleDisable,
  }: ViewContactListProps) => {
    const { startCallCycle } = useGlobal();

    const handleAction = useCallback(
      (action: "delete" | "toggle" | "check", contact: Contact) => {
        switch (action) {
          case "delete":
            onDeleteContact(contact);
            break;
          case "toggle":
            onToggleDisable(contact);
            break;
        }
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    if (contactsList.length > 0)
      return (
        <FlatList
          data={contactsList}
          renderItem={({ item, index }) => (
            <ListItem.View
              contact={item}
              removeContact={(contact) => handleAction("delete", contact)}
              StartSubCycle={() => {
                startCallCycle(contactsList.slice(index, contactsList.length));
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
  }
);

ContactsList.displayName = "ContactsList";

export default ContactsList;
