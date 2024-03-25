import { getGroupById } from "@apis/index";
import DeleteGroup from "@components/Actions/DeleteGroup";
import GroupForm from "@components/Actions/GroupForm";
import ContactsList from "@components/ContactsList";
import Loading from "@components/Loading";
import useGlobal from "@hooks/useGlobal";
import { IGroup } from "@typings/group";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, MD2Colors as Colors } from "react-native-paper";
import { Stack } from "expo-router";
import { Contact } from "@typings/types";
import { useTranslation } from "@hooks/useTranslation";

export default function Group() {
  const { id } = useLocalSearchParams();
  const { updateGroup, startCallCycle: makeCalls } = useGlobal();
  const [group, setGroup] = useState<IGroup | undefined>(undefined);

  const getGroup = useCallback(async () => {
    try {
      const group = await getGroupById(id as string);
      setGroup(group);
    } catch (error) {
      console.log(error);
    }
  }, [id]);

  useEffect(() => {
    getGroup();
  }, [getGroup]);

  const startCallCycle = useCallback(async () => {
    await makeCalls(group.contacts);
  }, [group, makeCalls]);

  const onDeleteContact = useCallback(
    async (contact: Contact) => {
      if (!group) return;
      const contacts = group.contacts.filter(
        (c) => c.phoneNumbers[0].number !== contact.phoneNumbers[0].number
      );
      const newGroup = { ...group, contacts };
      setGroup(newGroup);
      await updateGroup(newGroup);
    },
    [group, updateGroup]
  );

  const onToggleDisable = useCallback((contact: Contact) => {
    if (contact.phoneNumbers) {
      setGroup((group) => {
        const newChecked = group.contacts.map((c) => {
          if (
            c.phoneNumbers &&
            c.phoneNumbers[0].number === contact.phoneNumbers[0].number
          )
            return { ...c, disabled: !c.disabled };
          return c;
        });
        return { ...group, contacts: newChecked };
      });
    }
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: group?.name || "Group",
          header: !group ? () => null : undefined,
        }}
      />

      {!group ? (
        <Loading />
      ) : (
        <>
          <ActionsHeader
            group={group}
            startCallCycle={startCallCycle}
            onUpadteSuccess={getGroup}
          />
          <ContactsList.View
            contactsList={group.contacts}
            onDeleteContact={onDeleteContact}
            onToggleDisable={onToggleDisable}
          />
        </>
      )}
    </>
  );
}

interface IActionsHeader {
  group: IGroup;
  startCallCycle: () => void;
  onUpadteSuccess?: () => void;
}

const ActionsHeader = ({
  group,
  startCallCycle,
  onUpadteSuccess,
}: IActionsHeader) => {
  const { on_opreation } = useGlobal();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-evenly",
        paddingVertical: 30,
        borderBottomColor: "#ccc",
        borderBottomWidth: 2,
      }}
    >
      <Button
        icon={"phone"}
        mode="contained"
        disabled={on_opreation}
        buttonColor={Colors.green500}
        onPress={startCallCycle}
      >
        {t("Start Call loop")}
      </Button>
      <DeleteGroup
        disabled={on_opreation}
        group={group}
        onSucess={() => router.back()}
      />
      <GroupForm group={group} type="upadte" onSucess={onUpadteSuccess} />
    </View>
  );
};
