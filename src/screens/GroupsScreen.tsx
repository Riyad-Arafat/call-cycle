import { StyleSheet, ScrollView, View } from "react-native";
import React from "react";
import { useIsFocused } from "@react-navigation/native";
import { RootTabScreenProps } from "../typings/types";
import ContactsGroupe, { GroupProps } from "../components/CntactsGroupe";
import { getContactsGroups } from "../apis";
import Loading from "../components/Loading";

export default function GroupsScreen({
  navigation,
}: RootTabScreenProps<"Groups">) {
  const isFocused = useIsFocused();
  const [loading, setLoading] = React.useState(true);
  const [groupes, setGroupes] = React.useState<GroupProps[]>([]);

  const getData = async () => {
    setLoading(true);
    try {
      const data = await getContactsGroups();
      setGroupes(data);
    } catch (e) {
      // error reading value
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const onUpdateGroup = (group: GroupProps) => {
    setGroupes((prev) => {
      let newgroupes = [...prev];
      const index = newgroupes.findIndex((g) => g.id === group.id);
      if (index !== -1) newgroupes[index] = { ...group };
      return newgroupes;
    });
  };

  const onDeleteGroup = (group_id: string) => {
    setGroupes((prev) => {
      let newgroupes = [...prev];
      const index = newgroupes.findIndex((g) => g.id === group_id);
      if (index !== -1) newgroupes.splice(index, 1);
      return newgroupes;
    });
  };

  React.useEffect(() => {
    // Call only when screen open or when back on screen
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  if (loading) return <Loading />;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.contactsView}>
        {/* <ContactsItems contacts={checked} /> */}
        <ContactsGroupe
          groups={groupes}
          onUpdate={onUpdateGroup}
          onDelet={onDeleteGroup}
        />
        {/* <ModaleScreen /> */}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  contactsView: {
    width: "100%",
  },
});
