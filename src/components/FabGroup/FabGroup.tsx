import CreateGroup from "@components/Actions/CreateGroup/CreateGroup";
import * as React from "react";
import { FAB, Portal, Text } from "react-native-paper";

export const FabGroup = () => {
  const [open, setOpen] = React.useState(false);
  const [openGroupForm, setOpenGroupForm] = React.useState(false);

  const onStateChange = ({ open }) => setOpen(open);

  return (
    <Portal>
      <CreateGroup
        type="create"
        visible={openGroupForm}
        hideModal={() => setOpenGroupForm(false)}
      />
      <FAB.Group
        open={open}
        visible
        icon={open ? "close" : "menu"}
        variant="surface"
        fabStyle={{
          backgroundColor: "#3F51B5",
          bottom: 40,
          direction: "rtl",
        }}
        actions={[
          {
            icon: "plus",
            label: "Add Group",
            onPress: () => setOpenGroupForm(true),
          },
        ]}
        onStateChange={onStateChange}
      />
    </Portal>
  );
};
