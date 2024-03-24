import React, { useCallback, useEffect } from "react";
import {
  Avatar,
  List,
  Checkbox,
  MD2Colors as Colors,
  Button,
  IconButton,
} from "react-native-paper";
import StartSubCycle from "@components/Actions/StartSubCycle";
import Call from "@components/Actions/Call";
import DeleteContact from "@components/Actions/DeleteContact";
import { Contact } from "@typings/types";
import { StyleSheet, View } from "react-native";
import useGlobal from "@hooks/useGlobal";
import { useTranslation } from "@hooks/useTranslation";

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
            marginTop: 10,
            marginStart: 10,
          }}
        />
      ),
      [contact.name]
    );

    const renderRight = useCallback(() => {
      if (porpuse === "call")
        return (
          <View style={styles.buttonContainer}>
            <StartSubCycle onPress={StartSubCycleFun} contact={contact} />
            <Call contact={contact} />
            <DeleteContact
              contact={contact}
              onPress={() => removeContact(contact)}
            />
            <IconButton
              onPress={() => toggleDisable(contact)}
              // textColor={contact.disabled ? Colors.green500 : Colors.red500}
              disabled={disabled}
              style={{
                backgroundColor: !contact.disabled
                  ? Colors.grey300
                  : Colors.grey100,
                marginHorizontal: 0,
              }}
              icon={contact.disabled ? "lock" : "lock-open"}
              iconColor={!contact.disabled ? Colors.green500 : Colors.red500}
            />
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
          fontSize: 16,
          fontWeight: "bold",
        }}
        descriptionStyle={{
          fontSize: 15,
        }}
        style={{
          backgroundColor: contact.disabled ? Colors.grey300 : Colors.white,
          borderBottomWidth: 1,
          borderBottomColor: Colors.grey600,
          flexDirection: "row",
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

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "50%",
    overflow: "hidden",
    gap: 5,
  },
});
