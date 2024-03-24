import { TranslationKeys } from "@i18n/i18n";
import { TOptions } from "i18next/typescript/options";
import { useTranslation as useTranslationBase } from "react-i18next";

export const useTranslation = () => {
  const { t, ...hook } = useTranslationBase();

  const translate = (
    key: keyof TranslationKeys | (keyof TranslationKeys)[],
    options?: TOptions | string
  ) => {
    if (typeof options === "string") {
      return t(key, options);
    } else {
      return t(key, options);
    }
  };

  return { t: translate, ...hook };
};
