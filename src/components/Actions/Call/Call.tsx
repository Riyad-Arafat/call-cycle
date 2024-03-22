import React, { useCallback } from "react";
import { MD2Colors as Colors, IconButton } from "react-native-paper";
import { Contact } from "@typings/types";
import useGlobal from "@hooks/useGlobal";
import SendIntentAndroid from "react-native-send-intent";

export const Call = React.memo(({ contact }: { contact: Contact }) => {
  const { on_opreation: disabled } = useGlobal();

  const startCall = useCallback(() => {
    try {
      console.log(contact);
      if (contact.phoneNumbers && contact.phoneNumbers[0].number) {
        SendIntentAndroid.sendPhoneCall(contact.phoneNumbers[0].number, true);
      }
    } catch (error) {
      console.log(error);
    }
  }, [contact]);

  return (
    <IconButton
      style={{ marginHorizontal: 0 }}
      icon={"phone"}
      iconColor={Colors.green500}
      onPress={startCall}
      disabled={disabled}
    />
  );
});
