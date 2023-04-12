import * as React from "react";
import {
  Modal,
  Portal,
  Button,
  MD2Colors as Colors,
  TextInput,
  Text,
} from "react-native-paper";
import { ContactsList } from "@components/ContactsList";
import { getGroupById } from "@apis/index";
import Loading from "@components/Loading";
import Searchbar from "@components/Searchbar";
import { useGlobal } from "@hooks/useGlobal";
import { Contact } from "@typings/types";
import { IGroup } from "@typings/group";

interface DefaultProps {
  onDismiss?: () => void;
  onSucess?: () => void;
}

type Props = DefaultProps &
  ({ group: IGroup; type: "upadte" } | { type: "create" });

export const GroupForm = React.memo(
  ({ onDismiss, onSucess, ...props }: Props) => {
    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [initialContacts, setInitialContacts] = React.useState<Contact[]>([]);
    const [selectedContact, setSelectedContact] = React.useState<Contact[]>([]);
    const [text, setText] = React.useState(
      props.type === "upadte" ? props.group.name : ""
    );
    const {
      contacts,
      updateGroup,
      addGroup,
      handel_search_value,
      on_opreation,
    } = useGlobal();

    const onSelect = (contacts: Contact[]) => {
      setSelectedContact(contacts);
    };

    const onHidden = () => {
      handel_search_value("");
      setText("");
      hideModal();
    };

    const storeData = async () => {
      if (selectedContact) setLoading(true);
      if (props.type === "create") addGroup(text, selectedContact);
      onHidden();
    };

    const updateContacts = async () => {
      if (selectedContact) setLoading(true);
      if (props.type === "upadte")
        updateGroup(
          {
            id: props.group.id,
            name: text,
            contacts: selectedContact,
          },
          onSucess
        );
      onHidden();
    };

    const getCheckedContacts = React.useCallback(async () => {
      try {
        const data = await getGroupById(
          props.type === "upadte" ? props.group.id : ""
        );
        if (data) setInitialContacts(data.contacts);
      } catch (error) {
        console.log(error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type]);

    const prepareState = React.useCallback(async () => {
      if (visible) {
        await getCheckedContacts().finally(() => setLoading(false));
      }
    }, [getCheckedContacts, visible]);

    const onSubmit = () => {
      if (props.type === "create") storeData();
      else updateContacts();
    };

    React.useEffect(() => {
      // Call only when screen open or when back on screen
      prepareState();
    }, [prepareState]);

    const openModal = React.useCallback(() => {
      setVisible(true);
    }, []);

    const hideModal = React.useCallback(() => {
      setVisible(false);
      onDismiss?.();
    }, [onDismiss]);

    return (
      <>
        <Button
          icon={
            props.type === "create" ? "account-multiple-plus" : "pencil-outline"
          }
          mode="outlined"
          disabled={on_opreation}
          onPress={openModal}
        >
          <Text>{props.type === "create" ? "Create group" : "Edit"}</Text>
        </Button>
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
  }
);
