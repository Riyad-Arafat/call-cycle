import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContactsGroupeProps, GroupProps } from "../components/CntactsGroupe";
import { Contact } from "expo-contacts";
/// get all contacts groupes from storage
export const getContactsGroups = async (): Promise<
  ContactsGroupeProps["groups"] | []
> => {
  let data: ContactsGroupeProps["groups"] = [];
  try {
    const currentGroupes = await AsyncStorage.getItem("@groupes");
    data = currentGroupes != null ? JSON.parse(currentGroupes) : [];
  } catch (e) {
    // error reading value
  }
  return data;
};

// get group by id from storage and return it
export const getGroupById = async (
  id: string
): Promise<GroupProps | undefined> => {
  let data: GroupProps | undefined = undefined;
  try {
    const groupes = await getContactsGroups();
    return groupes.find((g) => g.id === id);
  } catch (e) {
    // error reading value
  }
  return data;
};

/// update group in storage by id
export const updateGroup = async (
  id: string,
  group: GroupProps
): Promise<GroupProps | undefined> => {
  try {
    const groupes = await getContactsGroups();
    const index = groupes.findIndex((g) => g.id === id);

    if (index !== -1) {
      groupes[index] = group;
      await AsyncStorage.setItem("@groupes", JSON.stringify(groupes));
      return group;
    }
    return undefined;
  } catch (e) {
    console.log(e);
    // error reading value
  }
  return undefined;
};

// delete group from storage by id
export const deleteGroup = async (id: string): Promise<boolean> => {
  try {
    const groupes = await getContactsGroups();
    const index = groupes.findIndex((g) => g.id === id);
    if (index !== -1) {
      groupes.splice(index, 1);
      await AsyncStorage.setItem("@groupes", JSON.stringify(groupes));
      return true;
    }
    return false;
  } catch (e) {
    // error reading value
  }
  return false;
};

/// store new contacts groupes to storage
export const setContactsGroups = async (name: string, contacts: Contact[]) => {
  let group = {
    id: `${Math.random()}-${Date.now()}-${Math.random().toFixed(10)}`,
    name,
    contacts,
  };
  try {
    // get the value from storage
    const groupes = await getContactsGroups();
    let newGroupes = [...groupes, group];
    // save the value
    const jsonValue = JSON.stringify(newGroupes);
    await AsyncStorage.setItem("@groupes", jsonValue);
    return true;
  } catch (e) {
    // saving error
    console.log(e);
    return false;
  }
};
