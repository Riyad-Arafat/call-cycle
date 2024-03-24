import React, { useCallback, useEffect } from "react";
import { BackHandler, View } from "react-native";
import { Stack, useFocusEffect } from "expo-router";
import { IconButton, Text } from "react-native-paper";
import { getContactsGroups } from "@apis/index";
import Loading from "@components/Loading";
import ContactsGroupe from "@components/CntactsGroupe";
import useGlobal from "@hooks/useGlobal";
import { useTranslation } from "react-i18next";

const GroupForm = React.lazy(() => import("@components/Actions/GroupForm"));

export default function Home() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(true);
  const [groupes, setGroupes] = React.useState([]);

  const getData = useCallback(async () => {
    setLoading(true);
    console.log("getData");
    try {
      const data = await getContactsGroups();
      console.log("data", data);
      setGroupes(data);
    } catch (e) {
      // error reading value
      console.log(e);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      getData();
    }, [getData])
  );

  useEffect(() => {
    const backAction = () => {
      console.log("Back button pressed");
      return true; // This will prevent the app from closing
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => backHandler.remove();
  }, []);

  return (
    <View>
      <React.Suspense fallback={null}>
        <Stack.Screen
          options={{
            title: t("Groups"),
            header: () => (loading ? null : <Header onSucess={getData} />),
            headerShown: true,
          }}
        />
        {loading ? (
          <Loading />
        ) : (
          <View
            style={{
              width: "100%",
              padding: 10,
            }}
          >
            <ContactsGroupe groupes={groupes} />
          </View>
        )}
      </React.Suspense>
    </View>
  );
}

const Header = ({ onSucess }: { onSucess: () => void }) => {
  const { toggleMenu } = useGlobal();
  const { t } = useTranslation();
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 10,
          backgroundColor: "#fff",
          borderBottomColor: "#ccc",
          borderBottomWidth: 1,
          width: "100%",
        }}
      >
        <IconButton icon="menu" onPress={() => toggleMenu()} />
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            marginEnd: "auto",
          }}
        >
          {t("Groups")}
        </Text>

        <GroupForm type="create" onSucess={onSucess} />
      </View>
    </>
  );
};
