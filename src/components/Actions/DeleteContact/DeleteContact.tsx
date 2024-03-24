import React from "react";
import {
  MD2Colors as Colors,
  IconButton,
  Modal,
  Portal,
  Text,
  Button,
} from "react-native-paper";
import { Contact } from "@typings/types";
import { View } from "react-native";
import useGlobal from "@hooks/useGlobal";
import { useTranslation } from "@hooks/useTranslation";

export const DeleteContact = React.memo(
  ({ onPress, contact }: { contact: Contact; onPress: () => void }) => {
    const { t } = useTranslation();
    const { on_opreation: disabled } = useGlobal();

    const [visible, setVisible] = React.useState(false);

    const showModal = () => setVisible(true);
    const hideModal = () => setVisible(false);

    const handleDelete = () => {
      hideModal();
      onPress();
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
              {t("Are you sure you want to delete")}
            </Text>

            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {contact.name}
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
                style={{ width: "45%" }}
                mode="contained"
              >
                {t("DELETE")}
              </Button>
              <Button
                onPress={handleCancel}
                mode="outlined"
                buttonColor={Colors.green400}
                style={{ width: "45%" }}
                textColor="white"
              >
                {t("CANCEL")}
              </Button>
            </View>
          </Modal>
        </Portal>
        <IconButton
          style={{
            marginHorizontal: 0,
            backgroundColor: !contact.disabled
              ? Colors.grey300
              : Colors.grey100,
          }}
          icon={"delete"}
          iconColor={Colors.red500}
          onPress={showModal}
          disabled={disabled}
        />
      </>
    );
  }
);
