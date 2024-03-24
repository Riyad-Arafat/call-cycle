import { useTranslation } from "@hooks/useTranslation";
import * as React from "react";
import { View, Text } from "react-native";
import { ActivityIndicator, MD2Colors as Colors } from "react-native-paper";

export const Loading = ({ text }: { text?: string }) => {
  const { t } = useTranslation();

  return (
    <View
      style={{
        height: "100%",
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: Colors.white,
        flexDirection: "column",
      }}
    >
      <ActivityIndicator animating={true} color={Colors.red800} />
      {text && (
        <Text
          style={{
            marginTop: 20,
            color: Colors.black,
            fontSize: 16,
          }}
        >
          {t(text)}
        </Text>
      )}
    </View>
  );
};

export default Loading;
