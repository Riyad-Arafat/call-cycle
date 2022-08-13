import React from "react";
import { View } from "react-native";
import { Text, Searchbar as Search } from "react-native-paper";
import { useGlobal } from "../../context/Global";

const Searchbar = () => {
  const { handel_search_value, search_value } = useGlobal();

  const onChangeText = (str: string) => {
    handel_search_value(str);
  };

  return (
    <View>
      <Search
        value={search_value}
        onChangeText={onChangeText}
        placeholder="search by name or phone number"
      />
    </View>
  );
};

export default Searchbar;
