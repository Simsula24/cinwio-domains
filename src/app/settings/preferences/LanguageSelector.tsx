"use client";

import { useState } from "react";
import styles from "../settings.module.css";
import { updateLanguage } from "../../actions/settings";

export default function LanguageSelector({ initialLanguage }: { initialLanguage: string }) {
    const [language, setLanguage] = useState(initialLanguage);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleLanguageChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLang = e.target.value;
        const oldLang = language;

        setIsUpdating(true);
        setLanguage(newLang); // Optimistic UI update

        const res = await updateLanguage(newLang);

        if (res.error) {
            alert(res.error);
            setLanguage(oldLang); // Revert on failure
        }

        setIsUpdating(false);
    };

    return (
        <div className={styles.formGroup}>
            <label htmlFor="language">Dashboard Language</label>
            <select
                id="language"
                name="language"
                className="form-input"
                value={language}
                onChange={handleLanguageChange}
                disabled={isUpdating}
                style={{ width: '100%', maxWidth: '300px' }}
            >
                <option value="en">English (US)</option>
                <option value="cs">Čeština (CS)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="de">Deutsch (DE)</option>
            </select>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {isUpdating ? 'Saving preference...' : 'Select your preferred language for the reseller panel.'}
            </p>
        </div>
    );
}
