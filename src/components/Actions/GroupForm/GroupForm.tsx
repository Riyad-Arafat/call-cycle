import * as React from "react";
import {
  Modal,
  Portal,
  MD2Colors as Colors,
  TextInput,
  Text,
} from "react-native-paper";
import Button from "react-native-paper/src/components/Button/Button";
import { ContactsList } from "@components/ContactsList";
import { getGroupById } from "@apis/index";
import Loading from "@components/Loading";
import Searchbar from "@components/Searchbar";
import { useGlobal } from "@hooks/useGlobal";
import { Contact, plans } from "@typings/types";
import { IGroup } from "@typings/group";
import { useCallback } from "react";
import { search_fun } from "@utils/index";
import { FlatList, View } from "react-native";
import { useTranslation } from "@hooks/useTranslation";
import { useSession } from "@context/Session";
import PlanSubscriptionModal from "@components/PlanSubscriptionModal";

interface DefaultProps {
  onDismiss?: () => void;
  onSucess?: () => void;
}

type Props = DefaultProps &
  ({ group: IGroup; type: "upadte" } | { type: "create" });

export const GroupForm = React.memo(
  ({ onDismiss, onSucess, ...props }: Props) => {
    const { t } = useTranslation();
    const [step, setStep] = React.useState(1);
    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [selectedContact, setSelectedContact] = React.useState<Contact[]>([]);
    const [text, setText] = React.useState("");
    const {
      contacts: importedContacts,
      updateGroup,
      addGroup,
      on_opreation,
      groups_count,
    } = useGlobal();

    const { user } = useSession();

    const { isAbleToAddGroup, isAbleToAddMoreContacts } = React.useMemo(() => {
      const res = {
        isAbleToAddGroup: false,
        isAbleToAddMoreContacts: false,
      };
      if (user?.plan) {
        const plan = plans[user.plan.name ?? "Free"];
        console.log("User Plan FROM GROUP FORM:", user?.plan.name);
        console.log("Plan FROM GROUP FORM:", plan);
        console.log("Groups Count FROM GROUP FORM:", groups_count);
        console.log(
          "Selected Contact FROM GROUP FORM:",
          selectedContact.length
        );

        res.isAbleToAddGroup = plan.max_groups > groups_count;
        res.isAbleToAddMoreContacts =
          plan.max_contacts_per_group > selectedContact.length;
      }
      return res;
    }, [groups_count, selectedContact.length, user.plan]);
    const [contacts, setContacts] = React.useState<Contact[]>(importedContacts);

    React.useEffect(() => {
      if (props.type === "create") {
        setText("");
      } else {
        setText(props.group.name);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type]);

    const onHidden = () => {
      setText("");
      hideModal();
    };

    const storeData = useCallback(async () => {
      if (selectedContact) setLoading(true);
      if (props.type === "create") await addGroup(text, selectedContact);
      onSucess?.();
      onHidden();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type, selectedContact, text]);

    const updateContacts = useCallback(async () => {
      if (selectedContact) setLoading(true);
      if (props.type === "upadte")
        await updateGroup({
          id: props.group.id,
          name: text,
          contacts: selectedContact,
        });
      onSucess?.();
      onHidden();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.type, selectedContact, text]);

    const getCheckedContacts = React.useCallback(async () => {
      try {
        const data = await getGroupById(
          props.type === "upadte" ? props.group.id : ""
        );
        if (data) setSelectedContact(data.contacts);
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

    const onSubmit = useCallback(() => {
      if (props.type === "create") storeData();
      else updateContacts();
      setStep(1);
    }, [props.type, storeData, updateContacts]);

    React.useEffect(() => {
      // Call only when screen open or when back on screen
      prepareState();
    }, [prepareState]);

    const openModal = React.useCallback(() => {
      if (!isAbleToAddGroup && props.type === "create") {
        setPlanModalVisible(true);
        return;
      }
      setVisible(true);
    }, [isAbleToAddGroup, props.type]);

    const hideModal = React.useCallback(() => {
      setVisible(false);
      setPlanModalVisible(false);
      onDismiss?.();
      setText("");
      setSelectedContact([]);
    }, [onDismiss]);

    const onSearch = useCallback(
      (val?: string) => {
        if (val && val.length > 0)
          setContacts(search_fun(importedContacts, val));
        else setContacts(importedContacts);
      },
      [importedContacts]
    );

    const onCheck = useCallback((contact: Contact) => {
      setSelectedContact((prevSelectedContact) => {
        let newChecked = [...prevSelectedContact];
        const isChecked = newChecked.find((c) => {
          if (c.phoneNumbers && contact.phoneNumbers)
            return c.phoneNumbers[0].number === contact.phoneNumbers[0].number;
          return false;
        });
        if (isChecked) {
          newChecked = newChecked.filter((c) => {
            if (c.phoneNumbers && contact.phoneNumbers)
              return (
                c.phoneNumbers[0].number !== contact.phoneNumbers[0].number
              );
            return true;
          });
        } else {
          newChecked.push(contact);
        }
        return newChecked;
      });
    }, []);

    const nextStep = useCallback(() => setStep((prevStep) => prevStep + 1), []);
    const prevStep = useCallback(() => setStep((prevStep) => prevStep - 1), []);

    const Buttons = React.useMemo(() => {
      return (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            borderBlockStartColor: "#ccc",
            borderTopWidth: 1,
            padding: 10,
          }}
        >
          <Button
            onPress={step === 1 ? hideModal : prevStep}
            style={{ marginRight: 5 }}
            mode="contained"
            buttonColor={Colors.red500}
          >
            {step === 1 ? t("Cancel") : t("Back")}
          </Button>
          <Button
            onPress={step === 3 ? onSubmit : nextStep}
            mode="contained"
            buttonColor={Colors.green500}
            disabled={
              (step === 2 && text.length === 0) ||
              (step === 1 && selectedContact.length === 0)
            }
          >
            {step === 3
              ? props.type === "create"
                ? t("Create")
                : t("Update")
              : t("Next")}
          </Button>
        </View>
      );
    }, [
      hideModal,
      nextStep,
      onSubmit,
      prevStep,
      props.type,
      selectedContact.length,
      step,
      t,
      text.length,
    ]);

    const ContactsView = React.useMemo(() => {
      return (
        <FlatList
          data={selectedContact}
          renderItem={({ item }) => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                padding: 10,
                borderBottomColor: "#ccc",
                borderBottomWidth: 1,
              }}
            >
              <Text
                style={{
                  direction: "ltr",
                  textAlign: "center",
                  padding: 10,
                }}
              >
                {item.name}
              </Text>
              <Text style={{ direction: "ltr", textAlign: "center" }}>
                {item.phoneNumbers[0].number}
              </Text>
            </View>
          )}
          keyExtractor={(item) =>
            `${item.id}-${item.name}-${item.phoneNumbers[0].number}`
          }
        />
      );
    }, [selectedContact]);

    const [isPlanModalVisible, setPlanModalVisible] = React.useState(false);

    return (
      <>
        <Button
          icon={
            props.type === "create" ? "account-multiple-plus" : "pencil-outline"
          }
          mode="outlined"
          disabled={on_opreation}
          onPress={openModal}
          buttonColor={isAbleToAddGroup ? Colors.lightBlue700 : Colors.grey200}
          textColor={isAbleToAddGroup ? Colors.white : Colors.grey600}
        >
          {props.type === "create" ? t("ADD_GROUP") : t("EDIT")}
        </Button>

        <PlanSubscriptionModal
          isVisible={isPlanModalVisible}
          onClose={hideModal}
        />
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={{
              padding: 10,
              backgroundColor: "white",
              width: "100%",
              alignSelf: "center",
              flex: 1,
              justifyContent: "space-between",
            }}
          >
            {!loading ? (
              <>
                {step === 1 && (
                  <>
                    <Searchbar onChangeText={onSearch} />
                    <ContactsList.Selector
                      contactsList={contacts}
                      selectedContacts={selectedContact || []}
                      onCheck={onCheck}
                      isAbleToAddMoreContacts={isAbleToAddMoreContacts}
                    />
                    {Buttons}
                  </>
                )}
                {step === 2 && (
                  <>
                    <TextInput
                      label={t("GROUP_NAME")}
                      value={text}
                      onChangeText={(text) => setText(text)}
                      style={{ marginBottom: 5 }}
                    />
                    {ContactsView}
                    {Buttons}
                  </>
                )}
                {step === 3 && (
                  <>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: 10,
                        borderBottomColor: "#ccc",
                        borderBottomWidth: 1,
                        paddingBottom: 15,
                      }}
                    >
                      <Text
                        style={{
                          direction: "ltr",
                          textAlign: "center",
                          padding: 10,
                          fontSize: 18,
                        }}
                      >
                        {t("GROUP_NAME")}: {text}
                      </Text>
                      <Text
                        style={{
                          direction: "ltr",
                          textAlign: "center",
                          fontSize: 18,
                        }}
                      >
                        {t("Count")}: {selectedContact.length}
                      </Text>
                    </View>
                    {ContactsView}
                    {Buttons}
                  </>
                )}
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
