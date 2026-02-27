import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import AccountForm from "./AccountForm";
import styles from "./settings.module.css";

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth || '', null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Account Information</h2>
                <p className={styles.contentSubtitle}>Update your personal details below.</p>
            </div>

            <AccountForm initialName={user?.name || ''} email={user?.email || ''} />
        </div>
    );
}
