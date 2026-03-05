"use client";

import { createContext, useContext, ReactNode } from 'react';
import { getTranslation, SupportedLang } from './i18n';

interface I18nContextProps {
    lang: SupportedLang;
    currency: string;
    theme: string;
    t: (section: string, key: string) => string;
    formatCurrency: (amountInUSD: number) => string;
}

const EXCHANGE_RATES: Record<string, number> = {
    USD: 1,
    EUR: 0.92,
    CZK: 23.4,
    GBP: 0.79
};

const I18nContext = createContext<I18nContextProps>({
    lang: 'en',
    currency: 'USD',
    theme: 'system',
    t: (section, key) => getTranslation('en', section as any, key),
    formatCurrency: (amount) => `$${amount.toFixed(2)}`
});

export const useI18n = () => useContext(I18nContext);

export function I18nProvider({ children, lang, currency = 'USD', theme = 'system' }: { children: ReactNode, lang: string, currency?: string, theme?: string }) {
    const t = (section: string, key: string) => getTranslation(lang, section as any, key);

    const formatCurrency = (amountInUSD: number) => {
        const rate = EXCHANGE_RATES[currency] || 1;
        const converted = amountInUSD * rate;

        return new Intl.NumberFormat(lang, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: currency === 'CZK' ? 0 : 2
        }).format(converted);
    };

    return (
        <I18nContext.Provider value={{ lang: lang as SupportedLang, currency, theme, t, formatCurrency }}>
            {children}
        </I18nContext.Provider>
    );
}
