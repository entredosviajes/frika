"use client";

import { createContext, useContext, useMemo, useCallback } from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/graphql/queries/auth";
import { translations, type Locale, type TranslationKey } from "./translations";

interface I18nContextValue {
  locale: Locale;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  t: (key) => key,
  dir: "ltr",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any>(ME_QUERY);
  const locale = (data?.me?.profile?.sourceLanguage?.toLowerCase() ?? "en") as Locale;

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      let str = translations[locale]?.[key] ?? translations.en[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`{${k}}`, String(v));
        }
      }
      return str;
    },
    [locale]
  );

  const dir: "ltr" | "rtl" = locale === "ar" ? "rtl" : "ltr";

  const value = useMemo(() => ({ locale, t, dir }), [locale, t, dir]);

  return (
    <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
  );
}

export function useTranslation() {
  return useContext(I18nContext);
}
