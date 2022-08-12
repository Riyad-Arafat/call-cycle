import React, { memo, useEffect, useState } from "react";
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
import { FlatList, View } from "react-native";
import {
  SpeedyList,
  SpeedyListItemMeta,
  SpeedyListItemRenderer,
} from "react-native-speedy-list";

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

export const ContactsList = memo(
  ({
    contacts,
    allowSelect,
    onSelect,
    checked,
    porpuse,
    is_cycling,
  }: ContactItemsProps) => {
    const [newChecked, setNewChecked] = React.useState<Contact[]>([]);
    const [loading, setLoading] = React.useState(false);
    // remove contact from group if it exists in the array
    const removeContact = async (contact: Contact) => {
      // remove item from checked array if it exists in the array
      const newChecked =
        contacts?.filter((c) => {
          if (c.phoneNumbers && contact.phoneNumbers)
            return c.id !== contact.id;
          return false;
        }) || [];
      onSelect?.(newChecked);
    };

    useEffect(() => {
      if (!loading) setLoading(true);
      if (checked) {
        setNewChecked(checked);
      }
      if (!loading) setLoading(false);
    }, [checked]);

    const handleSelect = (values: Contact[]) => {
      setTimeout(async () => {
        setNewChecked(values);
        onSelect?.(values);
      }, 0);
    };

    const renderItem = ({ item }) => (
      <ListItem
        // key={contact.id + "-" + idx}
        contact={item}
        allowSelect={allowSelect}
        checked_contacts={newChecked}
        porpuse={porpuse}
        removeContact={removeContact}
        disabled={is_cycling}
        onSelect={handleSelect}
      />
    );

    return (
      <>
        {contacts.map((contact, idx) => (
          <ListItem
            key={contact.id + "-" + idx}
            contact={contact}
            allowSelect={allowSelect}
            checked_contacts={newChecked}
            porpuse={porpuse}
            removeContact={removeContact}
            disabled={is_cycling}
            onSelect={handleSelect}
          />
        ))}
      </>
    );
  }
);
const ListItem = ({
  contact,
  disabled,
  removeContact,
  porpuse,
  allowSelect,
  checked_contacts,
  onSelect,
}: {
  contact: Contact;
  checked_contacts: Contact[];
  disabled: boolean;
  removeContact: (contact: Contact) => void;
  porpuse: "call" | "select";
  allowSelect: boolean;
  onSelect?: (contact: Contact[]) => void;
}) => {
  const [isChecked_cont, setIsChecked] = useState(false);
  const [newChecked, setNewChecked] = React.useState<Contact[]>([]);

  const isChecked = async (contact: Contact): Promise<boolean> => {
    let con = checked_contacts?.find((c) => {
      if (c.phoneNumbers && contact.phoneNumbers)
        return c.phoneNumbers[0].number === contact.phoneNumbers[0].number;
      return false;
    });

    return new Promise((resolve) => {
      resolve(!!con);
    });
  };
  const handleCheck = async (): Promise<{ data: Contact[] }> => {
    return new Promise(async (resolve) => {
      let newChecked: Contact[] = [];
      if (checked_contacts) {
        newChecked = [...checked_contacts];
      }

      if (isChecked_cont) {
        setIsChecked(false);
        newChecked = newChecked.filter((c) => {
          if (c.phoneNumbers && contact.phoneNumbers)
            return c.phoneNumbers[0].number !== contact.phoneNumbers[0].number;
          return true;
        });
      } else {
        setIsChecked(true);
        newChecked.push(contact);
      }
      resolve({ data: newChecked });
    });
  };

  const onPress = async () => {
    let { data } = await handleCheck();
    console.log("checked_contacts", data.length);

    onSelect?.(data);
  };

  useEffect(() => {
    (async () => {
      if (checked_contacts && allowSelect) {
        await isChecked(contact).then((res) => {
          setIsChecked(!!res);
        });
      }
    })();
  }, [checked_contacts]);

  return (
    <List.Item
      title={contact.name}
      description={contact.phoneNumbers ? contact.phoneNumbers[0]?.number : ""}
      onPress={onPress}
      left={() => (
        <Avatar.Text size={40} label={contact.name.charAt(0).toUpperCase()} />
      )}
      right={() =>
        porpuse === "call" ? (
          <>
            <Call contact={contact} disabled={disabled} />
            <DeleteContact
              contact={contact}
              disabled={disabled}
              onPress={() => removeContact(contact)}
            />
          </>
        ) : allowSelect ? (
          <Checkbox
            status={isChecked_cont ? "checked" : "unchecked"}
            onPress={onPress}
          />
        ) : null
      }
    />
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
