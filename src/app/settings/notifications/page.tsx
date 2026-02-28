import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import NotificationToggles from "./NotificationToggles";
import styles from "../settings.module.css";
import { redirect } from "next/navigation";
import { getTranslation } from "../../i18n";

export default async function NotificationsPage() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) redirect('/login');

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;

    // Safety fallback - if properties don't exist yet on DB schema
    const marketingEmails = user?.marketingEmails ?? true;
    const billingEmails = user?.billingEmails ?? true;
    const lang = user?.language || 'en';
    const t = (section: string, key: string) => getTranslation(lang, section, key);

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>{t('settings.notifications', 'title')}</h2>
                <p className={styles.contentSubtitle}>{t('settings.notifications', 'subtitle')}</p>
            </div>

            <NotificationToggles
                initialMarketing={marketingEmails}
                initialBilling={billingEmails}
            />

        </div>
    );
}
