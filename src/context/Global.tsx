import React from "react";

interface Props {
  handel_search_value: (s: string) => void;
  search_value: string;
}

const GlobalContext = React.createContext<Props>({
  search_value: "",
  handel_search_value: (s) => console.log("s", s),
});

const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [search_value, set_search_value] = React.useState("");

  const handel_search_value = (val: string) => set_search_value(val);

  return (
    <GlobalContext.Provider value={{ handel_search_value, search_value }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = () => React.useContext(GlobalContext);

export default GlobalProvider;
