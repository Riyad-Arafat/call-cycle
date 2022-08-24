import React, { memo, useCallback, useEffect, useState } from "react";
import {
  Avatar,
  List,
  Checkbox,
  Colors,
  IconButton,
  Modal,
  Portal,
  Text,
  Button,
} from "react-native-paper";
import { Contact } from "../../typings/types";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";
import { NativeScrollEvent, ScrollView, View } from "react-native";
import { useGlobal } from "../../context/Global";

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
const Call = ({
  contact,
  disabled,
}: {
  contact: Contact;
  disabled: boolean;
}) => {
  const startCall = async () => {
    try {
      if (contact.phoneNumbers && contact.phoneNumbers[0].number) {
        RNImmediatePhoneCall.immediatePhoneCall(contact.phoneNumbers[0].number);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <IconButton
      icon={"phone"}
      color={Colors.green500}
      onPress={startCall}
      disabled={disabled}
    />
  );
};

const StartSubCycle = ({
  disabled,
  onPress,
}: {
  disabled: boolean;
  onPress: () => void;
}) => {
  return (
    <IconButton
      icon={"arrow-down"}
      color={Colors.green500}
      disabled={disabled}
      onPress={onPress}
    />
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
  }
);
const ListItem = memo(
  ({
    contact,
    disabled,
    removeContact,
    porpuse,
    allowSelect,
    onPress,
    isChecked,
    StartSubCycle: StartSubCycleFun,
  }: {
    contact: Contact;
    disabled: boolean;
    isChecked: boolean;
    removeContact: (contact: Contact) => void;
    porpuse: "call" | "select";
    allowSelect: boolean;
    onPress?: (contact: Contact) => void;
    StartSubCycle?: () => void;
  }) => {
    const handelOnPress = () => {
      if (porpuse === "select" && allowSelect) onPress?.(contact);
    };

    return (
      <List.Item
        title={contact.name}
        description={
          contact.phoneNumbers ? contact.phoneNumbers[0]?.number : ""
        }
        onPress={handelOnPress}
        left={() => (
          <Avatar.Text
            size={40}
            label={contact.name.charAt(0).toUpperCase()}
            style={{
              backgroundColor: Colors.grey600,
            }}
          />
        )}
        titleStyle={{
          fontSize: 15,
          fontWeight: "bold",
        }}
        right={() =>
          porpuse === "call" ? (
            <>
              <StartSubCycle disabled={disabled} onPress={StartSubCycleFun} />
              <Call contact={contact} disabled={disabled} />
              <DeleteContact
                contact={contact}
                disabled={disabled}
                onPress={() => removeContact(contact)}
              />
            </>
          ) : allowSelect ? (
            <Checkbox
              status={!!isChecked ? "checked" : "unchecked"}
              onPress={handelOnPress}
            />
          ) : null
        }
      />
    );
  },
  (prevProps, nextProps) => {
    let change = () => {
      if (prevProps.allowSelect !== nextProps.allowSelect) return true;
      if (prevProps.isChecked !== nextProps.isChecked) return true;
      if (prevProps.disabled !== nextProps.disabled) return true;
      if (
        prevProps.contact.phoneNumbers[0].number !==
        nextProps.contact.phoneNumbers[0].number
      )
        return true;

      return false;
    };
    return !change();
  }
);

const DeleteContact = ({
  disabled,
  onPress,
  contact,
}: {
  contact: Contact;
  disabled: boolean;
  onPress: () => void;
}) => {
  const [visible, setVisible] = React.useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleDelete = () => {
    hideModal();
    onPress();
  };

  const handleCancel = () => {
    hideModal();
  };
  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            backgroundColor: "white",
            padding: 20,
            // justifyContent: "space-between",
            display: "flex",

            height: "50%",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Are you sure you want to delete
          </Text>

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            {contact.name}
          </Text>

          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 50,
            }}
          >
            <Button
              onPress={handleDelete}
              color={Colors.red500}
              icon="delete"
              mode="contained"
            >
              Delete
            </Button>
            <Button
              onPress={handleCancel}
              mode="outlined"
              color={Colors.green400}
            >
              Cancel
            </Button>
          </View>
        </Modal>
      </Portal>
      <IconButton
        icon={"delete"}
        color={Colors.red500}
        onPress={showModal}
        disabled={disabled}
      />
    </>
  );
};
