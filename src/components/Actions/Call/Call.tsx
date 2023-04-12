import React from "react";
import { MD2Colors as Colors, IconButton } from "react-native-paper";
import { Contact } from "@typings/types";
import RNImmediatePhoneCall from "react-native-immediate-phone-call";

export const Call = React.memo(
  ({ contact, disabled }: { contact: Contact; disabled: boolean }) => {
    const startCall = async () => {
      try {
        if (contact.phoneNumbers && contact.phoneNumbers[0].number) {
          RNImmediatePhoneCall.immediatePhoneCall(
            contact.phoneNumbers[0].number
          );
        }
      } catch (error) {
        console.log(error);
      }
    };

    return (
      <IconButton
        style={{ marginHorizontal: 0 }}
        icon={"phone"}
        iconColor={Colors.green500}
        onPress={startCall}
        disabled={disabled}
      />
    );
  }
);
