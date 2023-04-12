import AsyncStorage from "@react-native-async-storage/async-storage";
import { IGroup } from "@typings/group";
import { Contact } from "expo-contacts";

/// get all contacts groupes from storage
export const getContactsGroups = async (): Promise<IGroup[]> => {
  let data: IGroup[] = [];
  try {
    const currentGroupes = await AsyncStorage.getItem("@groupes");
    data =
      currentGroupes != null ? JSON.parse(currentGroupes) : ([] as IGroup[]);
  } catch (e) {
    // error reading value
  }
  return data;
};

// get group by id from storage and return it
export const getGroupById = async (id: string): Promise<IGroup | undefined> => {
  try {
    const groupes = await getContactsGroups();
    const group = groupes.find((g) => g.id === id);

    return group;
  } catch (e) {
    // error reading value
  }
  return undefined;
};

/// update group in storage by id
export const updateGroup = async (
  id: string,
  group: IGroup
): Promise<IGroup | undefined> => {
  try {
    const groupes = await getContactsGroups();
    const index = groupes.findIndex((g) => g.id === id);
    if (index !== -1) {
      groupes[index] = group;
      await AsyncStorage.setItem("@groupes", JSON.stringify(groupes));
      return group;
    }
    throw new Error("group not found");
  } catch (e) {
    throw new Error(e);
  }
};

// delete group from storage by id
export const deleteGroup = async (id: string): Promise<string> => {
  try {
    const groupes = await getContactsGroups();
    const index = groupes.findIndex((g) => g.id === id);
    if (index !== -1) {
      groupes.splice(index, 1);
      await AsyncStorage.setItem("@groupes", JSON.stringify(groupes));
      return "group deleted";
    }
    throw new Error("group not found");
  } catch (e) {
    // error reading value
    throw new Error(e);
  }
};

/// store new contacts groupes to storage
export const setContactsGroups = async (name: string, contacts: Contact[]) => {
  const group = {
    id: uuidv4(),
    name,
    contacts,
  } as IGroup;
  try {
    // get the value from storage
    const groupes = await getContactsGroups();
    const newGroupes: IGroup[] = [...groupes, group];
    // save the value
    const jsonValue = JSON.stringify(newGroupes);
    await AsyncStorage.setItem("@groupes", jsonValue);
    return group;
  } catch (e) {
    // saving error
    throw new Error(e);
  }
};

// function to create id for new group uuid
export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
