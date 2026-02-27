import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import LanguageSelector from "./LanguageSelector";
import styles from "../settings.module.css";
import { redirect } from "next/navigation";

export default async function PreferencesPage() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) redirect('/login');

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    const currentLanguage = user?.language || 'en';

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Global Preferences</h2>
                <p className={styles.contentSubtitle}>Customize your dashboard experience.</p>
            </div>

            <LanguageSelector initialLanguage={currentLanguage} />

            <div className={styles.warningBlock}>
                <h3>Database Config</h3>
                <p>Ensure your PocketBase <code>users</code> collection contains a string or select field named <code>language</code> if this toggle results in a database schema error.</p>
            </div>
        </div>
    );
}
