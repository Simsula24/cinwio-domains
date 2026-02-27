import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import NotificationToggles from "./NotificationToggles";
import styles from "../settings.module.css";
import { redirect } from "next/navigation";

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

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>Notification Preferences</h2>
                <p className={styles.contentSubtitle}>Control how and when we send you emails.</p>
            </div>

            <NotificationToggles
                initialMarketing={marketingEmails}
                initialBilling={billingEmails}
            />

            <div className={styles.warningBlock}>
                <h3>Need to add fields to database?</h3>
                <p>If these toggles throw an error when clicked, the DB is missing the columns.</p>
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>marketingEmails (Bool)</code>
                <br /><br />
                <code style={{ background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>billingEmails (Bool)</code>
            </div>
        </div>
    );
}
