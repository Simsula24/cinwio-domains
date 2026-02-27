"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./settings.module.css";

export default function SidebarNav() {
    const pathname = usePathname();

    const sections = [
        { name: "Account Info", path: "/settings" },
        { name: "Security", path: "/settings/security" },
        { name: "Notifications", path: "/settings/notifications" },
        { name: "Preferences", path: "/settings/preferences" },
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
