"use client";

import { useState } from "react";
import styles from "../settings.module.css";
import { toggleUserNotification } from "../../actions/settings";

export default function NotificationToggles({
    initialMarketing,
    initialBilling
}: {
    initialMarketing: boolean,
    initialBilling: boolean
}) {
    const [marketing, setMarketing] = useState(initialMarketing);
    const [billing, setBilling] = useState(initialBilling);
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async (type: 'marketingEmails' | 'billingEmails', currentValue: boolean) => {
        setIsUpdating(true);
        const newValue = !currentValue;

        if (type === 'marketingEmails') setMarketing(newValue);
        if (type === 'billingEmails') setBilling(newValue);

        const res = await toggleUserNotification(type, newValue);
        if (res.error) {
            alert(res.error);
            // Revert on error
            if (type === 'marketingEmails') setMarketing(currentValue);
            if (type === 'billingEmails') setBilling(currentValue);
        }
        setIsUpdating(false);
    };

    return (
        <div>
            <div className={styles.toggleWrapper}>
                <div className={styles.toggleInfo}>
                    <span className={styles.toggleTitle}>Marketing & Promos</span>
                    <span className={styles.toggleDesc}>Receive offers, tutorials, and domain sales updates.</span>
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
                    <span className={styles.toggleTitle}>Billing Alerts</span>
                    <span className={styles.toggleDesc}>Receive notifications about upcoming payments and expiring domains.</span>
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
        </div>
    );
}
