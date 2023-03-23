import * as React from "react";
import { StatusBar } from "react-native";
import {
  Modal,
  Portal,
  Button,
  MD2Colors as Colors,
  TextInput,
} from "react-native-paper";
import { ContactsList } from "@components/ContactsList";
import { GroupProps } from "@components/CntactsGroupe";
import { getGroupById } from "@apis/index";
import Loading from "@components/Loading";
import Searchbar from "@components/Searchbar";
import { useGlobal } from "@context/Global";
import { Contact } from "@typings/types";

interface DefaultProps {
  visible: boolean;
  hideModal: () => void;
}

type Props = DefaultProps &
  ({ group: GroupProps; type: "upadte" } | { type: "create" });

export const GroupForm = ({ visible, hideModal, ...props }: Props) => {
  const [loading, setLoading] = React.useState(true);
  const [initialContacts, setInitialContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact[]>([]);
  const [text, setText] = React.useState(
    props.type === "upadte" ? props.group.name : ""
  );
  const { contacts, updateGroup, addGroup, handel_search_value } = useGlobal();

  const onSelect = (contacts: Contact[]) => {
    setSelectedContact(contacts);
  };

  const onHidden = () => {
    handel_search_value("");
    setText("");
    hideModal();
  };

  const storeData = async () => {
    if (!!selectedContact) setLoading(true);
    if (props.type === "create") addGroup(text, selectedContact);
    onHidden();
  };

  const updateContacts = async () => {
    if (!!selectedContact) setLoading(true);
    if (props.type === "upadte")
      updateGroup({
        id: props.group.id,
        name: text,
        contacts: selectedContact,
      });
    onHidden();
  };

  const getCheckedContacts = async () => {
    try {
      const data = await getGroupById(
        props.type === "upadte" ? props.group.id : ""
      );
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

  const onSubmit = () => {
    if (props.type === "create") storeData();
    else updateContacts();
  };

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
            padding: 20,
            backgroundColor: "white",
            width: "95%",
            marginHorizontal: "10%",
            marginVertical: "4%",
            alignSelf: "center",

            flex: 1,
          }}
        >
          {!loading ? (
            <>
              <TextInput
                label="Group name"
                value={text}
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
                onPress={onSubmit}
                mode="contained"
                buttonColor={Colors.green600}
                style={{ paddingVertical: 10 }}
              >
                {props.type === "create" ? "Create" : "Update"}
              </Button>

              <Button
                onPress={onHidden}
                mode="outlined"
                style={{ paddingVertical: 10, marginTop: 10 }}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Loading />
          )}
        </Modal>
      </Portal>
    </>
  );
};

export default GroupForm;
