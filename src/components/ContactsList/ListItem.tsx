import React from "react";
import {
  Avatar,
  List,
  Checkbox,
  MD2Colors as Colors,
} from "react-native-paper";
import StartSubCycle from "@components/Actions/StartSubCycle";
import Call from "@components/Actions/Call";
import DeleteContact from "@components/Actions/DeleteContact";
import { Contact } from "@typings/types";

const ListItem = React.memo(
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

export default ListItem;
