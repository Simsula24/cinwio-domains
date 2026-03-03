"use client";

import { useState } from "react";
import styles from "../settings.module.css";
import { toggleUserNotification } from "../../actions/settings";
import { useI18n } from "../../I18nProvider";

export default function NotificationToggles({
    initialMarketing,
    initialBilling,
    initialAccountSettings,
    initialServiceStatus
}: {
    initialMarketing: boolean,
    initialBilling: boolean,
    initialAccountSettings: boolean,
    initialServiceStatus: boolean
}) {
    const [marketing, setMarketing] = useState(initialMarketing);
    const [billing, setBilling] = useState(initialBilling);
    const [accountSettings, setAccountSettings] = useState(initialAccountSettings);
    const [serviceStatus, setServiceStatus] = useState(initialServiceStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const { t } = useI18n();

    const handleToggle = async (type: 'marketingEmails' | 'billingEmails' | 'accountSettingsEmails' | 'serviceStatusEmails', currentValue: boolean) => {
        setIsUpdating(true);
        const newValue = !currentValue;

        if (type === 'marketingEmails') setMarketing(newValue);
        if (type === 'billingEmails') setBilling(newValue);
        if (type === 'accountSettingsEmails') setAccountSettings(newValue);
        if (type === 'serviceStatusEmails') setServiceStatus(newValue);

        const res = await toggleUserNotification(type, newValue);
        if (res.error) {
            alert(res.error);
            // Revert on error
            if (type === 'marketingEmails') setMarketing(currentValue);
            if (type === 'billingEmails') setBilling(currentValue);
            if (type === 'accountSettingsEmails') setAccountSettings(currentValue);
            if (type === 'serviceStatusEmails') setServiceStatus(currentValue);
        }
        setIsUpdating(false);
    };

    return (
        <div>
            <div className={styles.toggleWrapper}>
                <div className={styles.toggleInfo}>
                    <span className={styles.toggleTitle}>{t('settings.notifications', 'marketingTitle')}</span>
                    <span className={styles.toggleDesc}>{t('settings.notifications', 'marketingDesc')}</span>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={marketing}
                        onChange={() => handleToggle('marketingEmails', marketing)}
                        disabled={isUpdating}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.toggleWrapper}>
                <div className={styles.toggleInfo}>
                    <span className={styles.toggleTitle}>{t('settings.notifications', 'billingTitle')}</span>
                    <span className={styles.toggleDesc}>{t('settings.notifications', 'billingDesc')}</span>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={billing}
                        onChange={() => handleToggle('billingEmails', billing)}
                        disabled={isUpdating}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.toggleWrapper}>
                <div className={styles.toggleInfo}>
                    <span className={styles.toggleTitle}>{t('settings.notifications', 'accountSettingsTitle')}</span>
                    <span className={styles.toggleDesc}>{t('settings.notifications', 'accountSettingsDesc')}</span>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={accountSettings}
                        onChange={() => handleToggle('accountSettingsEmails', accountSettings)}
                        disabled={isUpdating}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>

            <div className={styles.toggleWrapper}>
                <div className={styles.toggleInfo}>
                    <span className={styles.toggleTitle}>{t('settings.notifications', 'serviceStatusTitle')}</span>
                    <span className={styles.toggleDesc}>{t('settings.notifications', 'serviceStatusDesc')}</span>
                </div>
                <label className={styles.switch}>
                    <input
                        type="checkbox"
                        checked={serviceStatus}
                        onChange={() => handleToggle('serviceStatusEmails', serviceStatus)}
                        disabled={isUpdating}
                    />
                    <span className={styles.slider}></span>
                </label>
            </div>
        </div>
    );
}
