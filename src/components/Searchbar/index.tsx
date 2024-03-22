import React from "react";
import { View } from "react-native";
import { Searchbar as Search } from "react-native-paper";

interface Props {
  onChangeText: (str?: string) => void;
}

const Searchbar = ({ onChangeText }: Props) => {
  return (
    <View style={{ padding: 10 }}>
      <Search
        onChangeText={onChangeText}
        placeholder="search by name or phone number"
      />
    </View>
  );
};

export default Searchbar;
