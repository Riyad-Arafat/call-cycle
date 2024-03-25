import React, { memo, useCallback, useEffect } from "react";
import { Text } from "react-native-paper";
import { Contact } from "../../typings/types";
import { View, FlatList, Alert } from "react-native";
import ListItem from "./ListItem";
import { useTranslation } from "@hooks/useTranslation";

interface EditableContactListProps {
  contactsList: Contact[];
  selectedContacts: Contact[];
  onCheck: (contact: Contact) => void;
  isAbleToAddMoreContacts: boolean;
}

const EditableContactList = memo(
  ({
    contactsList,
    selectedContacts,
    onCheck,
    isAbleToAddMoreContacts,
  }: EditableContactListProps) => {
    const { t } = useTranslation();

    const [selected_contacts, set_selected_contacts] = React.useState<
      Contact[]
    >([]);

    useEffect(() => {
      if (selectedContacts) {
        set_selected_contacts(selectedContacts);
      }
    }, [selectedContacts]);

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
    const handleonPress = useCallback(
      (contact: Contact) => {
        if (!isAbleToAddMoreContacts) {
          Alert.alert(
            t("Upgrade Plan"),
            t("You have reached the limit of contacts")
          );
          return;
        }
        onCheck(contact);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [isAbleToAddMoreContacts]
    );

    if (contactsList.length > 0)
      return (
        <FlatList
          data={contactsList}
          renderItem={({ item }) => (
            <ListItem.Editable
              contact={item}
              onPress={(contact) => handleonPress(contact)}
              isChecked={isChecked(item)}
              disabled={!isAbleToAddMoreContacts}
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

EditableContactList.displayName = "EditableContactList";

export default EditableContactList;
