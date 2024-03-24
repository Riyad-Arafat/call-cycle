import React, { useCallback, useRef, useImperativeHandle } from "react";
import { Alert, AppState, TouchableOpacity } from "react-native";
import { Contact } from "../typings/types";
import * as Contacts from "expo-contacts";
import { sortContacts } from "../utils";
import Loading from "../components/Loading";
import {
  deleteGroup as deleteGroupAPI,
  logout,
  setContactsGroups,
  updateGroup as updateGroupAPI,
} from "../apis";
import SendIntentAndroid from "react-native-send-intent";
import { IGroup } from "@typings/group";
import * as Updates from "expo-updates";
import { Animated, View } from "react-native";
import { Drawer as DrawerPaper } from "react-native-paper";
import { router } from "expo-router";
import i18next from "i18next";
import { useTranslation } from "@hooks/useTranslation";

interface Props {
  contacts: Contact[];
  updateGroup: (group: IGroup, callback?: () => void) => Promise<void>;
  deleteGroup: (group_id: string, callback?: () => void) => Promise<void>;
  addGroup: (name: string, contacts: Contacts.Contact[]) => Promise<void>;
  startCallCycle: (contacts: Contact[]) => Promise<void>;
  on_opreation: boolean;
  toggleMenu: () => void;
}

export const GlobalContext = React.createContext<Props>({
  contacts: [],
  updateGroup: async () => {},
  deleteGroup: async () => {},
  addGroup: async () => {},
  startCallCycle: async () => {},
  on_opreation: false,
  toggleMenu: () => {},
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [on_opreation, set_on_opreation] = React.useState(false);
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
        await setContactsGroups(name, contacts);
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
        await updateGroupAPI(group.id, {
          ...group,
          contacts: [...group.contacts],
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
            SendIntentAndroid.sendPhoneCall(
              contact.phoneNumbers[0].number,
              true
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
    setLoading(true);
    try {
      await importContects();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [importContects]);

  const [isUpdating, setIsUpdating] = React.useState(false);

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsUpdating(true);
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.warn(error);
    } finally {
      setIsUpdating(false);
    }
  }

  React.useEffect(() => {
    onFetchUpdateAsync().then(async () => {
      await getPersmission();
    });
  }, [getPersmission]);

  const drawerRef = React.useRef(null);

  const toggleMenu = useCallback(() => {
    drawerRef.current?.toggleMenu();
  }, []);

  if (loading || isUpdating)
    return (
      <>
        <Loading text={isUpdating ? "updating" : "loading"} />
      </>
    );
  return (
    <GlobalContext.Provider
      value={{
        contacts: contacts,
        updateGroup,
        deleteGroup,
        addGroup,
        startCallCycle,
        on_opreation,
        toggleMenu,
      }}
    >
      <Drawer ref={drawerRef}>{children}</Drawer>
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;

const Drawer = React.forwardRef(
  ({ children }: { children: React.ReactNode }, ref) => {
    const sideMenuProgress = useRef(new Animated.Value(0));
    const mainViewProgress = useRef(new Animated.Value(1));
    const [isOpenned, setIsOpenned] = React.useState(false);
    const sideMenuWidth = 300;

    useImperativeHandle(ref, () => ({
      openMenu: () => {
        openMenu();
      },
      closeMenu: () => {
        closeMenu();
      },
      toggleMenu: () => {
        console.log("toggleMenu");
        toggleMenu();
      },
    }));

    const openMenu = useCallback(() => {
      Animated.timing(sideMenuProgress.current, {
        toValue: 1,
        duration: sideMenuWidth,
        useNativeDriver: true,
      }).start();
      Animated.timing(mainViewProgress.current, {
        toValue: 0,
        duration: sideMenuWidth,
        useNativeDriver: true,
      }).start();
      setIsOpenned(true);
    }, []);

    const closeMenu = useCallback(() => {
      Animated.timing(sideMenuProgress.current, {
        toValue: 0,
        duration: sideMenuWidth,
        useNativeDriver: true,
      }).start();
      Animated.timing(mainViewProgress.current, {
        toValue: 1,
        duration: sideMenuWidth,
        useNativeDriver: true,
      }).start();
      setIsOpenned(false);
    }, []);

    const toggleMenu = useCallback(() => {
      console.log("toggleMenu");
      if (isOpenned) {
        closeMenu();
      } else {
        openMenu();
      }
    }, [closeMenu, isOpenned, openMenu]);

    const sideMenuTranslateX = sideMenuProgress.current.interpolate({
      inputRange: [0, 1],
      outputRange: [-sideMenuWidth, 0],
    });

    const mainViewTranslateX = mainViewProgress.current.interpolate({
      inputRange: [0, 1],
      outputRange: [sideMenuWidth, 0],
    });

    return (
      <View
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Animated.View
          style={{
            transform: [{ translateX: sideMenuTranslateX }],
            width: sideMenuWidth,
            height: "100%",
            position: "absolute",
          }}
        >
          <SideMenu />
        </Animated.View>
        <Animated.View
          style={{
            transform: [{ translateX: mainViewTranslateX }],
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {/* backdrop */}
          {isOpenned && (
            <TouchableOpacity
              onPress={closeMenu}
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0,0,0,0.5)",
                zIndex: 1,
                opacity: 1000,
                display: isOpenned ? "flex" : "none",
              }}
            />
          )}

          {children}
        </Animated.View>
      </View>
    );
  }
);

const SideMenu = () => {
  const { t } = useTranslation();
  const changeLanguage = useCallback(() => {
    const curentLanguage = i18next.language;
    const lng = curentLanguage === "en" ? "ar" : "en";
    i18next.changeLanguage(lng);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      router.navigate("/login");
    } catch (error) {
      Alert.alert("Error", "Something went wrong");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <View
      style={{
        flex: 1,
        display: "flex",
        padding: 5,
        flexDirection: "column",
      }}
    >
      <DrawerPaper.Section>
        <DrawerPaper.Item
          icon="exit-to-app"
          label={t("LOGOUT")}
          onPress={handleLogout}
        />

        <DrawerPaper.Item
          icon="translate"
          label={t("CHANGE_LANGUAGE_TO", {
            target: i18next.language === "en" ? "Arabic" : "الإنجليزية",
          })}
          onPress={changeLanguage}
        />
      </DrawerPaper.Section>
    </View>
  );
};
