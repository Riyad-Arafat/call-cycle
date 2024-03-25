import React, { useCallback, useMemo } from "react";
import {
  Avatar,
  List,
  Checkbox,
  MD2Colors as Colors,
  IconButton,
} from "react-native-paper";
import StartSubCycle from "@components/Actions/StartSubCycle";
import Call from "@components/Actions/Call";
import DeleteContact from "@components/Actions/DeleteContact";
import { Contact } from "@typings/types";
import { StyleSheet, View } from "react-native";
import useGlobal from "@hooks/useGlobal";

interface Props {
  contact: Contact;
  isChecked: boolean;
  onPress?: (contact: Contact) => void;
  disabled?: boolean;
}

const EditableListItem = React.memo(
  ({ contact, onPress, isChecked, disabled: passedDisabled }: Props) => {
    const { on_opreation } = useGlobal();
    const [value, setValue] = React.useState(isChecked);

    const disabled = useMemo(() => {
      if (on_opreation) return true;
      return passedDisabled && !isChecked;
    }, [on_opreation, passedDisabled, isChecked]);

    const handelOnPress = useCallback(() => {
      if (disabled) {
        return;
      } else {
        setValue((prev) => !prev);
        onPress?.(contact);
      }
    }, [contact, disabled, onPress]);

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
      return (
        <Checkbox
          status={value ? "checked" : "unchecked"}
          onPress={handelOnPress}
          disabled={disabled}
        />
      );
    }, [disabled, handelOnPress, value]);

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
          backgroundColor:
            contact.disabled || disabled ? Colors.grey300 : Colors.white,
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
    return (
      prevProps.isChecked === nextProps.isChecked &&
      prevProps.disabled === nextProps.disabled &&
      prevProps.contact.phoneNumbers[0].number ===
        nextProps.contact.phoneNumbers[0].number &&
      prevProps.contact.disabled === nextProps.contact.disabled
    );
  }
);

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

interface ViewListItem {
  contact: Contact;
  removeContact: (contact: Contact) => void;
  StartSubCycle?: () => void;
  toggleDisable: (contact: Contact) => void;
}

const ListItemView = React.memo(
  ({
    contact,
    removeContact,
    StartSubCycle: StartSubCycleFun,
    toggleDisable,
  }: ViewListItem) => {
    const { on_opreation: disabled } = useGlobal();

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
    }, [StartSubCycleFun, contact, disabled, removeContact, toggleDisable]);

    return (
      <List.Item
        title={contact.name}
        description={
          contact.phoneNumbers ? contact.phoneNumbers[0]?.number : ""
        }
        titleStyle={{
          fontSize: 16,
          fontWeight: "bold",
        }}
        descriptionStyle={{
          fontSize: 15,
        }}
        style={{
          backgroundColor:
            contact.disabled || disabled ? Colors.grey300 : Colors.white,
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
    return (
      prevProps.contact.phoneNumbers[0].number ===
        nextProps.contact.phoneNumbers[0].number &&
      prevProps.contact.disabled === nextProps.contact.disabled
    );
  }
);

export const ListItem = {
  Editable: EditableListItem,
  View: ListItemView,
};

export default ListItem;
