import React, { useEffect, useRef, useState } from "react";
import { View, AppState } from "react-native";
import {
  Avatar,
  Button,
  Colors,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { Contact } from "../../screens/HomeScreen";
import { ContactsList } from "../ContactsList";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";
import { deleteGroup, updateGroup } from "../../apis";
import AddModal from "../../screens/AddModal";

export interface GroupProps {
  id: string;
  name: string;
  contacts: Contact[];
}

export interface ContactsGroupeProps {
  groups: GroupProps[] | [];
  reFetch?: () => void;
}

const ContactsGroupe = ({ groups = [], reFetch }: ContactsGroupeProps) => {
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const [is_cycling, setIsCycling] = useState(false);
  const [checked, setChecked] = React.useState<
    ContactsGroupeProps["groups"] | []
  >([]);

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const startCallCycle = async (contacts: Contact[]) => {
    setIsCycling(true);

    for (const contact of contacts) {
      console.log(!!contact.phoneNumbers && !!contact.phoneNumbers[0].number);

      try {
        if (contact.phoneNumbers && !!contact.phoneNumbers[0].number) {
          RNImmediatePhoneCall.immediatePhoneCall(
            contact.phoneNumbers[0].number
          );
          // wait until the app is in the foreground
          await wait(3500);
          // await wait until call is finished
          while (appStateVisible !== "active") {
            await wait(2000);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
    setIsCycling(false);
  };

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  const onDeleteContact = async (group: GroupProps) => {
    await updateGroup(group.id, {
      id: group.id,
      name: group.name,
      contacts: group.contacts,
    });
    reFetch?.();
  };

  const onDeletGroup = async (group: GroupProps) => {
    await deleteGroup(group.id);
    reFetch?.();
  };

  return (
    <List.AccordionGroup>
      {groups.length > 0 &&
        groups.map((group, idx) => {
          return (
            <List.Accordion
              expanded={true}
              key={group.id}
              id={`${group.name}-${idx}`}
              title={group.name}
              left={() => <Avatar.Icon size={40} icon="account-group" />}
            >
              <>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-evenly",
                  }}
                >
                  <Button
                    icon={"phone"}
                    mode="outlined"
                    disabled={is_cycling}
                    color={Colors.green500}
                    onPress={() => startCallCycle(group.contacts)}
                  >
                    <Text>Start</Text>
                  </Button>
                  <DeleteGroup
                    disabled={is_cycling}
                    onPress={() => onDeletGroup(group)}
                    group={group}
                  />
                  <AddModal
                    group={group}
                    disabled={is_cycling}
                    reFetch={reFetch}
                  />
                </View>
                <ContactsList
                  contacts={group.contacts}
                  allowSelect={false}
                  porpuse="call"
                  is_cycling={is_cycling}
                  onSelect={(checked) =>
                    onDeleteContact({ ...group, contacts: checked })
                  }
                />
              </>
            </List.Accordion>
          );
        })}
    </List.AccordionGroup>
  );
};

const DeleteGroup = ({
  disabled,
  onPress,
  group,
}: {
  group: GroupProps;
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
            {`${group.name}`}
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
      <Button
        icon={"delete-circle"}
        mode="outlined"
        color={Colors.red500}
        disabled={disabled}
        onPress={showModal}
      >
        Delete
      </Button>
    </>
  );
};

export default ContactsGroupe;
