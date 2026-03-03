import { cookies } from "next/headers";
import PocketBase from "pocketbase";
import LanguageSelector from "./LanguageSelector";
import PreferencesForm from "./PreferencesForm";
import styles from "../settings.module.css";
import { redirect } from "next/navigation";
import { getTranslation } from "../../i18n";

export default async function PreferencesPage() {
    const cookieStore = await cookies();
    const pbAuth = cookieStore.get('pb_auth')?.value;

    if (!pbAuth) redirect('/login');

    const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://domaindb.cinwio.com/');
    pb.authStore.save(pbAuth, null);
    await pb.collection('users').authRefresh();

    const user = pb.authStore.model;
    const currentLanguage = user?.language || 'en';
    const currentCurrency = user?.currency || 'USD';
    const currentTheme = user?.theme || 'system';
    const t = (section: string, key: string) => getTranslation(currentLanguage, section, key);

    return (
        <div>
            <div className={styles.contentHeader}>
                <h2>{t('settings.preferences', 'title')}</h2>
                <p className={styles.contentSubtitle}>{t('settings.preferences', 'subtitle')}</p>
            </div>

            <LanguageSelector initialLanguage={currentLanguage} />

            <PreferencesForm
                initialCurrency={currentCurrency}
                initialTheme={currentTheme}
            />

        </div>
    );
}
