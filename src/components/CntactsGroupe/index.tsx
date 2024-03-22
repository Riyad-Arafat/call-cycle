import React, { memo } from "react";
import { Avatar, MD2Colors as Colors, List } from "react-native-paper";
import Button from "react-native-paper/src/components/Button/Button";
import { useGlobal } from "@hooks/useGlobal";
import { IGroup } from "@typings/group";
import { Link } from "expo-router";
import { FlatList } from "react-native";

const ContactsGroupe = memo(() => {
  const { groupes } = useGlobal();
  return (
    <>
      <FlatList
        data={[...groupes, ...groupes, ...groupes]}
        renderItem={({ item }) => <GroupItem group={item} />}
        keyExtractor={(item, index) =>
          `${item.id}+${item.name}-${item.contacts.length}-${index}`
        }
      />
    </>
  );
});

const GroupItem = ({ group }: { group: IGroup }) => {
  return (
    <List.Accordion
      id={`${group.id}+${group.name}`}
      title={group.name}
      titleStyle={{
        color: Colors.black,
        fontSize: 20,
        fontWeight: "bold",
      }}
      pointerEvents="box-none"
      expanded={false}
      left={() => (
        <Avatar.Icon
          size={40}
          icon="account-group"
          color={Colors.white}
          style={{ backgroundColor: Colors.lightBlue900, marginTop: 5 }}
        />
      )}
      right={() => (
        <Link href={`group/${group.id}`}>
          <Button mode="contained" buttonColor={Colors.lightBlue900}>
            Open
          </Button>
        </Link>
      )}
      style={{
        paddingHorizontal: 10,
        width: "100%",
        borderBottomColor: "#f0f0f0",
        borderBottomWidth: 7,
      }}
    >
      {null}
    </List.Accordion>
  );
};

export default ContactsGroupe;
