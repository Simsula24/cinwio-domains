import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import styles from "../settings.module.css";
import { redirect } from "next/navigation";
import { getTranslation } from "../../i18n";
import EmailForm from "./EmailForm";
import PasswordForm from "./PasswordForm";

export default async function SecurityPage() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) redirect('/login');

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    const lang = user?.language || 'en';
    const t = (section: string, key: string) => getTranslation(lang, section, key);

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>{t('settings.security', 'title')}</h2>
                <p className={styles.contentSubtitle}>{t('settings.security', 'subtitle')}</p>
            </div>

            <EmailForm
                initialEmail={user?.email || ''}
                initialSecondaryEmail={user?.secondaryEmail || ''}
                initialSecondaryEmailVerified={user?.secondaryEmailVerified || false}
            />

            <PasswordForm />
        </div>
    );
}
