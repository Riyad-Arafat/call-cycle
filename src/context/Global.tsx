import React, { useCallback } from "react";
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
  contacts: Contact[];
  groupes: IGroup[];
  updateGroup: (group: IGroup, callback?: () => void) => void;
  deleteGroup: (group_id: string, callback?: () => void) => void;
  addGroup: (name: string, contacts: Contacts.Contact[]) => void;
  setGroupes: (groupes: IGroup[]) => void;
  startCallCycle: (contacts: Contact[]) => Promise<void>;
  on_opreation: boolean;
}

export const GlobalContext = React.createContext<Props>({
  contacts: [],
  groupes: [],
  handel_search_value: (s) => console.log("s", s),
  updateGroup: async () => console.log("aa"),
  deleteGroup: async () => console.log("ss"),
  addGroup: () => console.log("ss"),
  setGroupes: () => console.log("ss"),
  startCallCycle: async () => console.log("ss"),
  on_opreation: false,
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const search_value = React.useRef("");
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [search_result, setsearch_result] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [on_opreation, set_on_opreation] = React.useState(false);

  const [groupes, setGroupes] = React.useState<IGroup[]>([]);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current
  );

  const addGroup = async (name: string, contacts: Contacts.Contact[]) => {
    set_on_opreation(true);
    try {
      const group = await setContactsGroups(name, contacts);
      setGroupes((prev) => [...prev, group]);
    } catch (error) {
      console.error(error);
    } finally {
      set_on_opreation(false);
    }
  };

  const updateGroup = async (group: IGroup, callback?: () => void) => {
    try {
      set_on_opreation(true);
      const newGroup = await updateGroupAPI(group.id, {
        ...group,
        contacts: [...group.contacts],
      });
      setGroupes((prevGroups) => {
        const groupIndex = prevGroups.findIndex((g) => g.id === newGroup.id);
        const updatedGroups = [...prevGroups];
        if (groupIndex !== -1) {
          updatedGroups[groupIndex] = newGroup;
        }
        return updatedGroups;
      });
      callback?.();
    } catch (error) {
      console.error(error);
    } finally {
      set_on_opreation(false);
    }
  };

  const deleteGroup = async (group_id: string, callback?: () => void) => {
    try {
      await deleteGroupAPI(group_id);
      setGroupes((prev) => {
        const newgroupes = [...prev];
        const index = newgroupes.findIndex((g) => g.id === group_id);
        if (index !== -1) newgroupes.splice(index, 1);
        return newgroupes;
      });
      callback?.();
    } catch (error) {
      console.error(error);
    }
  };

  const getPermissions = useCallback(async () => {
    setLoading(true);
    try {
      await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CALL_PHONE,
        {
          title: "Contacts",
          message: "This app would like to view your contacts.",
          buttonPositive: "OK",
          buttonNeutral: "Cancel",
          buttonNegative: "Deny",
        }
      );
      await importContects();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

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
    set_on_opreation(true);
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
    set_on_opreation(false);
  };

  const handel_search = React.useCallback(
    (val: string) => {
      search_value.current = val;
      if (search_value.current.length > 0)
        setsearch_result(search_fun(contacts, search_value.current));
      else setsearch_result([]);
    },
    [contacts]
  );

  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      appState.current = nextAppState;
      setAppStateVisible(appState.current);
    });
    return () => {
      subscription.remove();
    };
  }, []);

  React.useEffect(() => {
    getPermissions();
  }, [getPermissions]);

  if (loading) return <Loading />;
  return (
    <GlobalContext.Provider
      value={{
        handel_search_value: handel_search,
        contacts: search_result.length > 0 ? search_result : contacts,
        groupes,
        updateGroup,
        deleteGroup,
        addGroup,
        setGroupes,
        startCallCycle,
        on_opreation,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
