import { Contact as ExpoContact } from "expo-contacts";
import { Contact } from "@typings/types";

export const search_fun = (contacts: Contact[], search: string) => {
  const data = contacts.reduce((acc, item) => {
    if (item.name.toLowerCase().includes(search.toLowerCase())) {
      acc.push(item);
    }
    return acc;
  }, []);

  data.sort((a, b) => {
    return a.name.localeCompare(b.name);
  });

  return data;
};

const getUniquePhones = (array: ExpoContact[]) => {
  const seen = new Set();
  const uniquePhones = array
    .filter((item) => {
      const phoneNumber = item.phoneNumbers[0].number;
      if (!seen.has(phoneNumber)) {
        seen.add(phoneNumber);
        return true;
      }
      return false;
    })
    .sort((a, b) =>
      a.phoneNumbers[0].number.localeCompare(b.phoneNumbers[0].number)
    );

  return uniquePhones;
};

export const sortContacts = async (importedContacts: ExpoContact[]) => {
  const data: ExpoContact[] = importedContacts
    .filter(
      (contact) => !!contact.phoneNumbers && contact.phoneNumbers.length > 0
    )
    .flatMap((contact) =>
      contact.phoneNumbers.map((phone) => ({
        ...contact,
        phoneNumbers: [{ ...phone, number: removeSpace(phone.number) }],
      }))
    );

  return getUniquePhones(data);
};

// remove space from string
export const removeSpace = (str: string) => {
  return str.replace(/\s/g, "");
};
