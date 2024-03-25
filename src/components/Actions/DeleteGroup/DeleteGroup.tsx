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
import { useTranslation } from "@hooks/useTranslation";

interface DefaultProps {
  group: IGroup;
  disabled: boolean;
  onSucess?: () => void;
}

export const DeleteGroup = React.memo(
  ({ disabled, group, onSucess }: DefaultProps) => {
    const [visible, setVisible] = React.useState(false);
    const { deleteGroup } = useGlobal();
    const { t } = useTranslation();

    const showModal = () => setVisible(true);
    const hideModal = () => {
      setVisible(false);
    };

    const handleDelete = async () => {
      await deleteGroup(group.id);
      onSucess?.();
      hideModal();
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
              {t("Are you sure you want to delete this group?")}
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
                style={{ width: "45%" }}
              >
                {t("Delete")}
              </Button>
              <Button
                onPress={handleCancel}
                mode="outlined"
                buttonColor={Colors.green400}
                style={{ width: "45%" }}
                textColor="white"
              >
                {t("Cancel")}
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
          {t("Delete")}
        </Button>
      </>
    );
  }
);
