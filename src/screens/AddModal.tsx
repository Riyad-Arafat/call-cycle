import * as React from "react";
import { ScrollView, StatusBar } from "react-native";
import { Modal, Portal, Button, Colors, TextInput } from "react-native-paper";
import { ContactsList } from "../components/ContactsList";
import { Contact, removeDuplicatesPhone, search_fun } from "./HomeScreen";
import * as Contacts from "expo-contacts";
import { GroupProps } from "../components/CntactsGroupe";
import { getGroupById, updateGroup } from "../apis";
import Loading from "../components/Loading";
import Searchbar from "../components/Searchbar";
import { useGlobal } from "../context/Global";

export const AddModal = ({
  group,
  onUpdate,
  disabled,
}: {
  group: GroupProps;
  onUpdate?: (data: GroupProps) => void;
  disabled: boolean;
}) => {
  const [visible, setVisible] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [initialContacts, setInitialContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact[]>([]);
  const [text, setText] = React.useState(group.name);
  const { search_value, handel_search_value } = useGlobal();
  const [search_result, setsearch_result] = React.useState<Contact[]>([]);

  const showModal = () => setVisible(true);
  const hideModal = () => {
    setVisible(false);
    setSelectedContact([]);
    setInitialContacts([]);
    handel_search_value("");
    setLoading(false);
  };
  const onSelect = (contacts: Contact[]) => {
    setSelectedContact(contacts);
  };

  const updateContacts = async () => {
    if (!!selectedContact) setLoading(true);
    try {
      const data = await updateGroup(group.id, {
        id: group.id,
        name: text,
        contacts: selectedContact,
      });
      onUpdate?.(data);
    } catch (e) {
      console.log(e);
    } finally {
      hideModal();
    }
  };

  const getCheckedContacts = async () => {
    try {
      const data = await getGroupById(group.id);
      if (data) setInitialContacts(data.contacts);
    } catch (error) {
      console.log(error);
    }
  };

  const importContects = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [
          Contacts.Fields.FirstName,
          Contacts.Fields.LastName,
          Contacts.Fields.PhoneNumbers,
        ],
      });

      if (data.length > 0) {
        let { data: vals } = await removeDuplicatesPhone(data);
        setContacts(vals);
      }
    }
  };

  const prepareState = React.useCallback(async () => {
    if (visible) {
      setLoading(true);
      await importContects();
      await getCheckedContacts();

      setLoading(false);
    }
  }, [visible]);

  React.useEffect(() => {
    // Call only when screen open or when back on screen
    prepareState();
  }, [prepareState]);

  React.useEffect(() => {
    if (!!search_value) {
      setsearch_result(search_fun(search_value, contacts));
    } else setsearch_result(contacts);
  }, [search_value]);
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
              <ScrollView>
                <ContactsList
                  contacts={!!search_value ? search_result : contacts}
                  checked={initialContacts}
                  allowSelect
                  onSelect={onSelect}
                  is_cycling={false}
                />
              </ScrollView>

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
