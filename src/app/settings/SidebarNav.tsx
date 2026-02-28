"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./settings.module.css";
import { useI18n } from "../I18nProvider";

export default function SidebarNav() {
    const pathname = usePathname();
    const { t } = useI18n();

    const sections = [
        { name: t('settings.sidebar', 'accountInfo'), path: "/settings" },
        { name: t('settings.sidebar', 'security'), path: "/settings/security" },
        { name: t('settings.sidebar', 'notifications'), path: "/settings/notifications" },
        { name: t('settings.sidebar', 'preferences'), path: "/settings/preferences" },
    ];

    return (
        <ul className={styles.navList}>
            {sections.map((section) => (
                <li key={section.path}>
                    <Link
                        href={section.path}
                        className={`${styles.navItem} ${pathname === section.path ? styles.navItemActive : ''}`}
                    >
                        {section.name}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
