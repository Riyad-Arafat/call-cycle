import React from "react";
import { PermissionsAndroid } from "react-native";
import { Contact, removeDuplicatesPhone } from "../screens/HomeScreen";
import * as Contacts from "expo-contacts";

interface Props {
  handel_search_value: (s: string) => void;
  search_value: string;
  contacts: Contact[];
}

const GlobalContext = React.createContext<Props>({
  search_value: "",
  contacts: [],
  handel_search_value: (s) => console.log("s", s),
});

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [search_value, set_search_value] = React.useState("");
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);

  const handel_search_value = (val: string) => set_search_value(val);

  const getPerms = async () => {
    await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CALL_PHONE,
      {
        title: "Contacts",
        message: "This app would like to view your contacts.",
        buttonPositive: "OK",
        buttonNeutral: "Cancel",
        buttonNegative: "Deny",
      }
    ).finally(async () => await importContects());
  };

  const importContects = async () => {
    setLoading(true);
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

    if (loading) setLoading(false);
  };

  React.useEffect(() => {
    getPerms();
  }, []);

  return (
    <GlobalContext.Provider
      value={{ handel_search_value, search_value, contacts }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => React.useContext(GlobalContext);

export default GlobalProvider;
