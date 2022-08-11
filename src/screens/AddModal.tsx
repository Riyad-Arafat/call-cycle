import * as React from "react";
import { ScrollView } from "react-native";
import { Modal, Portal, Button, Colors, TextInput } from "react-native-paper";
import { ContactsItems } from "../components/ContactsList";
import { Contact, removeDuplicatesPhone } from "./HomeScreen";
import * as Contacts from "expo-contacts";
import { GroupProps } from "../components/CntactsGroupe";
import { getGroupById, updateGroup } from "../apis";
// import { theme } from "../../App";

export const AddModal = ({
  group,
  reFetch,
  disabled,
}: {
  group: GroupProps;
  reFetch?: () => void;
  disabled: boolean;
}) => {
  const [visible, setVisible] = React.useState(false);

  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = React.useState<Contact[]>(
    group.contacts
  );
  const [text, setText] = React.useState("");

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "white", padding: 20 };
  const onSelect = (contacts: Contact[]) => {
    setSelectedContact(contacts);
  };

  const updateContacts = async () => {
    if (!!selectedContact)
      try {
        await updateGroup(group.id, {
          id: group.id,
          name: group.name,
          contacts: selectedContact,
        });
      } catch (e) {
        console.log(e);
      } finally {
        hideModal();
        reFetch?.();
      }
  };

  const getCheckedContacts = async () => {
    try {
      const data = await getGroupById(group.id);
      if (data) setSelectedContact(data.contacts);
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    (async () => {
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
          setContacts(removeDuplicatesPhone(data) || null);
        }
      }
    })();
    getCheckedContacts();
  }, []);
  return (
    <>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={{
            paddingTop: 50,
            paddingBottom: 40,
            backgroundColor: "white",
          }}
        >
          <TextInput
            label="Group name"
            value={group.name}
            onChangeText={(text) => setText(text)}
          />
          <ScrollView>
            <ContactsItems
              contacts={contacts}
              checked={selectedContact}
              allowSelect
              onSelect={onSelect}
              is_cycling={false}
            />
          </ScrollView>

          <Button
            onPress={updateContacts}
            mode="contained"
            color={Colors.green600}
          >
            Update
          </Button>
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
