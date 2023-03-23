import React, { memo, useCallback, useEffect } from "react";
import { Text } from "react-native-paper";
import { Contact } from "../../typings/types";
import { NativeScrollEvent, ScrollView, View } from "react-native";
import { useGlobal } from "../../context/Global";
import ListItem from "./ListItem";

interface ContactItemsProps {
  contacts: Contact[];
  allowSelect: boolean;
  onSelect?: (contact: Contact[]) => void;
  checked?: Contact[];
  porpuse?: "call" | "select";
}

const isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
  const paddingToBottom = 20;
  return (
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom
  );
};
export const ContactsList = memo(
  ({
    contacts,
    allowSelect,
    onSelect,
    checked,
    porpuse = "select",
  }: ContactItemsProps) => {
    const [checked_contacts, set_checked_contacts] = React.useState<Contact[]>(
      []
    );
    const [rendered_contacts, set_rendered_contacts] = React.useState<
      Contact[]
    >([]);
    const [loading, setLoading] = React.useState(false);
    const { startCallCycle, is_cycling } = useGlobal();
    // remove contact from group if it exists in the array
    const removeContact = async (contact: Contact) => {
      // remove item from checked array if it exists in the array
      let newChecked = [...contacts];
      if (isChecked(contact, newChecked))
        newChecked = newChecked.filter((c) => {
          if (c.phoneNumbers && contact.phoneNumbers)
            return c.phoneNumbers[0].number !== contact.phoneNumbers[0].number;
          return true;
        });

      onSelect?.(newChecked);
    };

    useEffect(() => {
      if (!loading) setLoading(true);
      if (checked) {
        set_checked_contacts(checked);
      }
      if (!loading) setLoading(false);
    }, []);

    const isChecked = (contact: Contact, contacts: Contact[]) => {
      let con = contacts.find((c) => {
        if (c.phoneNumbers && contact.phoneNumbers)
          return c.phoneNumbers[0].number === contact.phoneNumbers[0].number;
        return false;
      });
      return !!con;
    };

    const handleCheck = (contact: Contact) => {
      set_checked_contacts((prev) => {
        let newChecked = [...prev];
        if (isChecked(contact, newChecked))
          newChecked = newChecked.filter((c) => {
            if (c.phoneNumbers && contact.phoneNumbers)
              return (
                c.phoneNumbers[0].number !== contact.phoneNumbers[0].number
              );
            return true;
          });
        else newChecked = [...newChecked, contact];
        return newChecked;
      });
    };

    const submit = useCallback(() => {
      if (checked_contacts.length > 0) onSelect?.(checked_contacts);
    }, [checked_contacts]);

    useEffect(() => {
      if (!allowSelect && porpuse === "select") {
        set_checked_contacts([]);
      }
      if (!!allowSelect && rendered_contacts.length > 10) {
        if (contacts.length > 0) set_rendered_contacts(contacts.slice(0, 10));
      }
    }, [allowSelect, porpuse]);

    useEffect(() => {
      submit();
    }, [submit]);

    useEffect(() => {
      if (contacts.length > 0)
        set_rendered_contacts(
          contacts.slice(0, 10).filter((c) => {
            return isChecked(c, contacts);
          })
        );
    }, [contacts]);

    const handelScroll = (event: NativeScrollEvent) => {
      if (isCloseToBottom(event)) {
        if (rendered_contacts.length < contacts.length)
          set_rendered_contacts((prev) => [
            ...prev,
            ...contacts.slice(prev.length, prev.length + 10),
          ]);
      }
    };

    if (contacts.length > 0)
      return (
        <ScrollView
          onScroll={({ nativeEvent }) => {
            handelScroll(nativeEvent);
          }}
          scrollEventThrottle={400}
        >
          {rendered_contacts.map((contact, idx) => (
            <ListItem
              key={contact.id + "-" + idx}
              contact={contact}
              allowSelect={allowSelect}
              porpuse={porpuse}
              removeContact={removeContact}
              disabled={is_cycling}
              onPress={handleCheck}
              isChecked={isChecked(contact, checked_contacts)}
              StartSubCycle={() => {
                startCallCycle(contacts.slice(idx, contacts.length));
              }}
            />
          ))}
        </ScrollView>
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
