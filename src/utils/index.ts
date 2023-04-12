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

/// return unique phone numbers from array of phone numbers
const getUniquePhones = (array: ExpoContact[]) => {
  const uniquePhones = array
    .filter((item, index, self) => {
      return (
        index ===
        self.findIndex(
          (t) => t.phoneNumbers[0].number === item.phoneNumbers[0].number
        )
      );
    })
    .sort();

  return uniquePhones;
};

export const sortContacts = async (importedContacts: ExpoContact[]) => {
  const data: ExpoContact[] = [];

  importedContacts.forEach((contact) => {
    if (!!contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      for (const phone of contact.phoneNumbers) {
        data.push({
          ...contact,
          phoneNumbers: [{ ...phone, number: removeSpace(phone.number) }],
        });
      }
    }
  });
  return getUniquePhones(data);
};

// remove space from string
export const removeSpace = (str: string) => {
  return str.replace(/\s/g, "");
};
