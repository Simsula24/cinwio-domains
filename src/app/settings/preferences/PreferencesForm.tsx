"use client";

import { useState } from "react";
import styles from "../settings.module.css";
import { updatePreference } from "../../actions/settings";
import { useI18n } from "../../I18nProvider";

export default function PreferencesForm({
    initialCurrency,
    initialTheme
}: {
    initialCurrency: string,
    initialTheme: string
}) {
    const [currency, setCurrency] = useState(initialCurrency);
    const [theme, setTheme] = useState(initialTheme);
    const [isUpdating, setIsUpdating] = useState(false);
    const { t } = useI18n();

    const handlePreferenceChange = async (key: 'currency' | 'theme', value: string) => {
        const oldCurrency = currency;
        const oldTheme = theme;

        setIsUpdating(true);
        if (key === 'currency') setCurrency(value);
        if (key === 'theme') setTheme(value);

        const res = await updatePreference(key, value);

        if (res.error) {
            alert(res.error);
            if (key === 'currency') setCurrency(oldCurrency);
            if (key === 'theme') setTheme(oldTheme);
        }

        setIsUpdating(false);
    };

    return (
        <div style={{ marginTop: '2rem' }}>
            <div className={styles.formGroup}>
                <label htmlFor="pref-currency">{t('settings.preferences', 'currencyLabel')}</label>
                <select
                    id="pref-currency"
                    className="form-input"
                    value={currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                    disabled={isUpdating}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="CZK">CZK (Kč)</option>
                    <option value="GBP">GBP (£)</option>
                </select>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {t('settings.preferences', 'currencyDesc')}
                </p>
            </div>

            <div className={styles.formGroup} style={{ marginTop: '1.5rem' }}>
                <label htmlFor="pref-theme">{t('settings.preferences', 'themeLabel')}</label>
                <select
                    id="pref-theme"
                    className="form-input"
                    value={theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    disabled={isUpdating}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Default</option>
                </select>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                    {t('settings.preferences', 'themeDesc')}
                </p>
            </div>
        </div>
    );
}
