import React, { memo, useCallback, useEffect, useRef } from "react";
import { Text } from "react-native-paper";
import { Contact } from "../../typings/types";
import { NativeScrollEvent, ScrollView, View } from "react-native";
import { useGlobal } from "@hooks/useGlobal";
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
    contacts: initial_contacts,
    allowSelect,
    onSelect,
    checked,
    porpuse = "select",
  }: ContactItemsProps) => {
    const num_of_contacts_in_view = useRef(0);
    const [contacts, set_contacts] =
      React.useState<Contact[]>(initial_contacts);
    const [checked_contacts, set_checked_contacts] = React.useState<Contact[]>(
      []
    );
    const [rendered_contacts, set_rendered_contacts] = React.useState<
      Contact[]
    >([]);
    const { startCallCycle, on_opreation } = useGlobal();

    useEffect(() => {
      set_contacts(initial_contacts);
    }, [initial_contacts]);

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

    const toggleDisable = (contact: Contact) => {
      const newChecked = contacts.map((c) => {
        if (c.phoneNumbers && contact.phoneNumbers)
          if (c.phoneNumbers[0].number === contact.phoneNumbers[0].number)
            return { ...c, disabled: !c.disabled };
        return c;
      });
      set_contacts(newChecked);
      onSelect?.(newChecked);
    };

    useEffect(() => {
      if (checked) {
        set_checked_contacts(checked);
      }
    }, [checked]);

    const isChecked = (contact: Contact, contacts: Contact[]) => {
      const con = contacts.find((c) => {
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
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checked_contacts]);

    useEffect(() => {
      if (!allowSelect && porpuse === "select") {
        set_checked_contacts([]);
      }
      if (!!allowSelect && rendered_contacts.length > 10) {
        if (contacts.length > 0) {
          const num = num_of_contacts_in_view.current + 10;
          num_of_contacts_in_view.current = num;
          set_rendered_contacts(contacts.slice(0, num));
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [allowSelect, porpuse]);

    useEffect(() => {
      submit();
    }, [submit]);

    useEffect(() => {
      if (contacts.length > 0) {
        const num = num_of_contacts_in_view.current + 10;
        num_of_contacts_in_view.current = num;

        set_rendered_contacts(
          contacts.slice(0, num).filter((c) => {
            return isChecked(c, contacts);
          })
        );
        num_of_contacts_in_view.current = num;
      }
    }, [contacts]);

    const handelScroll = (event: NativeScrollEvent) => {
      if (isCloseToBottom(event)) {
        if (rendered_contacts.length < contacts.length) {
          const current = num_of_contacts_in_view.current;
          const next = num_of_contacts_in_view.current + 10;
          num_of_contacts_in_view.current = next;
          set_rendered_contacts((prev) => [
            ...prev,
            ...contacts.slice(current, next),
          ]);
        }
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
              disabled={on_opreation}
              onPress={handleCheck}
              isChecked={isChecked(contact, checked_contacts)}
              StartSubCycle={() => {
                startCallCycle(contacts.slice(idx, contacts.length));
              }}
              toggleDisable={toggleDisable}
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
