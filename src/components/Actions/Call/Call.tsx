import React, { useCallback } from "react";
import { MD2Colors as Colors, IconButton } from "react-native-paper";
import { Contact } from "@typings/types";
import useGlobal from "@hooks/useGlobal";
import { getCallPermission } from "@utils/index";
import { Alert } from "react-native";
import { useTranslation } from "@hooks/useTranslation";
import CallManager from "react-native-call-manager";

export const Call = React.memo(({ contact }: { contact: Contact }) => {
  const { on_opreation: disabled, setCallInfo } = useGlobal();
  const { t } = useTranslation();

  const startCall = useCallback(async () => {
    try {
      const granted = await getCallPermission();
      if (!granted)
        Alert.alert(
          t("Permission Denied"),
          t("You need to allow the app to make calls")
        );
      if (contact.phoneNumbers && contact.phoneNumbers[0].number) {
        console.log("Calling: ", contact.phoneNumbers[0].number);
        setCallInfo({
          name: contact.name,
          number: contact.phoneNumbers[0].number,
        });
        CallManager.makeCall(contact.phoneNumbers[0].number);
      }
    } catch (error) {
      console.log(error);
    }
  }, [contact, t]);

  return (
    <IconButton
      style={{
        marginHorizontal: 0,
        backgroundColor: !contact.disabled ? Colors.grey300 : Colors.grey100,
      }}
      icon={"phone"}
      iconColor={Colors.green500}
      onPress={startCall}
      disabled={disabled}
    />
  );
});
