import AsyncStorage from "@react-native-async-storage/async-storage";
import { IGroup } from "@typings/group";
import { IUser } from "@typings/types";
import { sortContacts } from "@utils/index";
import { createPool } from "@vercel/postgres";
import { Contact } from "expo-contacts";
import * as Contacts from "expo-contacts";

const client = createPool({
  connectionString: process.env.EXPO_PUBLIC_POSTGRES_URL,
});

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
    const groups = await getContactsGroups();
    const group = groups.find((g) => g.id === id);
    if (group) {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers],
        });
        if (data.length > 0) {
          const sortedContacts = await sortContacts(data);
          group.contacts = group.contacts.map((contact) => {
            const found = sortedContacts.find(
              (c) => c.phoneNumbers[0].number === contact.phoneNumbers[0].number
            );
            return found ? { ...contact, ...found } : contact;
          });
        }
      }
    }
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

// save local user data to storage
export const saveUser = async (data: any) => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem("@user", jsonValue);
  } catch (e) {
    // saving error
    throw new Error(e);
  }
};

// get user data from storage
export const getUser = async (): Promise<IUser | null> => {
  try {
    const userData = await AsyncStorage.getItem("@user");
    return userData != null ? JSON.parse(userData) : null;
  } catch (e) {
    // error reading value from storage
    throw new Error(e);
  }
};

export const login = async (phoneNumber: string, password: string) => {
  client.connect();
  const { rows } =
    await client.sql`SELECT * FROM users WHERE phone_number = ${phoneNumber} AND password = ${password}`;
  const user = rows.length > 0 ? rows[0] : null;
  return user;
};

export const register = async ({
  phoneNumber,
  password,
  firstName,
  lastName,
}: {
  phoneNumber: string;
  password: string;
  firstName: string;
  lastName: string;
}) => {
  let username = `${firstName}${lastName}`
    .toLowerCase()
    .trim()
    .replace(" ", "");
  username = `${username}${Math.floor(Math.random() * 1000)}`;
  username = username.length > 20 ? username.slice(0, 20) : username;
  client.connect();
  const { rows } = await client.sql`
    INSERT INTO users (phone_number, password, first_name, last_name, username)
    VALUES (${phoneNumber}, ${password}, ${firstName}, ${lastName}, ${username})
    RETURNING *`;

  const user = rows.length > 0 ? rows[0] : null;
  return user;
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem("@user");
  } catch (e) {
    // error reading value
    throw new Error(e);
  }
};
