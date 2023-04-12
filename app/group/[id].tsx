import { getGroupById } from "@apis/index";
import DeleteGroup from "@components/Actions/DeleteGroup";
import GroupForm from "@components/Actions/GroupForm";
import { ContactsList } from "@components/ContactsList";
import Loading from "@components/Loading";
import useGlobal from "@hooks/useGlobal";
import { IGroup } from "@typings/group";
import { useRouter, useSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, Text, MD2Colors as Colors } from "react-native-paper";
import { Stack } from "expo-router";

export default function Group() {
  const { id } = useSearchParams();
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

  const onDeleteContact = async (group: IGroup) => {
    updateGroup(group, getGroup);
  };

  if (!group)
    return (
      <>
        <Stack.Screen options={{ title: "Group" }} />
        <Loading />
      </>
    );
  return (
    <View
      style={{
        paddingBottom: 20,
      }}
    >
      <Stack.Screen options={{ title: `${group?.name}` }} />

      <>
        <ActionsHeader
          group={group}
          startCallCycle={startCallCycle}
          onUpadteSuccess={getGroup}
        />

        <ContactsList
          contacts={group.contacts}
          allowSelect={false}
          porpuse="call"
          onSelect={(checked) =>
            onDeleteContact({ ...group, contacts: checked })
          }
        />
      </>
    </View>
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
  const { is_cycling } = useGlobal();
  const router = useRouter();

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
        disabled={is_cycling}
        buttonColor={Colors.green500}
        onPress={startCallCycle}
      >
        <Text>Start</Text>
      </Button>
      <DeleteGroup
        disabled={is_cycling}
        group={group}
        onSucess={() => router.back()}
      />
      <GroupForm group={group} type="upadte" onSucess={onUpadteSuccess} />
    </View>
  );
};
