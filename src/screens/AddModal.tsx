import * as React from "react";
import { StatusBar } from "react-native";
import { Modal, Portal, Button, Colors, TextInput } from "react-native-paper";
import { ContactsList } from "../components/ContactsList";
import { GroupProps } from "../components/CntactsGroupe";
import { getGroupById } from "../apis";
import Loading from "../components/Loading";
import Searchbar from "../components/Searchbar";
import { useGlobal } from "../context/Global";
import { Contact } from "../typings/types";

export const AddModal = ({
  group,
  disabled,
}: {
  group: GroupProps;
  disabled: boolean;
}) => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [initialContacts, setInitialContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact[]>([]);
  const [text, setText] = React.useState(group.name);
  const { handel_search_value } = useGlobal();
  const { contacts, updateGroup } = useGlobal();

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setSelectedContact([]);
    setInitialContacts([]);
    handel_search_value("");
    setLoading(true); // reset loading state when close modal to prevent lagging when open again
  };
  const onSelect = (contacts: Contact[]) => {
    setSelectedContact(contacts);
  };

  const updateContacts = async () => {
    if (!!selectedContact) setLoading(true);
    updateGroup({
      id: group.id,
      name: text,
      contacts: selectedContact,
    });
    hideModal();
  };

  const getCheckedContacts = async () => {
    try {
      const data = await getGroupById(group.id);
      if (data) setInitialContacts(data.contacts);
    } catch (error) {
      console.log(error);
    }
  };

  const prepareState = React.useCallback(async () => {
    if (visible) {
      await getCheckedContacts().finally(() => setLoading(false));
    }
  }, [visible]);

  React.useEffect(() => {
    // Call only when screen open or when back on screen
    prepareState();
  }, [prepareState]);

  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            paddingVertical: StatusBar.currentHeight,
            paddingBottom: 40,
            backgroundColor: "white",
            minHeight: "100%",
          }}
        >
          {!loading ? (
            <>
              <TextInput
                label="Group name"
                value={group.name}
                onChangeText={(text) => setText(text)}
                style={{ marginBottom: 5 }}
              />
              <Searchbar />
              <ContactsList
                contacts={contacts}
                checked={initialContacts}
                allowSelect
                onSelect={onSelect}
              />

              <Button
                onPress={updateContacts}
                mode="contained"
                color={Colors.green600}
                style={{ paddingVertical: 10 }}
              >
                Update
              </Button>
            </>
          ) : (
            <Loading />
          )}
        </Modal>
      </Portal>
      <Button
        icon={"update"}
        mode="outlined"
        color={Colors.blueA400}
        onPress={showModal}
        disabled={disabled}
      >
        Update
      </Button>
    </>
  );
};

export default AddModal;
