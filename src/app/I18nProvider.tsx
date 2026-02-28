"use client";

import { createContext, useContext, ReactNode } from 'react';
import { getTranslation, SupportedLang } from './i18n';

interface I18nContextProps {
    lang: SupportedLang;
    t: (section: string, key: string) => string;
}

const I18nContext = createContext<I18nContextProps>({
    lang: 'en',
    t: (section, key) => getTranslation('en', section as any, key)
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children, lang }: { children: ReactNode, lang: string }) {
    const t = (section: string, key: string) => getTranslation(lang, section as any, key);

    return (
        <I18nContext.Provider value={{ lang: lang as SupportedLang, t }}>
            {children}
        </I18nContext.Provider>
    );
}
