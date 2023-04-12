import React from "react";
import { View } from "react-native";
import {
  Button,
  MD2Colors as Colors,
  Modal,
  Portal,
  Text,
} from "react-native-paper";
import { useGlobal } from "@hooks/useGlobal";
import { IGroup } from "@typings/group";

interface DefaultProps {
  group: IGroup;
  disabled: boolean;
  onSucess?: () => void;
}

export const DeleteGroup = React.memo(
  ({ disabled, group, onSucess }: DefaultProps) => {
    const [visible, setVisible] = React.useState(false);
    const { deleteGroup } = useGlobal();

    const showModal = () => setVisible(true);
    const hideModal = () => {
      setVisible(false);
      onSucess?.();
    };

    const handleDelete = () => {
      deleteGroup(group.id, hideModal);
    };

    const handleCancel = () => {
      hideModal();
    };
    return (
      <>
        <Portal>
          <Modal
            visible={visible}
            onDismiss={hideModal}
            contentContainerStyle={{
              backgroundColor: "white",
              padding: 20,
              // justifyContent: "space-between",
              display: "flex",

              height: "50%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              Are you sure you want to delete
            </Text>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {`${group.name}`}
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 50,
              }}
            >
              <Button
                onPress={handleDelete}
                buttonColor={Colors.red500}
                icon="delete"
                mode="contained"
              >
                Delete
              </Button>
              <Button
                onPress={handleCancel}
                mode="outlined"
                buttonColor={Colors.green400}
              >
                Cancel
              </Button>
            </View>
          </Modal>
        </Portal>
        <Button
          icon={"delete-circle"}
          mode="contained"
          buttonColor={Colors.red500}
          disabled={disabled}
          onPress={showModal}
        >
          Delete
        </Button>
      </>
    );
  }
);
