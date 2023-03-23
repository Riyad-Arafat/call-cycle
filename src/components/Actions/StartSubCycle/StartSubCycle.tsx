import React from "react";
import { MD2Colors as Colors, IconButton } from "react-native-paper";

export const StartSubCycle = React.memo(
  ({ disabled, onPress }: { disabled: boolean; onPress: () => void }) => {
    return (
      <IconButton
        icon={"arrow-down"}
        iconColor={Colors.green500}
        disabled={disabled}
        onPress={onPress}
      />
    );
  }
);
