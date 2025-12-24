import * as i18n from "@solid-primitives/i18n";

import * as en from "@/i18n/en";
import * as pl from "@/i18n/pl";
import { createContext, createMemo, createSignal, useContext } from "solid-js";

export type Locale = "en" | "pl";
export type RawDictionary = typeof en.dict;
export type Dictionary = i18n.Flatten<RawDictionary>;

type I18nContextType = ReturnType<typeof makeI18nContext>;

const I18nContext = createContext<I18nContextType>();

export function I18nContextProvider(
    props: any
) {
    const value = makeI18nContext();

    return (
        <I18nContext.Provider value={value}>
            {props.children}
        </I18nContext.Provider>
    )
}

export const makeI18nContext = () => {
    const dictionaries = {
        en: en.dict,
        pl: pl.dict
    };

    const [locale, setLocale] = createSignal<Locale>("pl");
    const dict = createMemo(() => i18n.flatten(dictionaries[locale()]));
    const t = i18n.translator(dict);
    const t_dynamic = i18n.translator<{ [key: string]: string }>(dict);

    return {
        locale, setLocale,
        dict,
        t,
        t_dynamic
    };
}

export function useI18nContext() {
    const context = useContext(I18nContext);
    if(!context) {
        throw new Error("useI18nContext must be used within a I18nContextProvider");
    }

    return context;
}