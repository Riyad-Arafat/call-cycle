import React, { useCallback, useMemo } from "react";
import {
  Avatar,
  List,
  Checkbox,
  MD2Colors as Colors,
  Button,
} from "react-native-paper";
import StartSubCycle from "@components/Actions/StartSubCycle";
import Call from "@components/Actions/Call";
import DeleteContact from "@components/Actions/DeleteContact";
import { Contact } from "@typings/types";
import { View } from "react-native";

interface Props {
  contact: Contact;
  disabled: boolean;
  isChecked: boolean;
  removeContact: (contact: Contact) => void;
  porpuse: "call" | "select";
  allowSelect: boolean;
  onPress?: (contact: Contact) => void;
  StartSubCycle?: () => void;
  toggleDisable: (contact: Contact) => void;
}

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
    toggleDisable,
  }: Props) => {
    const handelOnPress = useCallback(() => {
      if (porpuse === "select" && allowSelect) onPress?.(contact);
    }, [allowSelect, contact, onPress, porpuse]);

    const renderLeft = () => (
      <Avatar.Text
        size={30}
        label={contact.name.charAt(0).toUpperCase()}
        style={{
          backgroundColor: Colors.grey600,
        }}
      />
    );

    const renderRight = useMemo(() => {
      if (porpuse === "call")
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "50%",
            }}
          >
            <StartSubCycle disabled={disabled} onPress={StartSubCycleFun} />
            <Call contact={contact} disabled={disabled} />
            <DeleteContact
              contact={contact}
              disabled={disabled}
              onPress={() => removeContact(contact)}
            />
            <Button
              onPress={() => toggleDisable(contact)}
              textColor={contact.disabled ? Colors.green500 : Colors.red500}
              style={{ marginHorizontal: 0 }}
              disabled={disabled}
            >
              {contact.disabled ? "Enable" : "Disable"}
            </Button>
          </View>
        );

      if (porpuse === "select" && allowSelect)
        return (
          <Checkbox
            status={isChecked ? "checked" : "unchecked"}
            onPress={handelOnPress}
          />
        );

      return <></>;
    }, [
      StartSubCycleFun,
      allowSelect,
      contact,
      disabled,
      handelOnPress,
      isChecked,
      porpuse,
      removeContact,
      toggleDisable,
    ]);

    return (
      <List.Item
        title={contact.name}
        description={
          contact.phoneNumbers ? contact.phoneNumbers[0]?.number : ""
        }
        onPress={handelOnPress}
        titleStyle={{
          fontSize: 15,
          fontWeight: "bold",
        }}
        style={{
          backgroundColor: contact.disabled ? Colors.grey300 : Colors.white,
          paddingStart: 20,
        }}
        left={renderLeft}
        right={() => renderRight}
      />
    );
  },
  (prevProps, nextProps) => {
    const change =
      prevProps.allowSelect !== nextProps.allowSelect ||
      prevProps.isChecked !== nextProps.isChecked ||
      prevProps.disabled !== nextProps.disabled ||
      prevProps.contact.disabled !== nextProps.contact.disabled ||
      prevProps.contact.phoneNumbers[0].number !==
        nextProps.contact.phoneNumbers[0].number;

    return !change;
  }
);

export default ListItem;
