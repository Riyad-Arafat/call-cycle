import React, { useCallback } from "react";
import { AppState, PermissionsAndroid } from "react-native";
import { Contact, IUser } from "../typings/types";
import * as Contacts from "expo-contacts";
import { sortContacts } from "../utils";
import Loading from "../components/Loading";
import {
  deleteGroup as deleteGroupAPI,
  getUser,
  setContactsGroups,
  updateGroup as updateGroupAPI,
} from "../apis";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";
import { IGroup } from "@typings/group";
import { Slot, router } from "expo-router";
import * as Updates from "expo-updates";

interface Props {
  contacts: Contact[];
  groupes: IGroup[];
  updateGroup: (group: IGroup, callback?: () => void) => Promise<void>;
  deleteGroup: (group_id: string, callback?: () => void) => Promise<void>;
  addGroup: (name: string, contacts: Contacts.Contact[]) => Promise<void>;
  setGroupes: (groupes: IGroup[]) => void;
  startCallCycle: (contacts: Contact[]) => Promise<void>;
  on_opreation: boolean;
  user: IUser | null;
  setUser(user: IUser): void;
}

export const GlobalContext = React.createContext<Props>({
  contacts: [],
  groupes: [],
  updateGroup: async () => console.log("aa"),
  deleteGroup: async () => console.log("ss"),
  addGroup: async () => console.log("ss"),
  setGroupes: () => console.log("ss"),
  startCallCycle: async () => console.log("ss"),
  on_opreation: false,
  user: null,
  setUser: () => console.log("ss"),
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [on_opreation, set_on_opreation] = React.useState(false);
  const [user, setUser] = React.useState<IUser | null>(null);
  const [groupes, setGroupes] = React.useState<IGroup[]>([]);
  const appState = React.useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(
    appState.current
  );

  const _handelEndOpreation = useCallback((time = 1000) => {
    // wait until the storage is updated and then set on_opreation to false
    setTimeout(() => {
      set_on_opreation(false);
    }, time);
  }, []);

  const addGroup = useCallback(
    async (name: string, contacts: Contacts.Contact[]) => {
      set_on_opreation(true);
      try {
        const group = await setContactsGroups(name, contacts);
        setGroupes((prev) => [...prev, group]);
      } catch (error) {
        console.error(error);
      } finally {
        _handelEndOpreation();
      }
    },
    [_handelEndOpreation]
  );

  const updateGroup = useCallback(
    async (group: IGroup, callback?: () => void) => {
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
        _handelEndOpreation();
      }
    },
    [_handelEndOpreation]
  );

  const deleteGroup = useCallback(
    async (group_id: string, callback?: () => void) => {
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
    },
    []
  );

  const importContects = useCallback(async () => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === "granted") {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
      });
      if (data.length > 0) {
        console.log("contacts", data.length);
        const sortedContacts = await sortContacts(data);
        console.log("sortedContacts", sortedContacts.length);
        setContacts(sortedContacts);
      }
    }
  }, []);

  const getAuthedUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getUser();
      if (res) {
        setUser(res);
        await importContects();
        router.navigate("/contactas");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [importContects]);

  const startCallCycle = useCallback(
    async (contacts: Contact[]) => {
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
      _handelEndOpreation(0);
    },
    [_handelEndOpreation, appStateVisible]
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

  const getPersmission = useCallback(async () => {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: "Contacts",
        message: "This app would like to view your contacts.",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );

    if (status === "granted") {
      await getAuthedUser();
    }
  }, [getAuthedUser]);

  React.useEffect(() => {
    getPersmission();
  }, [getPersmission]);

  const [isUpdating, setIsUpdating] = React.useState(false);

  async function onFetchUpdateAsync() {
    try {
      setIsUpdating(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      alert(`Error fetching latest Expo update: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  }

  React.useEffect(() => {
    onFetchUpdateAsync();
  }, []);

  if (loading || isUpdating)
    return (
      <>
        <Loading />
        <Slot />
      </>
    );
  return (
    <GlobalContext.Provider
      value={{
        contacts: contacts,
        groupes,
        updateGroup,
        deleteGroup,
        addGroup,
        setGroupes,
        startCallCycle,
        on_opreation,
        user,
        setUser,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
