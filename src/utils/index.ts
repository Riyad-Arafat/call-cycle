import { Contact as ExpoContact } from "expo-contacts";
import { Contact } from "../typings/types";

/// fastest search in Contacts[] by name or phone number
export const search_fun = (contacts: Contact[], search: string) => {
  let data = contacts
    .filter((item) => {
      return item.name.toLowerCase().includes(search.toLowerCase());
    })
    .sort((a, b) => {
      if (a.name.toLowerCase() < b.name.toLowerCase()) {
        return -1;
      }
      if (a.name.toLowerCase() > b.name.toLowerCase()) {
        return 1;
      }
      return 0;
    });

  return data;
};

/// return unique phone numbers from array of phone numbers
const getUniquePhones = (array: ExpoContact[]) => {
  let uniquePhones = array
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
  let data: ExpoContact[] = [];

  importedContacts.forEach((contact) => {
    if (!!contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      for (let phone of contact.phoneNumbers) {
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
