import Link from "next/link";
import styles from "./settings.module.css";
import React from "react";
import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import { redirect } from "next/navigation";
import SidebarNav from "./SidebarNav";

export default async function SettingsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. Authenticate user
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) {
        redirect('/login');
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);

    if (!pb.authStore.isValid) {
        redirect('/login');
    }

    let user;
    try {
        await pb.collection('users').authRefresh();
        user = pb.authStore.model;
    } catch (err) {
        redirect('/login');
    }

    if (!user) {
        redirect('/login');
    }

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <h1 className={styles.sidebarTitle}>Settings</h1>
                <SidebarNav />
            </aside>
            <main className={styles.content}>
                {children}
            </main>
        </div>
    );
}
