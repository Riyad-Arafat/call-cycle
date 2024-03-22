import { View } from "react-native";
import React, { useCallback } from "react";
import { useIsFocused } from "@react-navigation/native";
import { getContactsGroups } from "../apis";
import Loading from "../components/Loading";
import { useGlobal } from "@hooks/useGlobal";
import ContactsGroupe from "../components/CntactsGroupe";

export default function GroupsScreen() {
  const isFocused = useIsFocused();
  const [loading, setLoading] = React.useState(true);
  const { setGroupes: setG } = useGlobal();

  const getData = useCallback(async () => {
    if (!isFocused) return;
    setLoading(true);
    try {
      const data = await getContactsGroups();
      setG(data);
    } catch (e) {
      // error reading value
      console.log(e);
    } finally {
      setLoading(false);
    }
  }, [isFocused, setG]);

  React.useEffect(() => {
    getData();
  }, [getData]);

  if (loading) return <Loading />;

  return (
    <View
      style={{
        width: "100%",
        padding: 10,
      }}
    >
      <ContactsGroupe />
    </View>
  );
}
