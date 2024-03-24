import useGlobal from "@hooks/useGlobal";
import { Contact } from "@typings/types";
import React from "react";
import { MD2Colors as Colors, IconButton } from "react-native-paper";

export const StartSubCycle = React.memo(
  ({ onPress, contact }: { onPress: () => void; contact: Contact }) => {
    const { on_opreation: disabled } = useGlobal();

    return (
      <IconButton
        icon={"arrow-down"}
        iconColor={Colors.green500}
        disabled={disabled}
        onPress={onPress}
        style={{
          marginHorizontal: 0,
          backgroundColor: !contact.disabled ? Colors.grey300 : Colors.grey100,
        }}
      />
    );
  }
);
