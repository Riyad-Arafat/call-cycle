import React from "react";
import { AppState, PermissionsAndroid } from "react-native";
import { Contact } from "../typings/types";
import * as Contacts from "expo-contacts";
import { search_fun, sortContacts } from "../utils";
import Loading from "../components/Loading";
import {
  deleteGroup as deleteGroupAPI,
  setContactsGroups,
  updateGroup as updateGroupAPI,
} from "../apis";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";
import { IGroup } from "@typings/group";

interface Props {
  handel_search_value: (s: string) => void;
  search_value: string;
  contacts: Contact[];
  groupes: IGroup[];
  updateGroup: (group: IGroup, callback?: () => void) => void;
  deleteGroup: (group_id: string, callback?: () => void) => void;
  addGroup: (name: string, contacts: Contacts.Contact[]) => void;
  setGroupes: (groupes: IGroup[]) => void;
  startCallCycle: (contacts: Contact[]) => Promise<void>;
  is_cycling: boolean;
}

export const GlobalContext = React.createContext<Props>({
  search_value: "",
  contacts: [],
  groupes: [],
  handel_search_value: (s) => console.log("s", s),
  updateGroup: async () => console.log("aa"),
  deleteGroup: async () => console.log("ss"),
  addGroup: () => console.log("ss"),
  setGroupes: () => console.log("ss"),
  startCallCycle: async () => console.log("ss"),
  is_cycling: false,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [search_value, set_search_value] = React.useState("");
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [search_result, setsearch_result] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [is_cycling, setIsCycling] = React.useState(false);

  const [groupes, setGroupes] = React.useState<IGroup[]>([]);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current
  );

  const addGroup = async (name: string, contacts: Contacts.Contact[]) => {
    setIsCycling(true);
    await setContactsGroups(name, contacts)
      .then((group) => {
        if (group) setGroupes((prev) => [...prev, group]);
      })
      .then(() => {
        setIsCycling(false);
      });
  };

  const updateGroup = async (group: IGroup, callback?: () => void) => {
    try {
      setIsCycling(true);
      await updateGroupAPI(group.id, {
        ...group,
        contacts: [...group.contacts],
      });
      setGroupes((prevGroups) => {
        const groupIndex = prevGroups.findIndex((g) => g.id === group.id);
        const updatedGroups = [...prevGroups];
        if (groupIndex !== -1) {
          updatedGroups[groupIndex] = group;
        }
        return updatedGroups;
      });
      callback?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsCycling(false);
    }
  };

  const deleteGroup = async (group_id: string, callback?: () => void) => {
    await deleteGroupAPI(group_id)
      .then(() => {
        setGroupes((prev) => {
          const newgroupes = [...prev];
          const index = newgroupes.findIndex((g) => g.id === group_id);
          if (index !== -1) newgroupes.splice(index, 1);
          return newgroupes;
        });
      })
      .finally(() => {
        callback?.();
      });
  };

  const handel_search_value = (val: string) => set_search_value(val);

  const getPerms = async () => {
    if (!loading) setLoading(true);
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
    if (loading) setLoading(false);
  };

  const importContects = async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        const sortedContacts = await sortContacts(data);
        setContacts(sortedContacts);
      }
    }
  };

  const startCallCycle = async (contacts: Contact[]) => {
    setIsCycling(true);
    for (const contact of contacts) {
      try {
        if (
          contact.phoneNumbers &&
          !!contact.phoneNumbers[0].number &&
          !contact.disabled
        ) {
          RNImmediatePhoneCall.immediatePhoneCall(
            contact.phoneNumbers[0].number
          );
          // wait until the app is in the foreground
          await wait(5000);
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

  React.useEffect(() => {
    getPerms();
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handel_search = React.useCallback(() => {
    if (search_value.length > 0)
      setsearch_result(search_fun(contacts, search_value));
    else setsearch_result(contacts);
  }, [search_value, contacts]);

  React.useEffect(() => {
    handel_search();
  }, [handel_search]);

  if (loading) return <Loading />;
  return (
    <GlobalContext.Provider
      value={{
        handel_search_value,
        search_value,
        contacts: search_value ? search_result : contacts,
        groupes,
        updateGroup,
        deleteGroup,
        addGroup,
        setGroupes,
        startCallCycle,
        is_cycling,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
