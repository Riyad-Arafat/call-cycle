import React from "react";
import { View } from "react-native";
import { Searchbar as Search } from "react-native-paper";
import { useGlobal } from "@hooks/useGlobal";

const Searchbar = () => {
  const { handel_search_value } = useGlobal();

  const [value, setValue] = React.useState("");

  const onChangeText = (str: string) => {
    handel_search_value(str);
    setValue(str);
  };

  return (
    <View>
      <Search
        value={value}
        onChangeText={onChangeText}
        placeholder="search by name or phone number"
      />
    </View>
  );
};

export default Searchbar;
