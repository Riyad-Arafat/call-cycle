import React, { useCallback, useEffect } from "react";
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
import useGlobal from "@hooks/useGlobal";

interface Props {
  contact: Contact;
  isChecked: boolean;
  removeContact: (contact: Contact) => void;
  porpuse: "call" | "select";
  onPress?: (contact: Contact) => void;
  StartSubCycle?: () => void;
  toggleDisable: (contact: Contact) => void;
}

const ListItem = React.memo(
  ({
    contact,
    removeContact,
    porpuse,
    onPress,
    isChecked,
    StartSubCycle: StartSubCycleFun,
    toggleDisable,
  }: Props) => {
    const { on_opreation: disabled } = useGlobal();
    const [value, setValue] = React.useState(isChecked);
    const handelOnPress = useCallback(() => {
      if (porpuse === "select") {
        setValue((prev) => !prev);
        onPress?.(contact);
      }
    }, [contact, onPress, porpuse]);

    useEffect(() => {
      setValue(isChecked);
    }, [isChecked]);

    const renderLeft = useCallback(
      () => (
        <Avatar.Text
          size={30}
          label={contact.name.charAt(0).toUpperCase()}
          style={{
            backgroundColor: Colors.grey600,
          }}
        />
      ),
      [contact.name]
    );

    const renderRight = useCallback(() => {
      if (porpuse === "call")
        return (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              width: "50%",
            }}
          >
            <StartSubCycle onPress={StartSubCycleFun} />
            <Call contact={contact} />
            <DeleteContact
              contact={contact}
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

      if (porpuse === "select")
        return (
          <Checkbox
            status={value ? "checked" : "unchecked"}
            onPress={handelOnPress}
            disabled={disabled}
          />
        );

      return <></>;
    }, [
      StartSubCycleFun,
      contact,
      disabled,
      handelOnPress,
      porpuse,
      removeContact,
      toggleDisable,
      value,
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
        right={renderRight}
      />
    );
  },
  (prevProps, nextProps) => {
    const change =
      prevProps.isChecked !== nextProps.isChecked ||
      prevProps.contact.disabled !== nextProps.contact.disabled ||
      prevProps.contact.phoneNumbers[0].number !==
        nextProps.contact.phoneNumbers[0].number ||
      prevProps.contact.name !== nextProps.contact.name;

    return !change;
  }
);

export default ListItem;
