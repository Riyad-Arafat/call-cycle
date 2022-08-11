import React from "react";
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
import { Contact } from "../../screens/HomeScreen";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";
import { View } from "react-native";

interface ContactItemsProps {
  contacts: Contact[];
  allowSelect: boolean;
  onSelect?: (contact: Contact[]) => void;
  checked?: Contact[];
  porpuse?: "call" | "select";
  is_cycling: boolean;
}

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

export const ContactsItems = ({
  contacts,
  allowSelect,
  onSelect,
  checked,
  porpuse,
  is_cycling,
}: ContactItemsProps) => {
  const isChecked = (contact: Contact) => {
    return checked?.find((c) => {
      if (c.phoneNumbers && contact.phoneNumbers)
        return c.phoneNumbers[0].number === contact.phoneNumbers[0].number;
      return false;
    });
  };
  const handleCheck = (item: Contact) => {
    let newChecked: Contact[] = [];
    if (!isChecked(item)) {
      newChecked = [...(checked || []), item];
    } else {
      // remove item from checked array if it exists in the array
      newChecked =
        checked?.filter((c) => {
          if (c.phoneNumbers && item.phoneNumbers)
            return c.phoneNumbers[0].number === item.phoneNumbers[0].number;
          return false;
        }) || [];
    }
    onSelect?.(newChecked);
  };

  // remove contact from group if it exists in the array
  const removeContact = (contact: Contact) => {
    // remove item from checked array if it exists in the array
    const newChecked =
      contacts?.filter((c) => {
        if (c.phoneNumbers && contact.phoneNumbers) return c.id !== contact.id;
        return false;
      }) || [];
    onSelect?.(newChecked);
  };

  return (
    <>
      {contacts.map((contact, idx) => {
        return (
          <List.Item
            key={`${contact.id}-${idx}`}
            title={contact.name}
            description={
              contact.phoneNumbers ? contact.phoneNumbers[0]?.number : ""
            }
            left={() => (
              <Avatar.Text
                size={40}
                label={contact.name.charAt(0).toUpperCase()}
              />
            )}
            right={() =>
              porpuse === "call" ? (
                <>
                  <Call contact={contact} disabled={is_cycling} />
                  <DeleteContact
                    contact={contact}
                    disabled={is_cycling}
                    onPress={() => removeContact(contact)}
                  />
                </>
              ) : allowSelect ? (
                <Checkbox
                  status={isChecked(contact) ? "checked" : "unchecked"}
                  onPress={() => {
                    handleCheck(contact);
                  }}
                />
              ) : null
            }
          />
        );
      })}
    </>
  );
};

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
