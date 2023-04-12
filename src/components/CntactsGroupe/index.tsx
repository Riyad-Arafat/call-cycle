import React, { memo } from "react";
import { Avatar, Button, MD2Colors as Colors, List } from "react-native-paper";
import { useGlobal } from "@hooks/useGlobal";
import { IGroup } from "@typings/group";
import { Link } from "expo-router";

const ContactsGroupe = memo(() => {
  const { groupes } = useGlobal();
  return (
    <>
      {groupes.length > 0 &&
        groupes.map((group, idx) => {
          return (
            <GroupItem group={group} key={`${group.id}+${group.name}+${idx}`} />
          );
        })}
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
      expanded={true}
      left={() => (
        <Avatar.Icon
          size={40}
          icon="account-group"
          color={Colors.white}
          style={{ backgroundColor: Colors.lightBlue900 }}
        />
      )}
      right={() => (
        <Link href={`group/${group.id}`}>
          <Button mode="contained-tonal">Open</Button>
        </Link>
      )}
      style={{
        width: "100%",
        borderBottomColor: "#ccc",
        borderBottomWidth: 2,
      }}
    >
      {null}
    </List.Accordion>
  );
};

export default ContactsGroupe;
