import { useTranslation } from "@hooks/useTranslation";
import React from "react";
import { View } from "react-native";
import { Searchbar as Search } from "react-native-paper";

interface Props {
  onChangeText: (str?: string) => void;
}

const Searchbar = ({ onChangeText }: Props) => {
  const [value, setValue] = React.useState("");
  const { t } = useTranslation();

  const handleSearch = (text: string) => {
    setValue(text);
    onChangeText(text);
  };
  return (
    <View style={{ padding: 10 }}>
      <Search
        onChangeText={handleSearch}
        placeholder={t("Search by name or phone number")}
        value={value}
      />
    </View>
  );
};

export default Searchbar;
