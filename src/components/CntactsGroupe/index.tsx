import React, { useState, memo } from "react";
import { View } from "react-native";
import {
  Avatar,
  Button,
  Colors,
  List,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { Contact } from "../../typings/types";
import { ContactsList } from "../ContactsList";
import AddModal from "../../screens/AddModal";
import { useGlobal } from "../../context/Global";

export interface GroupProps {
  id: string;
  name: string;
  contacts: Contact[];
}

const ContactsGroupe = memo(() => {
  const {
    updateGroup,
    groupes,
    startCallCycle: makeCalls,
    is_cycling,
  } = useGlobal();

  const startCallCycle = async (contacts: Contact[]) => {
    await makeCalls(contacts);
  };

  const onDeleteContact = async (group: GroupProps) => {
    updateGroup(group);
  };

  return (
    <List.AccordionGroup>
      {groupes.length > 0 &&
        groupes.map((group, idx) => {
          return (
            <List.Accordion
              expanded={true}
              key={group.id}
              id={`${group.name}-${idx}`}
              title={group.name}
              titleStyle={{
                color: Colors.black,
                fontSize: 20,
                fontWeight: "bold",
              }}
              left={() => (
                <Avatar.Icon
                  size={40}
                  icon="account-group"
                  color={Colors.white}
                  style={{ backgroundColor: Colors.lightBlue900 }}
                />
              )}
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
                  <DeleteGroup disabled={is_cycling} group={group} />
                  <AddModal group={group} disabled={is_cycling} />
                </View>
                <ContactsList
                  contacts={group.contacts}
                  allowSelect={false}
                  porpuse="call"
                  onSelect={async (checked) =>
                    await onDeleteContact({ ...group, contacts: checked })
                  }
                />
              </>
            </List.Accordion>
          );
        })}
    </List.AccordionGroup>
  );
});

const DeleteGroup = ({
  disabled,
  group,
}: {
  group: GroupProps;
  disabled: boolean;
}) => {
  const [visible, setVisible] = React.useState(false);
  const { deleteGroup, updateGroup, groupes } = useGlobal();

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleDelete = () => {
    deleteGroup(group.id);
    hideModal();
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
