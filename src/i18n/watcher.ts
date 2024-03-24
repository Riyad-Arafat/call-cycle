import fs from "fs";
import path from "path";

// Define the path to the file to watch
const filePath = path.resolve(__dirname, "./ar/translation.ts");

// Watch the file
fs.watch(filePath, (eventType) => {
  console.log("File changed");
  if (eventType === "change") {
    try {
      // Delete the cache entry for the module
      delete require.cache[require.resolve(filePath)];

      // Load the updated translations
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const translations = require(filePath).default;

      const type = `export interface TranslationKeys {
                                ${Object.keys(translations)
                                  .map((key) => `"${key}": string;`)
                                  .join("\n  ")}
                        }`;

      fs.writeFileSync(path.resolve(__dirname, "i18n.ts"), type);
      console.log("File updated successfully");
    } catch (err) {
      console.error("Error:", err);
    }
  }
});
